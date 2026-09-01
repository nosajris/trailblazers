/**
 * Service worker.
 *
 * The point here is data cost, not offline novelty. A large part of this
 * audience pays per megabyte on mobile data, so the win is not re-downloading
 * the same CSS, fonts and images on every visit — and degrading to something
 * readable rather than a browser error when the connection drops mid-session.
 *
 * Strategy by request type:
 *  - navigations: network first, fall back to the cached page, then to an
 *    offline notice. Content changes, so the network is preferred.
 *  - hashed build assets: cache first. The filename changes when the content
 *    does, so a cached copy is never stale.
 *  - images and fonts: stale-while-revalidate. Show the cached copy instantly,
 *    refresh quietly in the background.
 *  - anything else, and every non-GET: straight to the network, never cached.
 *
 * Bump CACHE_VERSION to evict everything on the next deploy.
 */

const CACHE_VERSION = 'v1';
const PAGE_CACHE = `pages-${CACHE_VERSION}`;
const ASSET_CACHE = `assets-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';

/** Kept small on purpose: precaching megabytes on first visit defeats the point. */
const PRECACHE = [OFFLINE_URL];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(PAGE_CACHE)
			.then((cache) => cache.addAll(PRECACHE))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((key) => key !== PAGE_CACHE && key !== ASSET_CACHE)
						.map((key) => caches.delete(key))
				)
			)
			.then(() => self.clients.claim())
	);
});

/** Immutable build output: the filename carries a content hash. */
function isHashedAsset(url) {
	return url.pathname.startsWith('/_app/immutable/');
}

function isMedia(url) {
	return /\.(?:png|jpe?g|gif|svg|webp|avif|woff2?|ico)$/i.test(url.pathname);
}

/** Never cache these: they are per-visitor or change on every call. */
function isNeverCached(url) {
	return (
		url.pathname.startsWith('/api/') ||
		url.pathname === '/unsubscribe' ||
		url.searchParams.has('token')
	);
}

async function networkFirst(request) {
	try {
		const response = await fetch(request);

		if (response.ok) {
			const cache = await caches.open(PAGE_CACHE);
			cache.put(request, response.clone());
		}

		return response;
	} catch {
		const cached = await caches.match(request);
		if (cached) return cached;

		const offline = await caches.match(OFFLINE_URL);
		if (offline) return offline;

		return new Response('You are offline.', {
			status: 503,
			headers: { 'Content-Type': 'text/plain' }
		});
	}
}

async function cacheFirst(request, cacheName) {
	const cached = await caches.match(request);
	if (cached) return cached;

	const response = await fetch(request);
	if (response.ok) {
		const cache = await caches.open(cacheName);
		cache.put(request, response.clone());
	}
	return response;
}

async function staleWhileRevalidate(request) {
	const cache = await caches.open(ASSET_CACHE);
	const cached = await cache.match(request);

	const network = fetch(request)
		.then((response) => {
			if (response.ok) cache.put(request, response.clone());
			return response;
		})
		.catch(() => cached);

	return cached ?? network;
}

self.addEventListener('fetch', (event) => {
	const { request } = event;

	// Only GET is ever cached. A POST is a form submission with side effects.
	if (request.method !== 'GET') return;

	const url = new URL(request.url);

	// Leave other origins alone — YouTube embeds, Google Fonts, and anything
	// else should follow their own caching headers.
	if (url.origin !== self.location.origin) return;

	if (isNeverCached(url)) return;

	if (isHashedAsset(url)) {
		event.respondWith(cacheFirst(request, ASSET_CACHE));
		return;
	}

	if (isMedia(url)) {
		event.respondWith(staleWhileRevalidate(request));
		return;
	}

	if (request.mode === 'navigate') {
		event.respondWith(networkFirst(request));
	}
});

/** Lets a new deploy take over without waiting for every tab to close. */
self.addEventListener('message', (event) => {
	if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
