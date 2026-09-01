import { buildSecurityHeaders, shouldSendHsts } from '@trailblazers/core';

/** Security headers for a public-site response. The site is never framed. */
export function securityHeaders(url: URL): Map<string, string> {
	return buildSecurityHeaders({
		enableHsts: shouldSendHsts(url.protocol, url.hostname),
		allowFraming: false
	});
}
