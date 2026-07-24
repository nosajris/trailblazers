// @ts-nocheck
import { services } from '$lib/server/services';
import type { LayoutServerLoad } from './$types';

export const load = async ({ url }: Parameters<LayoutServerLoad>[0]) => {
	const settings = await services.settings.getBundle();
	const siteUrl = url.origin;
	const orgName = settings.siteExtras.organizationName ?? 'Trailblazers Young Adults';
	const jsonLdOrganization = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: orgName,
		url: siteUrl,
		description: settings.seoDefaults.description
	};
	const jsonLdWebsite = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: settings.seoDefaults.title,
		url: siteUrl,
		publisher: {
			'@type': 'Organization',
			name: orgName
		}
	};
	return { siteUrl, jsonLdOrganization, jsonLdWebsite };
};
