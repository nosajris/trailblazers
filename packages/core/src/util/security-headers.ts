/**
 * Response security headers.
 *
 * Neither app sent any of these. Kept import-free so it stays directly
 * testable, and returned as a Map so callers can apply them to any response.
 *
 * Content-Security-Policy is deliberately NOT set here: SvelteKit generates it
 * itself from `kit.csp` in `svelte.config.js`, where it can hash its own inline
 * hydration scripts. Setting a second CSP header here would be additive, and
 * the intersection of two policies is the stricter of the two — an easy way to
 * break the site by accident.
 */

export type SecurityHeaderOptions = {
	/**
	 * Send HSTS. Only meaningful over HTTPS, and actively unhelpful on
	 * http://localhost, where it would pin the browser to HTTPS for the whole
	 * origin — including other projects on the same port.
	 */
	enableHsts: boolean;
	/**
	 * Allow this origin to be framed. Both apps should refuse: neither is meant
	 * to be embedded, and refusing blocks clickjacking.
	 */
	allowFraming?: boolean;
};

/** One year, the minimum for HSTS preload eligibility. */
const HSTS_MAX_AGE_SECONDS = 31_536_000;

/**
 * Features neither app uses. Denying them means an injected script cannot
 * silently reach for a camera, microphone or location prompt.
 */
const DENIED_FEATURES = [
	'accelerometer',
	'autoplay',
	'camera',
	'display-capture',
	'encrypted-media',
	'geolocation',
	'gyroscope',
	'magnetometer',
	'microphone',
	'midi',
	'payment',
	'usb'
];

export function buildSecurityHeaders(options: SecurityHeaderOptions): Map<string, string> {
	const headers = new Map<string, string>();

	if (!options.allowFraming) {
		headers.set('X-Frame-Options', 'DENY');
	}

	// Stops browsers from second-guessing a declared Content-Type, which is how
	// a user-supplied upload gets treated as script.
	headers.set('X-Content-Type-Options', 'nosniff');

	// Send the full URL within the site, only the origin when leaving it, and
	// nothing at all when downgrading to http.
	headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	headers.set(
		'Permissions-Policy',
		DENIED_FEATURES.map((feature) => `${feature}=()`).join(', ')
	);

	// Keeps this origin out of other sites' popups and cross-origin lookups.
	headers.set('Cross-Origin-Opener-Policy', 'same-origin');

	if (options.enableHsts) {
		headers.set(
			'Strict-Transport-Security',
			`max-age=${HSTS_MAX_AGE_SECONDS}; includeSubDomains`
		);
	}

	return headers;
}

/** True for origins where HSTS is appropriate — i.e. real HTTPS, not localhost. */
export function shouldSendHsts(protocol: string, hostname: string): boolean {
	if (protocol !== 'https:') return false;
	if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return false;
	return true;
}
