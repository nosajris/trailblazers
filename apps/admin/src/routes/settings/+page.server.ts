import { fail } from '@sveltejs/kit';
import {
	campusesSchema,
	contactChannelsSchema,
	contactDetailsSchema,
	givingDetailsSchema,
	parseForm,
	summarizeErrors,
	visitDetailsSchema
} from '@trailblazers/core';
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

		// Four schemas over one form, so a mistake in any block is reported under
		// its own field rather than silently dropping the rest of the save.
		const visit = parseForm(form, visitDetailsSchema);
		const contact = parseForm(form, contactChannelsSchema);
		const giving = parseForm(form, givingDetailsSchema);
		const campuses = parseForm(form, campusesSchema);
		const details = parseForm(form, contactDetailsSchema);

		const errors = {
			...(visit.success ? {} : visit.errors),
			...(contact.success ? {} : contact.errors),
			...(giving.success ? {} : giving.errors),
			...(campuses.success ? {} : campuses.errors),
			...(details.success ? {} : details.errors)
		};

		if (Object.keys(errors).length > 0) {
			return fail(400, { error: summarizeErrors(errors), errors });
		}
		if (!visit.success || !contact.success || !giving.success || !campuses.success || !details.success) {
			// Unreachable: the guard above covers every failure. Narrows the types.
			return fail(400, { error: 'Those settings could not be saved.' });
		}

		const current = await services.settings.getBundle();

		const updatedExtras = {
			...current.siteExtras,
			// Emptying a field clears it, so these are not guarded by `?? current`.
			visitTimes: visit.data.visitTimes,
			visitAddress: visit.data.visitAddress,
			visitNotes: visit.data.visitNotes,
			visitMapUrl: visit.data.visitMapUrl,
			whatsappNumber: contact.data.whatsappNumber,
			whatsappGreeting: contact.data.whatsappGreeting,
			givingMethods: giving.data.givingMethods,
			givingNote: giving.data.givingNote,
			campuses: campuses.data.campuses,
			contactPhone: details.data.contactPhone,
			contactEmail: details.data.contactEmail,
			postalAddress: details.data.postalAddress,
			officeHours: details.data.officeHours,
			socialLinks: details.data.socialLinks,
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

