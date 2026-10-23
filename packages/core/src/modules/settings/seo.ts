/**
 * The site-wide Organization structured data (schema.org JSON-LD), built from
 * the same settings staff already fill in on the Settings page.
 *
 * Before this it was three fields (name, url, description) — a phone number,
 * an email, a postal address and every social profile link were sitting in
 * `SiteExtras` unused, even though Google reads exactly those into a search
 * result's "knowledge panel" via `telephone`, `email`, `address` and
 * `sameAs`. Empty fields are left out rather than sent as blanks.
 *
 * The node is a `Church`, which is both an Organization and a Place. That is
 * what makes the address, the map link and the campuses count as a location
 * rather than as decoration on a generic company: a visitor searching for a
 * church near them is matched on the Place half.
 *
 * What is deliberately **not** here: opening hours. `visitTimes` is free text
 * staff type ("Sundays 9:00am", "Every 2nd Saturday"), and
 * `openingHoursSpecification` needs a closing time that data does not contain.
 * Guessing one would publish a service time nobody chose, which is the mistake
 * ADR 0008 exists to prevent — so the times stay on the page, where they are
 * read as written, and out of the markup.
 */
import type { CampusDetail } from './site-content.js';
import type { SiteSettingsBundle } from './service.js';

export type PostalAddressJsonLd = {
	'@type': 'PostalAddress';
	streetAddress: string;
};

export type CampusJsonLd = {
	'@type': 'Church';
	name: string;
	url: string;
	address?: PostalAddressJsonLd;
	hasMap?: string;
};

export type OrganizationJsonLd = {
	'@context': 'https://schema.org';
	'@type': 'Church';
	name: string;
	url: string;
	description: string;
	telephone?: string;
	email?: string;
	address?: PostalAddressJsonLd;
	hasMap?: string;
	sameAs?: string[];
	subOrganization?: CampusJsonLd[];
};

/** An unstructured address line is still worth sending as a node. */
function postalAddress(value: string | undefined): PostalAddressJsonLd | undefined {
	const street = (value ?? '').trim();
	if (street === '') return undefined;
	return { '@type': 'PostalAddress', streetAddress: street };
}

/**
 * Each campus is a church in its own right, at the public page it already has
 * (`/campus/<id>`). Details are optional, so only what staff filled in appears.
 */
function campusNode(campus: CampusDetail, siteUrl: string): CampusJsonLd {
	const node: CampusJsonLd = {
		'@type': 'Church',
		name: campus.label,
		url: `${siteUrl}/campus/${campus.id}`
	};

	const address = postalAddress(campus.address);
	if (address) node.address = address;
	if (campus.mapUrl) node.hasMap = campus.mapUrl;

	return node;
}

export function organizationJsonLd(
	settings: SiteSettingsBundle,
	siteUrl: string
): OrganizationJsonLd {
	const extras = settings.siteExtras;
	const sameAs = (extras.socialLinks ?? []).map((link) => link.url).filter(Boolean);
	const campuses = extras.campuses ?? [];

	const node: OrganizationJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Church',
		name: extras.organizationName ?? 'Trailblazers Young Adults',
		url: siteUrl,
		description: settings.seoDefaults.description
	};

	if (extras.contactPhone) node.telephone = extras.contactPhone;
	if (extras.contactEmail) node.email = extras.contactEmail;

	const address = postalAddress(extras.postalAddress);
	if (address) node.address = address;

	// The map link staff gave visitors is the same place the Place node means.
	if (extras.visitMapUrl) node.hasMap = extras.visitMapUrl;

	if (sameAs.length > 0) node.sameAs = sameAs;
	if (campuses.length > 0) {
		node.subOrganization = campuses.map((campus) => campusNode(campus, siteUrl));
	}

	return node;
}
