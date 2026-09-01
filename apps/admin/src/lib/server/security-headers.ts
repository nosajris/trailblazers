import { buildSecurityHeaders, shouldSendHsts } from '@trailblazers/core';

/** Security headers for a staff-portal response. The portal is never framed. */
export function securityHeaders(url: URL): Map<string, string> {
	return buildSecurityHeaders({
		enableHsts: shouldSendHsts(url.protocol, url.hostname),
		allowFraming: false
	});
}
