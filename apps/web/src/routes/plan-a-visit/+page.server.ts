import { fail } from '@sveltejs/kit';
import { services } from '$lib/server/services';
import { logger } from '@trailblazers/core';
import { guardFormSubmission, issueFormToken } from '$lib/server/form-guard';
import type { PageServerLoad, Actions } from './$types';
import { cacheHeaders } from '$lib/server/cache';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders(cacheHeaders('static'));

	const settings = await services.settings.getBundle();
	return { settings, formToken: issueFormToken('plan-a-visit') };
};

export const actions: Actions = {
	registerVipVisit: async ({ request, getClientAddress }) => {
		const form = await request.formData();

		const guard = await guardFormSubmission(form, 'plan-a-visit', getClientAddress());
		if (!guard.ok) {
			// A bot tripped the decoy field: answer as a success and drop it,
			// rather than naming the field that gave it away.
			if (guard.pretendSuccess) return { success: true };
			return fail(guard.status, { error: guard.message });
		}

		const fullName = form.get('fullName')?.toString().trim();
		const email = form.get('email')?.toString().trim();
		const phone = form.get('phone')?.toString().trim() || '';
		const preferredDate = form.get('preferredDate')?.toString().trim() || '';

		if (!fullName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, { error: 'Please enter your name and a valid email address.' });
		}
		if (fullName.length > 120 || phone.length > 40 || !/^(\d{4}-\d{2}-\d{2})?$/.test(preferredDate)) {
			return fail(400, { error: 'Some details look too long or invalid. Please check and try again.' });
		}
		const dateNote = preferredDate ? ` for ${preferredDate}` : '';

		// Save inquiry (phone is carried in the follow-up task; inquiries do not store it)
		const saved = await services.inquiries.createInquiry({
			fullName,
			email,
			phone,
			type: 'VISITOR',
			message: `VIP Visit Registration${dateNote}`
		});

		// Pre-visit prep, plus the post-visit nurture sequence (day 1/7/30) —
		// see `createFollowUpSequence` in tasks/service.ts. Both are
		// best-effort: a task-creation hiccup must never fail the
		// registration itself, which is already safely recorded above.
		await Promise.all([
			services.tasks.createTask(
				`Follow up with VIP Guest: ${fullName}`,
				`Contact ${email}${phone ? ` (${phone})` : ''} to prepare a welcome for their visit${dateNote}.`,
				'INQUIRY',
				String(saved.id)
			),
			services.tasks.createFollowUpSequence('INQUIRY', String(saved.id), fullName)
		]).catch((err) => {
			logger.error('PlanAVisit', 'follow-up task creation failed', {
				inquiryId: saved.id,
				message: err instanceof Error ? err.message : String(err)
			});
		});

		return { success: true };
	}
};
