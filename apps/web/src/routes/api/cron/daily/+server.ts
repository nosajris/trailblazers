import { error, json } from '@sveltejs/kit';
import { logger, weeklyDigestEmail } from '@trailblazers/core';
import { services } from '$lib/server/services';
import type { RequestHandler } from './$types';

/**
 * The one scheduled job the site needs, called once a day by a Vercel Cron
 * Job (see `vercel.json`). Does two unrelated things in the same run so a
 * Hobby-plan project — limited to daily cron jobs — doesn't need two:
 *
 * 1. Event reminders: emails everyone confirmed for an event 20-32 hours out
 *    who hasn't been reminded yet (`isDueForReminder` in registration.ts).
 *    This check is itself idempotent, so running it daily is safe.
 * 2. The weekly traffic digest: on the first run after Monday 08:00 Harare,
 *    emails the office last week's analytics (see digest.ts). A settings
 *    key marks the week it was last sent for, so a second run the same day
 *    — a retry, or the cron firing twice — never sends it twice.
 */

function requireCronSecret(request: Request): void {
	const configured = process.env.CRON_SECRET;
	if (!configured) {
		// Local/dev: no secret configured, nothing to check against. Production
		// deployments should set CRON_SECRET so this endpoint isn't open to
		// anyone who finds the URL.
		logger.warn('Cron', 'CRON_SECRET is not set; accepting this request unauthenticated');
		return;
	}
	const header = request.headers.get('authorization');
	if (header !== `Bearer ${configured}`) {
		throw error(401, 'Unauthorized');
	}
}

function whenText(eventDate: Date): string {
	const weekday = eventDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Africa/Harare' });
	const time = eventDate.toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		timeZone: 'Africa/Harare'
	});
	return `${weekday} at ${time}`;
}

async function sendEventReminders(now: Date): Promise<number> {
	const due = await services.eventRegistrations.listDueForReminders(now);
	const sentIds: number[] = [];

	for (const row of due) {
		const result = await services.email.sendEventReminder(
			row.email,
			row.fullName,
			row.eventTitle,
			whenText(row.eventDate),
			row.eventLocation
		);
		if (result.success) sentIds.push(row.registrationId);
	}

	if (sentIds.length > 0) await services.eventRegistrations.markReminded(sentIds);
	return sentIds.length;
}

async function sendWeeklyDigestIfDue(now: Date): Promise<boolean> {
	const today = services.analytics.dayOf(now.getTime());
	const isMonday = new Date(`${today}T12:00:00Z`).getUTCDay() === 1;
	if (!isMonday) return false;

	const settings = await services.settings.getBundle();
	// Off by default means on: the field only exists to let a staff member
	// switch it off in Settings, so absence (an older bundle, or never saved)
	// must not silently stop the digest.
	if (settings.siteExtras.weeklyDigestEnabled === false) return false;

	const alreadySent = await services.settings.getSetting<string>('weekly_digest_sent_for');
	if (alreadySent === today) return false;

	const [lastWeek, previousWeek] = await Promise.all([
		services.analytics.report(7, now.getTime() - 7 * 86_400_000),
		services.analytics.report(7, now.getTime() - 14 * 86_400_000)
	]);

	const siteTitle = settings.siteExtras.organizationName ?? 'Trailblazers';
	const reportUrl = process.env.ADMIN_URL ? `${process.env.ADMIN_URL}/analytics` : 'the staff analytics page';

	const email = weeklyDigestEmail(lastWeek, previousWeek, siteTitle, reportUrl);
	// Marked sent either way: a quiet week isn't retried every day until it
	// finally has traffic, which would make "once a week" mean "every day".
	await services.settings.updateSetting('weekly_digest_sent_for', today);
	if (!email) return false;

	await services.email.notifyOffice(email.subject, email.text);
	return true;
}

export const GET: RequestHandler = async ({ request }) => {
	requireCronSecret(request);

	const now = new Date();
	const [remindersSent, digestSent] = await Promise.all([
		sendEventReminders(now).catch((err) => {
			logger.error('Cron', 'event reminders failed', {
				message: err instanceof Error ? err.message : String(err)
			});
			return 0;
		}),
		sendWeeklyDigestIfDue(now).catch((err) => {
			logger.error('Cron', 'weekly digest failed', {
				message: err instanceof Error ? err.message : String(err)
			});
			return false;
		})
	]);

	return json({ ok: true, remindersSent, digestSent });
};
