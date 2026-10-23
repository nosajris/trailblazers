import { test } from 'node:test';
import assert from 'node:assert/strict';
import { organizationJsonLd } from './seo.js';
import type { SiteSettingsBundle } from './service.js';

function bundle(siteExtras: SiteSettingsBundle['siteExtras']): SiteSettingsBundle {
	return {
		navLinks: [],
		footerColumns: [],
		seoDefaults: { title: 'Trailblazers', description: 'A home for young adults.' },
		siteExtras
	};
}

test('builds the minimal Organization node when nothing extra is filled in', () => {
	const ld = organizationJsonLd(bundle({}), 'https://example.org');
	assert.deepEqual(ld, {
		'@context': 'https://schema.org',
		'@type': 'Church',
		name: 'Trailblazers Young Adults',
		url: 'https://example.org',
		description: 'A home for young adults.'
	});
});

test('adds telephone, email, address and social links only when they are filled in', () => {
	const ld = organizationJsonLd(
		bundle({
			organizationName: 'PAOZ Trailblazers',
			contactPhone: '+263771234567',
			contactEmail: 'hello@paoz.org',
			postalAddress: '12 Example Ave, Harare',
			socialLinks: [
				{ label: 'Instagram', url: 'https://instagram.com/paoztrailblazers' },
				{ label: 'Facebook', url: 'https://facebook.com/paoztrailblazers' }
			]
		}),
		'https://paoz.org'
	);
	assert.equal(ld.name, 'PAOZ Trailblazers');
	assert.equal(ld.telephone, '+263771234567');
	assert.equal(ld.email, 'hello@paoz.org');
	assert.deepEqual(ld.address, {
		'@type': 'PostalAddress',
		streetAddress: '12 Example Ave, Harare'
	});
	assert.deepEqual(ld.sameAs, ['https://instagram.com/paoztrailblazers', 'https://facebook.com/paoztrailblazers']);
});

test('omits sameAs entirely when there are no social links, rather than an empty array', () => {
	const ld = organizationJsonLd(bundle({ socialLinks: [] }), 'https://example.org');
	assert.equal('sameAs' in ld, false);
});

test('a church is marked up as one, so the address and map count as local SEO', () => {
	// `Church` is a Place as well as an Organization, which is what lets Google
	// treat the address, map link and campuses as a location rather than as
	// decoration on a generic company node.
	const ld = organizationJsonLd(bundle({ postalAddress: '12 Example Ave, Harare' }), 'https://example.org');
	assert.equal(ld['@type'], 'Church');
});

test('the postal address is a node, not a sentence', () => {
	const ld = organizationJsonLd(bundle({ postalAddress: '12 Example Ave, Harare' }), 'https://example.org');
	assert.deepEqual(ld.address, {
		'@type': 'PostalAddress',
		streetAddress: '12 Example Ave, Harare'
	});
});

test('the map link staff filled in for a visit becomes hasMap', () => {
	const ld = organizationJsonLd(
		bundle({ visitMapUrl: 'https://maps.example.org/paoz' }),
		'https://example.org'
	);
	assert.equal(ld.hasMap, 'https://maps.example.org/paoz');
	assert.equal('hasMap' in organizationJsonLd(bundle({}), 'https://example.org'), false);
});

test('each campus becomes a church of its own under the organisation', () => {
	// Campuses have been in settings with nothing reading them into structured
	// data, so a second location was invisible to search.
	const ld = organizationJsonLd(
		bundle({
			campuses: [
				{
					id: 'harare',
					label: 'Harare Central',
					address: '12 Example Ave, Harare',
					mapUrl: 'https://maps.example.org/harare',
					times: ['Sundays 9:00am']
				},
				{ id: 'chitungwiza', label: 'Chitungwiza' }
			]
		}),
		'https://paoz.org'
	);

	assert.equal(ld.subOrganization?.length, 2);
	assert.deepEqual(ld.subOrganization?.[0], {
		'@type': 'Church',
		name: 'Harare Central',
		url: 'https://paoz.org/campus/harare',
		address: { '@type': 'PostalAddress', streetAddress: '12 Example Ave, Harare' },
		hasMap: 'https://maps.example.org/harare'
	});
	// A campus with nothing but a name still gets its page, and no empty keys.
	assert.deepEqual(ld.subOrganization?.[1], {
		'@type': 'Church',
		name: 'Chitungwiza',
		url: 'https://paoz.org/campus/chitungwiza'
	});
});

test('no campuses means no key at all, rather than an empty list', () => {
	assert.equal('subOrganization' in organizationJsonLd(bundle({ campuses: [] }), 'https://x.org'), false);
});

test('service times are deliberately not turned into opening hours', () => {
	// `visitTimes` is free text ("Sundays 9:00am", "Every 2nd Saturday"), and
	// openingHoursSpecification needs a closing time this data does not have.
	// Inventing one would publish a service time nobody chose — exactly what
	// ADR 0008 forbids — so the times stay on the page and out of the markup.
	const ld = organizationJsonLd(
		bundle({ visitTimes: ['Sundays 9:00am', 'Every 2nd Saturday'] }),
		'https://example.org'
	);
	assert.equal('openingHoursSpecification' in ld, false);
	assert.equal('openingHours' in ld, false);
});
