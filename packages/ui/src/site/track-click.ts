/**
 * Fires a one-way click count to `/api/track-click` for a tracked link
 * (Give, Watch Live) — see the analytics report in the admin app. Never
 * awaited and never throws into the caller: a dropped or slow beacon must
 * not delay or block the navigation the visitor actually clicked for.
 *
 * `sendBeacon` is preferred because it survives the page unloading right
 * after the click (the common case for an outbound or same-tab navigation);
 * `fetch(..., { keepalive: true })` is the fallback where it's unavailable
 * (SSR has neither, so this is a no-op there).
 */
export function trackClick(href: string, label = ''): void {
	if (typeof navigator === 'undefined') return;

	const payload = JSON.stringify({ href, label });

	try {
		if (navigator.sendBeacon) {
			const blob = new Blob([payload], { type: 'application/json' });
			navigator.sendBeacon('/api/track-click', blob);
			return;
		}
	} catch {
		// Fall through to fetch.
	}

	try {
		void fetch('/api/track-click', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: payload,
			keepalive: true
		}).catch(() => undefined);
	} catch {
		// Never let a tracking failure surface to the caller.
	}
}
