import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async () => {
	const testimonials = await services.testimonials.getAllForAdmin();
	return { testimonials };
};

export const actions: Actions = {
	saveTestimonial: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') ? Number(form.get('id')) : undefined;
		const name = form.get('name')?.toString().trim();
		const role = form.get('role')?.toString().trim();
		const imageUrl = form.get('imageUrl')?.toString().trim();
		const content = form.get('content')?.toString().trim();
		const rating = form.get('rating') ? Number(form.get('rating')) : 5;
		const isFeatured = form.get('isFeatured') === 'on' || form.get('isFeatured') === 'true';
		const status = form.get('status')?.toString().trim() || 'PUBLISHED';
		const sortOrder = form.get('sortOrder') ? Number(form.get('sortOrder')) : 0;

		if (!name || !content) {
			return fail(400, { error: 'Name and testimonial content are required' });
		}

		const saved = await services.testimonials.saveTestimonial({
			id,
			name,
			role,
			imageUrl,
			content,
			rating,
			isFeatured,
			status,
			sortOrder
		});

		await services.auditLogs.logAction(
			id ? 'UPDATE_TESTIMONIAL' : 'CREATE_TESTIMONIAL',
			'TESTIMONIAL',
			String(saved.id),
			`Saved testimonial by: ${saved.name}`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
	},

	deleteTestimonial: async ({ request, locals }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (id) {
			await services.testimonials.deleteTestimonial(id);
			await services.auditLogs.logAction(
				'DELETE_TESTIMONIAL',
				'TESTIMONIAL',
				String(id),
				`Deleted testimonial ID: ${id}`,
				locals.user?.id,
				locals.user?.fullName
			);
		}
		return { success: true };
	},

	/**
	 * Staff upload for a testimonial's photo. Same shape as the other
	 * `uploadImage` actions in this app — the client sets the returned URL
	 * into the modal's own field.
	 */
	uploadImage: async ({ request, locals }) => {
		const form = await request.formData();
		const file = form.get('file');
		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { error: 'Choose an image to upload.' });
		}

		try {
			const buffer = Buffer.from(await file.arrayBuffer());
			const asset = await services.media.upload(
				{ buffer, mimeType: file.type, size: file.size },
				locals.user?.id
			);
			return { success: true, uploadedUrl: asset.url };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'That upload failed.';
			return fail(400, { error: message });
		}
	}
};
