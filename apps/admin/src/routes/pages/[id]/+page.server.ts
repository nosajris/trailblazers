import { error, fail } from '@sveltejs/kit';
import { pageSectionSchema, parseForm, summarizeErrors, toSectionConfig } from '@trailblazers/core';
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

	return { page: result.page, sections: result.sections };
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

		await services.pages.deleteSection(id);
		await services.auditLogs.logAction(
			'DELETE_PAGE_SECTION',
			'PAGE',
			String(params.id),
			`Removed section ${id} from page ${params.id}`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
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
