/**
 * The HTML shell for every transactional email.
 *
 * Every email used to build its own ad-hoc `<p>` fragments by hand (or, for
 * the office notification, just dump the plain text into a `<pre>`), so
 * nothing looked consistent and nothing had a button, a preheader, or any
 * explanation of why the recipient got it. This turns the plain text every
 * caller already writes into one calm branded card, with inline styles only
 * (no external stylesheet, no images, no script) so it renders the same in
 * every mail client. A bare URL on its own line becomes a button
 * automatically; anything else stays as a paragraph.
 *
 * Adapted from Strata's `mail-html.js` — same approach, trimmed down for one
 * single-tenant sender (no "via" platform credit, no per-path button labels).
 */

export type EmailAction = { label: string; url: string };

const esc = (s: string): string =>
	String(s ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

const URL_ONLY = /^(https?:\/\/\S+)$/;
const URL_IN = /(https?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)])/g;

const linkify = (text: string): string =>
	esc(text).replace(URL_IN, (url) => `<a href="${url}" style="color:#2f6b5a;text-decoration:underline;">${url}</a>`);

function button(label: string, url: string): string {
	return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0 6px;"><tr><td align="center" bgcolor="#1f2421" style="border-radius:999px;background:#1f2421;"><a href="${esc(url)}" target="_blank" style="display:inline-block;padding:14px 28px;font:600 16px/1.2 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#ffffff;text-decoration:none;border-radius:999px;">${esc(label)}</a></td></tr></table>
<p style="margin:0 0 18px;font:400 13px/1.5 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#6a706c;word-break:break-all;">Or paste this address into your browser:<br><a href="${esc(url)}" style="color:#6a706c;">${esc(url)}</a></p>`;
}

export type EmailHtmlInput = {
	subject?: string;
	/** Plain text, as every caller already writes it. Blank lines separate paragraphs. */
	text: string;
	/** A link to turn into a button, when the text doesn't already carry one on its own line. */
	action?: EmailAction | null;
	brand?: string;
};

/** Wraps a plain-text email in a branded card. See the module doc for the reasoning. */
export function emailHtml({ subject = '', text, action = null, brand = 'Trailblazers' }: EmailHtmlInput): string {
	const blocks = String(text ?? '')
		.replace(/\r\n/g, '\n')
		.trim()
		.split(/\n{2,}/);
	let used = Boolean(action);
	const parts: string[] = [];

	for (const block of blocks) {
		const lines = block.split('\n');
		const words: string[] = [];
		const buttons: EmailAction[] = [];
		for (const line of lines) {
			const m = URL_ONLY.exec(line.trim());
			if (m && !used) {
				used = true;
				buttons.push({ label: 'Open', url: m[1] });
			} else {
				words.push(line);
			}
		}
		const copy = words.join('\n').trim();
		const isSignOff = copy === brand && buttons.length === 0; // the header already says who it is from
		if (copy && !isSignOff) {
			parts.push(
				`<p style="margin:0 0 16px;font:400 16px/1.65 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2421;">${linkify(copy).replace(/\n/g, '<br>')}</p>`
			);
		}
		for (const b of buttons) parts.push(button(b.label, b.url));
	}
	if (action?.url) parts.push(button(action.label || 'Open', action.url));

	const preheader = String(text ?? '')
		.replace(/https?:\/\/\S+/g, '')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, 110);

	return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f6f5f2;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f6f5f2" style="background:#f6f5f2;"><tr><td align="center" style="padding:28px 14px;">
  <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:560px;">
    <tr><td style="padding:0 6px 14px;font:400 26px/1.1 Georgia,'Times New Roman',serif;color:#1f2421;letter-spacing:-0.01em;">${esc(brand)}</td></tr>
    <tr><td bgcolor="#ffffff" style="background:#ffffff;border:1px solid #e7e5df;border-radius:16px;padding:30px 28px 18px;">
      ${parts.join('\n      ')}
    </td></tr>
    <tr><td style="padding:16px 8px 0;font:400 12px/1.6 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#8a8f8b;">You are getting this email because of something done with your address on ${esc(brand)}. If it was not you, you can ignore it.</td></tr>
  </table>
</td></tr></table>
</body></html>`;
}
