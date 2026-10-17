import { test } from 'node:test';
import assert from 'node:assert/strict';
import { breadcrumbsJsonLd, withBreadcrumbs } from './seo.js';

test('breadcrumbsJsonLd numbers each item from 1 and keeps name/url', () => {
	const ld = breadcrumbsJsonLd([
		['Home', 'https://example.com/'],
		['Events', 'https://example.com/events'],
		['Youth Camp', 'https://example.com/events/5']
	]);
	assert.equal(ld['@type'], 'BreadcrumbList');
	assert.equal(ld.itemListElement.length, 3);
	assert.deepEqual(ld.itemListElement[0], { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.com/' });
	assert.equal(ld.itemListElement[2].position, 3);
});

test('withBreadcrumbs puts the page node and the breadcrumb list in one @graph', () => {
	const node = { '@context': 'https://schema.org', '@type': 'Event', name: 'Youth Camp' };
	const combined = withBreadcrumbs(node, [['Home', 'https://example.com/'], ['Events', 'https://example.com/events']]);
	assert.equal(combined['@context'], 'https://schema.org');
	assert.equal(combined['@graph'].length, 2);
	assert.equal(combined['@graph'][0], node);
	assert.equal((combined['@graph'][1] as { '@type': string })['@type'], 'BreadcrumbList');
});
