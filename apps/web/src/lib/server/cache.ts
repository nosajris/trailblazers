/**
 * Cache policy for public pages.
 *
 * Nothing on the public site set a cache header except `robots.txt` and
 * `sitemap.xml`, so every visit to every page ran a fresh set of Postgres
 * queries — including `settings.getBundle()`, which nearly every route calls
 * for the nav and footer. On serverless with a pool of one connection, that is
 * the difference between a page served from the edge and a cold database round
 * trip per visitor.
 *
 * `s-maxage` targets the shared CDN cache, not the browser: `max-age=0` keeps
 * the visitor's own browser revalidating so an edit is never stuck behind a
 * local cache, while `stale-while-revalidate` means the CDN serves the old copy
 * instantly and refreshes behind the scenes rather than making someone wait.
 */

export type CacheProfile = 'static' | 'content' | 'dynamic' | 'private';

const PROFILES: Record<CacheProfile, string> = {
	/** Rarely changes — legal copy, "plan a visit", contact details. */
	static: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
	/** CMS-managed content: sermons, blog posts, groups, leaders, FAQ. */
	content: 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600',
	/** Time-sensitive listings where a stale entry is more noticeable. */
	dynamic: 'public, max-age=0, s-maxage=120, stale-while-revalidate=600',
	/** Anything user-specific. Must never enter a shared cache. */
	private: 'private, no-store'
};

/**
 * Header map for a cache profile.
 *
 * Pass the result to SvelteKit's `setHeaders`. A page that renders anything
 * about the signed-in visitor must use 'private'.
 */
export function cacheHeaders(profile: CacheProfile): Record<string, string> {
	return { 'cache-control': PROFILES[profile] };
}
