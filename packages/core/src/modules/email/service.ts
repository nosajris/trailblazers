/**
 * Transactional email.
 *
 * This was a stub that only wrote to the log, so nothing the site collected
 * ever reached anybody: contact messages, volunteer applications and visit
 * registrations all landed in the database and notified no one.
 *
 * It now sends through Resend over plain `fetch` — no SDK, so no dependency to
 * keep current. Without `RESEND_API_KEY` it falls back to logging, which keeps
 * local development and CI working and makes this safe to merge before the key
 * exists.
 */

import { logger } from '../../logger.js';

export type EmailConfig = {
	/** Resend API key. Absent means log-only mode. */
	apiKey: string | undefined;
	/** Verified sender, e.g. 'Trailblazers <hello@paoz.org>'. */
	from: string | undefined;
	/** Where staff notifications go. */
	officeAddress: string | undefined;
};

export type SendResult = {
	success: boolean;
	/** True when the message was logged rather than sent. */
	simulated: boolean;
	messageId?: string;
	error?: string;
};

export type EmailMessage = {
	to: string;
	subject: string;
	/** Plain text. Always provide it: some clients prefer it, and it is the accessible fallback. */
	text: string;
	html?: string;
	replyTo?: string;
};

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

/** Minimal HTML escaping for values interpolated into an email body. */
function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function createEmailService(config: EmailConfig = { apiKey: undefined, from: undefined, officeAddress: undefined }) {
	const enabled = Boolean(config.apiKey && config.from);

	/**
	 * Sends one message.
	 *
	 * Never throws: a failed notification must not fail the visitor's form
	 * submission. The caller gets a result and the failure is logged.
	 */
	async function send(message: EmailMessage): Promise<SendResult> {
		if (!enabled) {
			logger.info('EMAIL', 'simulated send (no RESEND_API_KEY configured)', {
				subject: message.subject
			});
			return { success: true, simulated: true, messageId: `simulated_${Date.now()}` };
		}

		try {
			const response = await fetch(RESEND_ENDPOINT, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${config.apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					from: config.from,
					to: [message.to],
					subject: message.subject,
					text: message.text,
					...(message.html ? { html: message.html } : {}),
					...(message.replyTo ? { reply_to: message.replyTo } : {})
				})
			});

			if (!response.ok) {
				// Log the status, not the body: provider errors can echo the
				// recipient address and other details back at us.
				logger.error('EMAIL', 'provider rejected the message', {
					status: response.status,
					subject: message.subject
				});
				return { success: false, simulated: false, error: `Provider returned ${response.status}` };
			}

			const body = (await response.json()) as { id?: string };
			logger.info('EMAIL', 'sent', { subject: message.subject });

			return { success: true, simulated: false, messageId: body.id };
		} catch (err) {
			logger.error('EMAIL', 'send failed', {
				message: err instanceof Error ? err.message : String(err)
			});
			return { success: false, simulated: false, error: 'Send failed' };
		}
	}

	return {
		send,
		isEnabled: () => enabled,

		async sendWelcomeEmail(toEmail: string, fullName: string) {
			return send({
				to: toEmail,
				subject: 'Welcome to Trailblazers',
				text:
					`Hi ${fullName},\n\n` +
					`Thanks for connecting with PAOZ Trailblazers. We are glad you are here.\n\n` +
					`If you have any questions, just reply to this email.\n\n` +
					`— The Trailblazers team`,
				html:
					`<p>Hi ${escapeHtml(fullName)},</p>` +
					`<p>Thanks for connecting with PAOZ Trailblazers. We are glad you are here.</p>` +
					`<p>If you have any questions, just reply to this email.</p>` +
					`<p>— The Trailblazers team</p>`
			});
		},

		async sendVolunteerConfirmation(toEmail: string, fullName: string, team: string) {
			return send({
				to: toEmail,
				subject: `Your application to serve on ${team}`,
				text:
					`Hi ${fullName},\n\n` +
					`We have received your application to serve on the ${team} team. ` +
					`Someone from the team will be in touch soon.\n\n` +
					`— The Trailblazers team`,
				html:
					`<p>Hi ${escapeHtml(fullName)},</p>` +
					`<p>We have received your application to serve on the <strong>${escapeHtml(team)}</strong> team. ` +
					`Someone from the team will be in touch soon.</p>` +
					`<p>— The Trailblazers team</p>`
			});
		},

		/** Confirms a seat, or explains the waitlist. */
		async sendEventRegistration(
			toEmail: string,
			fullName: string,
			eventTitle: string,
			status: 'CONFIRMED' | 'WAITLIST'
		) {
			const confirmed = status === 'CONFIRMED';

			return send({
				to: toEmail,
				subject: confirmed
					? `You're registered for ${eventTitle}`
					: `You're on the waitlist for ${eventTitle}`,
				text:
					`Hi ${fullName},\n\n` +
					(confirmed
						? `Your place at ${eventTitle} is confirmed. We look forward to seeing you.`
						: `${eventTitle} is currently full, so we have added you to the waitlist. ` +
							`We will email you if a place opens up.`) +
					`\n\n— The Trailblazers team`,
				html:
					`<p>Hi ${escapeHtml(fullName)},</p>` +
					(confirmed
						? `<p>Your place at <strong>${escapeHtml(eventTitle)}</strong> is confirmed. We look forward to seeing you.</p>`
						: `<p><strong>${escapeHtml(eventTitle)}</strong> is currently full, so we have added you to the waitlist. ` +
							`We will email you if a place opens up.</p>`) +
					`<p>— The Trailblazers team</p>`
			});
		},

		/**
		 * Tells the office that someone submitted a form.
		 *
		 * Replies go to the visitor, so staff can answer without copying the
		 * address across by hand.
		 */
		async notifyOffice(subject: string, body: string, replyTo?: string) {
			if (!config.officeAddress) {
				logger.warn('EMAIL', 'no office address configured; notification skipped', { subject });
				return { success: false, simulated: true, error: 'No office address configured' };
			}

			return send({
				to: config.officeAddress,
				subject,
				text: body,
				html: `<pre style="font-family:inherit;white-space:pre-wrap">${escapeHtml(body)}</pre>`,
				replyTo
			});
		}
	};
}
