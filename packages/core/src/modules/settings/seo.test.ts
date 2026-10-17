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
		'@type': 'Organization',
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
	assert.equal(ld.address, '12 Example Ave, Harare');
	assert.deepEqual(ld.sameAs, ['https://instagram.com/paoztrailblazers', 'https://facebook.com/paoztrailblazers']);
});

test('omits sameAs entirely when there are no social links, rather than an empty array', () => {
	const ld = organizationJsonLd(bundle({ socialLinks: [] }), 'https://example.org');
	assert.equal('sameAs' in ld, false);
});
