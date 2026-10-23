import { error, fail } from '@sveltejs/kit';
import {
	createPagePreviewToken,
	pageSectionSchema,
	parseForm,
	previewPath,
	summarizeErrors,
	toSectionConfig
} from '@trailblazers/core';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';
import { requireSection } from '$lib/server/auth.js';

/**
 * Section editor for one CMS page.
 *
 * Pages could be created in the portal but nothing could be put on them, so
 * every page was an empty shell and the public homepage rendered hardcoded
 * fallback blocks instead. This is what makes a page's content editable.
 */
export const load: PageServerLoad = async ({ params, locals }) => {
	requireSection(locals.user, 'content');

	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) error(404, 'No such page.');

	const result = await services.pages.getPageForAdmin(id);
	if (!result) error(404, 'No such page.');

	const previewBlocks = await services.pages.composePreviewPage(id);

	// A link someone outside the portal can open — a pastor approving wording on
	// their phone — without being given a staff account. Signed and expiring;
	// see `modules/pages/publishing.ts`.
	const secret = process.env.SECRET_KEY;
	const previewLink = secret ? previewPath(id, createPagePreviewToken(secret, id)) : null;

	return {
		page: result.page,
		sections: result.sections,
		changes: result.changes,
		previewBlocks,
		previewLink
	};
};

export const actions: Actions = {
	saveSection: async ({ request, params, locals }) => {
		requireSection(locals.user, 'content');

		const form = await request.formData();
		const pageId = Number(params.id);
		const sectionId = form.get('id') ? Number(form.get('id')) : undefined;

		const parsed = parseForm(form, pageSectionSchema);
		if (!parsed.success) {
			return fail(400, { error: summarizeErrors(parsed.errors), errors: parsed.errors });
		}

		const saved = await services.pages.saveSection({
			id: sectionId,
			pageId,
			sectionType: parsed.data.sectionType,
			status: parsed.data.status,
			config: toSectionConfig(parsed.data)
		});

		await services.auditLogs.logAction(
			sectionId ? 'UPDATE_PAGE_SECTION' : 'CREATE_PAGE_SECTION',
			'PAGE',
			String(pageId),
			`${sectionId ? 'Updated' : 'Added'} ${parsed.data.sectionType} section on page ${pageId}`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true, savedId: saved?.id };
	},

	deleteSection: async ({ request, params, locals }) => {
		requireSection(locals.user, 'content');

		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!id) return fail(400, { error: 'That section could not be found.' });

		// A published section is only marked: it keeps rendering until the next
		// publish, so a removal waits like every other edit.
		const outcome = await services.pages.deleteSection(id);
		await services.auditLogs.logAction(
			'DELETE_PAGE_SECTION',
			'PAGE',
			String(params.id),
			outcome === 'marked'
				? `Marked section ${id} on page ${params.id} for removal at the next publish`
				: `Removed unpublished section ${id} from page ${params.id}`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
	},

	/**
	 * Drag-to-reorder from the section list. `order` is a comma-separated
	 * list of section ids in their new top-to-bottom order; every id already
	 * on the page must appear exactly once, or the drop is rejected rather
	 * than silently losing a section.
	 */
	reorderSections: async ({ request, params, locals }) => {
		requireSection(locals.user, 'content');

		const form = await request.formData();
		const pageId = Number(params.id);
		const raw = form.get('order')?.toString() ?? '';
		const orderedIds = raw
			.split(',')
			.map((part) => Number(part))
			.filter((n) => Number.isInteger(n) && n > 0);

		const current = await services.pages.getPageForAdmin(pageId);
		if (!current) return fail(404, { error: 'That page could not be found.' });

		const currentIds = new Set(current.sections.map((s) => s.id));
		const sameSet =
			orderedIds.length === currentIds.size && orderedIds.every((id) => currentIds.has(id));
		if (!sameSet) {
			return fail(400, { error: 'That reorder could not be applied.' });
		}

		await services.pages.reorderSections(pageId, orderedIds);
		await services.auditLogs.logAction(
			'REORDER_PAGE_SECTIONS',
			'PAGE',
			String(pageId),
			`Reordered sections on page ${pageId}`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
	},

	/**
	 * Staff upload for an image-bearing field (the hero background today).
	 * Returns the processed, Blob-hosted URL; the client sets it into the
	 * field itself rather than this action touching the section — so it
	 * works the same way for a brand-new, not-yet-saved section.
	 */
	uploadImage: async ({ request, locals }) => {
		requireSection(locals.user, 'content');

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
	},

	moveSection: async ({ request, locals }) => {
		requireSection(locals.user, 'content');

		const form = await request.formData();
		const id = Number(form.get('id'));
		const direction = form.get('direction')?.toString();

		if (!id || (direction !== 'up' && direction !== 'down')) {
			return fail(400, { error: 'That move could not be applied.' });
		}

		await services.pages.moveSection(id, direction);
		return { success: true };
	},

	/** Takes back a removal that has not been published yet. */
	restoreSection: async ({ request, locals }) => {
		requireSection(locals.user, 'content');

		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!id) return fail(400, { error: 'That section could not be restored.' });

		await services.pages.restoreSection(id);
		return { success: true };
	},

	/**
	 * Makes every waiting change live, in one transaction. All of it or none —
	 * see `publishPage` in the composer.
	 */
	publishPage: async ({ params, locals }) => {
		requireSection(locals.user, 'content');

		const pageId = Number(params.id);
		const current = await services.pages.getPageForAdmin(pageId);
		if (!current) return fail(404, { error: 'That page could not be found.' });

		await services.pages.publishPage(pageId);
		await services.auditLogs.logAction(
			'PUBLISH_PAGE',
			'PAGE',
			String(pageId),
			`Published page ${pageId} (${current.changes.total} change${current.changes.total === 1 ? '' : 's'})`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true, published: true };
	},

	/**
	 * Sets or clears the time a page goes live by itself. The time arrives as
	 * the browser's `datetime-local` value, which carries no zone — it is read
	 * as Harare time, since that is where whoever typed it is. Africa/Harare is
	 * UTC+2 all year with no daylight saving, so the fixed offset is correct
	 * rather than merely convenient.
	 */
	schedulePage: async ({ request, params, locals }) => {
		requireSection(locals.user, 'content');

		const form = await request.formData();
		const pageId = Number(params.id);
		const raw = form.get('publishAt')?.toString().trim() ?? '';

		if (raw === '') {
			await services.pages.schedulePage(pageId, null);
			return { success: true };
		}

		const parsed = new Date(`${raw}:00+02:00`);
		if (Number.isNaN(parsed.getTime())) {
			return fail(400, { error: 'That date could not be read.' });
		}

		await services.pages.schedulePage(pageId, parsed);
		await services.auditLogs.logAction(
			'SCHEDULE_PAGE',
			'PAGE',
			String(pageId),
			`Scheduled page ${pageId} to publish at ${parsed.toISOString()}`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
	},

	/** Publishing or unpublishing one section, without opening the editor. */
	toggleSection: async ({ request, locals }) => {
		requireSection(locals.user, 'content');

		const form = await request.formData();
		const id = Number(form.get('id'));
		const status = form.get('status')?.toString() === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';

		if (!id) return fail(400, { error: 'That section could not be updated.' });

		await services.pages.setSectionStatus(id, status);
		return { success: true };
	}
};
