import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async () => {
	const settings = await services.settings.getBundle();
	return { settings };
};

export const actions: Actions = {
	saveSettings: async ({ request, locals }) => {
		const form = await request.formData();
		const title = form.get('seoTitle')?.toString().trim();
		const description = form.get('seoDescription')?.toString().trim();
		const organizationName = form.get('organizationName')?.toString().trim();
		const givingUrl = form.get('givingUrl')?.toString().trim();
		const watchUrl = form.get('watchUrl')?.toString().trim();
		const watchEmbedUrl = form.get('watchEmbedUrl')?.toString().trim();
		const messagesUrl = form.get('messagesUrl')?.toString().trim();
		const planVisitHref = form.get('planVisitHref')?.toString().trim();

		const current = await services.settings.getBundle();

		const updatedExtras = {
			...current.siteExtras,
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

