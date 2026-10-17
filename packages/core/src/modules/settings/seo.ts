/**
 * The site-wide Organization structured data (schema.org JSON-LD), built from
 * the same settings staff already fill in on the Settings page.
 *
 * Before this it was three fields (name, url, description) — a phone number,
 * an email, a postal address and every social profile link were sitting in
 * `SiteExtras` unused, even though Google reads exactly those into a search
 * result's "knowledge panel" via `telephone`, `email`, `address` and
 * `sameAs`. Empty fields are left out rather than sent as blanks.
 */
import type { SiteSettingsBundle } from './service.js';

export type OrganizationJsonLd = {
	'@context': 'https://schema.org';
	'@type': 'Organization';
	name: string;
	url: string;
	description: string;
	telephone?: string;
	email?: string;
	address?: string;
	sameAs?: string[];
};

export function organizationJsonLd(settings: SiteSettingsBundle, siteUrl: string): OrganizationJsonLd {
	const extras = settings.siteExtras;
	const sameAs = (extras.socialLinks ?? []).map((link) => link.url).filter(Boolean);

	const node: OrganizationJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: extras.organizationName ?? 'Trailblazers Young Adults',
		url: siteUrl,
		description: settings.seoDefaults.description
	};
	if (extras.contactPhone) node.telephone = extras.contactPhone;
	if (extras.contactEmail) node.email = extras.contactEmail;
	if (extras.postalAddress) node.address = extras.postalAddress;
	if (sameAs.length > 0) node.sameAs = sameAs;

	return node;
}
