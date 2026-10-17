/**
 * Decides which server requests represent an actual page view, as opposed
 * to a static asset, an API call, or a file like robots.txt or sitemap.xml.
 *
 * Tracking happens in the site's `handle` hook rather than a client-side
 * script, so it works with JavaScript off and needs no separate network
 * request — but `handle` sees every request the server gets, including
 * assets and data fetches, so this is the filter that keeps the count to
 * one hit per navigation: a full page load always requests the HTML
 * document (`accept: text/html`), and a client-side navigation instead
 * requests only the page's load data (SvelteKit marks these
 * `isDataRequest`) — never both for the same navigation.
 */
export type TrackableRequest = {
	method: string;
	pathname: string;
	accept: string | null;
	isDataRequest: boolean;
};

export function isTrackablePageView(request: TrackableRequest): boolean {
	if (request.method !== 'GET') return false;
	if (request.pathname.startsWith('/api/')) return false;
	// Any file extension — JS/CSS/image assets, robots.txt, sitemap.xml, manifest.json.
	if (/\.[a-z0-9]+$/i.test(request.pathname)) return false;
	if (request.isDataRequest) return true;
	return (request.accept ?? '').includes('text/html');
}
