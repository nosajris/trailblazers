import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async () => {
	const faqs = await services.faq.getAllForAdmin();
	return { faqs };
};

export const actions: Actions = {
	saveFaq: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') ? Number(form.get('id')) : undefined;
		const question = form.get('question')?.toString().trim();
		const answer = form.get('answer')?.toString().trim();
		const status = form.get('status')?.toString().trim() || 'PUBLISHED';
		const order = form.get('order') ? Number(form.get('order')) : 0;

		if (!question || !answer) {
			return fail(400, { error: 'FAQ question and answer are required' });
		}

		const saved = await services.faq.saveFaq({
			id,
			question,
			answer,
			status,
			order
		});

		await services.auditLogs.logAction(
			id ? 'UPDATE_FAQ' : 'CREATE_FAQ',
			'FAQ',
			String(saved.id),
			`Saved FAQ: ${saved.question}`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
	},

	deleteFaq: async ({ request, locals }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (id) {
			await services.faq.deleteFaq(id);
			await services.auditLogs.logAction(
				'DELETE_FAQ',
				'FAQ',
				String(id),
				`Deleted FAQ ID: ${id}`,
				locals.user?.id,
				locals.user?.fullName
			);
		}
		return { success: true };
	}
};
