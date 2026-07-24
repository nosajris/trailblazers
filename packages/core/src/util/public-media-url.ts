/** SvelteKit serves `static/images/*` at `/images/*`. Rewrite legacy `/assets/` paths. */
export function publicMediaUrl(url: string | null | undefined): string | null {
	if (url == null || url === '') return null;
	return url.replace(/^\/assets\//, '/images/');
}
