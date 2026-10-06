import { fail } from '@sveltejs/kit';
import { parseForm, summarizeErrors, visitDetailsSchema } from '@trailblazers/core';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';
import { requireSection } from '$lib/server/auth.js';

export const load: PageServerLoad = async ({ locals }) => {
	requireSection(locals.user, 'settings');
	const settings = await services.settings.getBundle();
	return { settings };
};

export const actions: Actions = {
	saveSettings: async ({ request, locals }) => {
		// Actions run before layout loads, so this guard is the real one.
		requireSection(locals.user, 'settings');

		const form = await request.formData();
		const title = form.get('seoTitle')?.toString().trim();
		const description = form.get('seoDescription')?.toString().trim();
		const organizationName = form.get('organizationName')?.toString().trim();
		const givingUrl = form.get('givingUrl')?.toString().trim();
		const watchUrl = form.get('watchUrl')?.toString().trim();
		const watchEmbedUrl = form.get('watchEmbedUrl')?.toString().trim();
		const messagesUrl = form.get('messagesUrl')?.toString().trim();
		const planVisitHref = form.get('planVisitHref')?.toString().trim();

		const visit = parseForm(form, visitDetailsSchema);
		if (!visit.success) {
			return fail(400, { error: summarizeErrors(visit.errors), errors: visit.errors });
		}

		const current = await services.settings.getBundle();

		const updatedExtras = {
			...current.siteExtras,
			// Emptying a field clears it, so these are not guarded by `?? current`.
			visitTimes: visit.data.visitTimes,
			visitAddress: visit.data.visitAddress,
			visitNotes: visit.data.visitNotes,
			visitMapUrl: visit.data.visitMapUrl,
			givingUrl: givingUrl ?? current.siteExtras.givingUrl,
			watchUrl: watchUrl ?? current.siteExtras.watchUrl,
			watchEmbedUrl: watchEmbedUrl ?? current.siteExtras.watchEmbedUrl,
			messagesUrl: messagesUrl ?? current.siteExtras.messagesUrl,
			planVisitHref: planVisitHref ?? current.siteExtras.planVisitHref,
			organizationName: organizationName ?? current.siteExtras.organizationName
		};

		const updatedSeo = {
			title: title || current.seoDefaults.title,
			description: description || current.seoDefaults.description
		};

		await services.settings.saveBundle({
			seoDefaults: updatedSeo,
			siteExtras: updatedExtras
		});

		await services.auditLogs.logAction(
			'UPDATE_SETTINGS',
			'SETTINGS',
			'global',
			`Updated global site settings & SEO defaults`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
	}
};

