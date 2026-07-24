import { services } from '$lib/server/services';
import { fail } from '@sveltejs/kit';

export const load = async () => ({
	settings: await services.settings.getBundle()
});

export const actions = {
	default: async ({ request }: { request: Request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString();
		const email = data.get('email')?.toString();
		const message = data.get('message')?.toString();

		if (!name || !email || !message) {
			return fail(400, { missing: true });
		}

		try {
			await services.inquiries.createGeneral({ name, email, message });
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { error: 'Database error' });
		}
	}
};
