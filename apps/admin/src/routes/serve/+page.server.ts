import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async () => {
	const items = await services.serve.getAllForAdmin();
	return { items };
};

export const actions: Actions = {
	saveServeContent: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') ? Number(form.get('id')) : undefined;
		const headline = form.get('headline')?.toString().trim();
		const subheadline = form.get('subheadline')?.toString().trim();
		const body = form.get('body')?.toString().trim();
		const ctaLabel = form.get('ctaLabel')?.toString().trim();
		const ctaHref = form.get('ctaHref')?.toString().trim();
		const imageUrl = form.get('imageUrl')?.toString().trim();
		const status = form.get('status')?.toString().trim() || 'PUBLISHED';
		const sortOrder = form.get('sortOrder') ? Number(form.get('sortOrder')) : 0;

		if (!headline) {
			return fail(400, { error: 'Headline is required' });
		}

		const saved = await services.serve.saveServeContent({
			id,
			headline,
			subheadline,
			body,
			ctaLabel,
			ctaHref,
			imageUrl,
			status,
			sortOrder
		});

		await services.auditLogs.logAction(
			id ? 'UPDATE_SERVE_SECTION' : 'CREATE_SERVE_SECTION',
			'SERVE',
			String(saved.id),
			`Saved serve section: ${saved.headline}`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
	},

	deleteServeContent: async ({ request, locals }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (id) {
			await services.serve.deleteServeContent(id);
			await services.auditLogs.logAction(
				'DELETE_SERVE_SECTION',
				'SERVE',
				String(id),
				`Deleted serve section ID: ${id}`,
				locals.user?.id,
				locals.user?.fullName
			);
		}
		return { success: true };
	},

	/**
	 * Staff upload for this field's image. Same shape as the other
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
