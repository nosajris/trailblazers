/**
 * Structured data (schema.org JSON-LD) that isn't specific to one page's own
 * content. `breadcrumbsJsonLd` turns a trail of [name, url] pairs into a
 * BreadcrumbList — Google shows this as the "Home > Events > Youth Camp"
 * trail under a search result instead of a bare URL, and no page here built
 * one before this.
 */

export type BreadcrumbTrail = ReadonlyArray<readonly [name: string, url: string]>;

export function breadcrumbsJsonLd(trail: BreadcrumbTrail) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: trail.map(([name, item], index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name,
			item
		}))
	};
}

/**
 * Combines a page's own structured data with its breadcrumb trail into one
 * `@graph`, so a single `<script type="application/ld+json">` carries both —
 * `SeoMeta` renders exactly one JSON-LD block per page.
 */
export function withBreadcrumbs(node: Record<string, unknown>, trail: BreadcrumbTrail) {
	return {
		'@context': 'https://schema.org',
		'@graph': [node, breadcrumbsJsonLd(trail)]
	};
}
