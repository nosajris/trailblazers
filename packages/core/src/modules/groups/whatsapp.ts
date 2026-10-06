/**
 * A group's WhatsApp invite link. Only WhatsApp's own hosts are accepted, because
 * the value ends up in a public href and an arbitrary URL there is a phishing risk.
 */
const ALLOWED_HOSTS = new Set(['chat.whatsapp.com', 'wa.me', 'whatsapp.com', 'www.whatsapp.com']);

export type WhatsappLinkResult = { ok: true; url: string | null } | { ok: false };

/** Empty input clears the link (`url: null`); anything else must be an https WhatsApp URL. */
export function parseWhatsappLink(raw: string | null | undefined): WhatsappLinkResult {
	const value = (raw ?? '').trim();
	if (!value) return { ok: true, url: null };
	if (value.length > 300) return { ok: false };
	let url: URL;
	try {
		url = new URL(value);
	} catch {
		return { ok: false };
	}
	if (url.protocol !== 'https:' || !ALLOWED_HOSTS.has(url.hostname) || url.username || url.password) {
		return { ok: false };
	}
	return { ok: true, url: url.toString() };
}
