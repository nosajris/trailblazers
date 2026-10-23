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

export type CountableRequest = TrackableRequest & {
	/** The `DNT` header, if the browser sent one. */
	dnt: string | null;
	/** The `Sec-GPC` header: Global Privacy Control, the newer equivalent. */
	globalPrivacyControl: string | null;
	/** True when the request carries a valid staff session. */
	isStaff: boolean;
};

/**
 * Whether this page view should be counted at all.
 *
 * `isTrackablePageView` answers "is this a page view"; this answers "should we
 * count it", which is a different question with two answers the first one
 * cannot give:
 *
 * - **The visitor asked not to be.** `DNT: 1`, and its successor `Sec-GPC: 1`,
 *   are honoured. This is a first-party counter that stores no address and no
 *   cookie, so it would arguably be within its rights to ignore them — but the
 *   numbers are read by an office, not sold to anyone, and the cost of
 *   honouring a stated preference is one uncounted visit.
 * - **It is a staff member's own visit.** Staff have the site open all day
 *   while editing it; counting those makes the weekly digest mostly a record
 *   of the office's own browsing. Only a *valid* session counts as staff, so a
 *   stale cookie from a signed-out browser is still an ordinary visitor.
 */
export function shouldCountView(request: CountableRequest): boolean {
	if (!isTrackablePageView(request)) return false;
	// Only an explicit "1" is a request not to be tracked; '0' and
	// 'unspecified' are not, and neither is a missing header.
	if (request.dnt === '1' || request.globalPrivacyControl === '1') return false;
	if (request.isStaff) return false;
	return true;
}
