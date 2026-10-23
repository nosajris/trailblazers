import { fail } from '@sveltejs/kit';
import { services } from '$lib/server/services';
import { guardFormSubmission, issueFormToken } from '$lib/server/form-guard';
import type { PageServerLoad, Actions } from './$types';
import { cacheHeaders } from '$lib/server/cache';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders(cacheHeaders('content'));

	const [settings, section] = await Promise.all([
		services.settings.getBundle(),
		services.serve.getPrimaryPublished()
	]);
	return { settings, section, formToken: issueFormToken('serve') };
};

export const actions: Actions = {
	applyToServe: async ({ request, getClientAddress }) => {
		const form = await request.formData();

		const guard = await guardFormSubmission(form, 'serve', getClientAddress());
		if (!guard.ok) {
			// A bot tripped the decoy field: answer as a success and drop it,
			// rather than naming the field that gave it away.
			if (guard.pretendSuccess) return { success: true };
			return fail(guard.status, { error: guard.message });
		}

		const fullName = form.get('fullName')?.toString().trim();
		const email = form.get('email')?.toString().trim();
		const team = form.get('team')?.toString().trim() || 'General Serving Team';

		if (!fullName || !email) {
			return fail(400, { error: 'Name and email are required to submit volunteer application.' });
		}

		const saved = await services.inquiries.createInquiry({
			fullName,
			email,
			type: 'SERVE',
			message: `Volunteer Serve Application for Team: ${team}`
		});

		await services.tasks.createTask(
			`New Volunteer Application: ${fullName}`,
			`Contact ${email} regarding joining the ${team} serve team.`,
			'INQUIRY',
			String(saved.id)
		);

		return { success: true };
	}
};
