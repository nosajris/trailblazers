import { services } from '$lib/server/services';
import { fail } from '@sveltejs/kit';
import { PolicyError, joinGroupSchema, logger, parseForm, summarizeErrors } from '@trailblazers/core';
import { cacheHeaders } from '$lib/server/cache';
import {
	consumeFormSubmission,
	isHoneypotTripped,
	throttleMessage
} from '$lib/server/rate-limit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders(cacheHeaders('content'));

	const [settings, groups] = await Promise.all([
		services.settings.getBundle(),
		services.groups.listPublished()
	]);
	return { settings, groups };
};

export const actions: Actions = {
	/**
	 * Public "I'd like to join" form.
	 *
	 * Groups were browse-only, so someone who wanted in had to find the contact
	 * page and describe which group they meant.
	 */
	joinGroup: async ({ request, getClientAddress }) => {
		const form = await request.formData();

		if (isHoneypotTripped(form)) {
			logger.warn('GroupInterest', 'honeypot tripped', { address: getClientAddress() });
			return { success: true };
		}

		const throttle = consumeFormSubmission(getClientAddress(), 'group-join');
		if (!throttle.allowed) {
			return fail(429, { error: throttleMessage(throttle.retryAfterSeconds) });
		}

		const parsed = parseForm(form, joinGroupSchema);
		if (!parsed.success) {
			return fail(400, { error: summarizeErrors(parsed.errors), errors: parsed.errors });
		}

		try {
			const { groupName } = await services.groups.expressInterest(parsed.data);

			// A leader has to actually follow up, so raise a task as well as
			// emailing the office.
			await services.tasks.createTask(
				`Group interest: ${parsed.data.fullName} — ${groupName}`,
				`Contact ${parsed.data.email} about joining ${groupName}.`,
				'GROUP',
				String(parsed.data.groupId)
			);

			await services.email
				.notifyOffice(
					`New group interest: ${groupName}`,
					`${parsed.data.fullName} (${parsed.data.email}) would like to join ${groupName}.` +
						(parsed.data.message ? `\n\nTheir message:\n${parsed.data.message}` : ''),
					parsed.data.email
				)
				.catch(() => undefined);

			return { success: true, groupName };
		} catch (err) {
			if (err instanceof PolicyError) return fail(409, { error: err.message });

			logger.error('GroupInterest', 'failed', {
				message: err instanceof Error ? err.message : String(err)
			});
			return fail(500, { error: 'We could not send that just now. Please try again.' });
		}
	}
};
