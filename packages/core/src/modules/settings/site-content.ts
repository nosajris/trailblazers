/**
 * Pure parsers for the staff-portal settings that are edited as free text.
 *
 * Giving methods and campus details are lists of small records. A repeater UI
 * for each would be a lot of admin plumbing for content that changes a few
 * times a year, so staff type one record per line and these functions turn
 * that into structured data. They are pure so they can be unit tested without
 * a browser or a database, and they are the single definition of each format —
 * the zod schemas in `validation.ts` wrap them.
 */

export type GivingMethod = { label: string; detail: string; note?: string };
export type CampusDetail = {
	id: string;
	label: string;
	href?: string;
	times?: string[];
	address?: string;
	mapUrl?: string;
};

export type ParseOutcome<T> = { items: T[]; error?: string };

const isHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value);

/** Splits a block of text into trimmed, non-empty lines. */
function lines(text: string | undefined): string[] {
	return (text ?? '')
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line.length > 0);
}

/** Splits one record into trimmed pipe-separated fields. */
function fields(line: string): string[] {
	return line.split('|').map((part) => part.trim());
}

/**
 * Turns a WhatsApp number into the digits wa.me expects, or null when empty.
 *
 * wa.me needs a full international number, so a local form such as 0771234567
 * is rejected rather than guessed at — a wrong country code sends people to a
 * stranger. Returns `{ error }` for anything unusable.
 */
export function normalizeWhatsappNumber(raw: string | undefined): { number: string | null; error?: string } {
	const value = (raw ?? '').trim();
	if (!value) return { number: null };

	const digits = value.replace(/[^\d]/g, '');
	const advice = 'Use the full international number, for example +263771234567';

	if (digits.length === 0) return { number: null, error: `WhatsApp number is not a number. ${advice}` };
	if (!value.startsWith('+') && digits.startsWith('0')) {
		return { number: null, error: `WhatsApp number is missing its country code. ${advice}` };
	}
	if (digits.length < 8 || digits.length > 15) {
		return { number: null, error: `WhatsApp number must be 8 to 15 digits. ${advice}` };
	}

	return { number: digits };
}

/** `Label | Detail | Note` per line. Label and detail are required. */
export function parseGivingMethods(text: string | undefined, max = 6): ParseOutcome<GivingMethod> {
	const rows = lines(text);
	if (rows.length > max) return { items: [], error: `Add at most ${max} ways to give` };

	const items: GivingMethod[] = [];
	for (const row of rows) {
		const [label, detail, note] = fields(row);
		if (!label || !detail) {
			return { items: [], error: `Each way to give needs a name and a detail, separated by "|": ${row}` };
		}
		if (label.length > 60 || detail.length > 160 || (note ?? '').length > 160) {
			return { items: [], error: `This way to give is too long: ${label}` };
		}
		items.push(note ? { label, detail, note } : { label, detail });
	}

	return { items };
}

/** `slug | Label | Times (; separated) | Address | Map URL` per line. Slug and label are required. */
export function parseCampuses(text: string | undefined, max = 8): ParseOutcome<CampusDetail> {
	const rows = lines(text);
	if (rows.length > max) return { items: [], error: `Add at most ${max} campuses` };

	const items: CampusDetail[] = [];
	const seen = new Set<string>();

	for (const row of rows) {
		const [rawId, label, rawTimes, address, mapUrl] = fields(row);
		const id = (rawId ?? '').toLowerCase();

		if (!id || !label) {
			return { items: [], error: `Each campus needs a short id and a name, separated by "|": ${row}` };
		}
		if (!/^[a-z0-9-]{1,40}$/.test(id)) {
			return { items: [], error: `Campus id "${rawId}" may use only letters, numbers and hyphens` };
		}
		if (seen.has(id)) return { items: [], error: `Campus id "${id}" is used twice` };
		seen.add(id);
		if (mapUrl && !isHttpUrl(mapUrl)) {
			return { items: [], error: `Campus "${label}" has a map link that is not an http(s) address` };
		}

		const times = (rawTimes ?? '')
			.split(';')
			.map((t) => t.trim())
			.filter((t) => t.length > 0);

		items.push({
			id,
			label,
			href: `/campus/${id}`,
			...(times.length > 0 ? { times } : {}),
			...(address ? { address } : {}),
			...(mapUrl ? { mapUrl } : {})
		});
	}

	return { items };
}

/** Renders parsed campuses back into the editable text format. */
export function campusesToText(campuses: readonly CampusDetail[] | undefined): string {
	return (campuses ?? [])
		.map((c) =>
			[c.id, c.label, (c.times ?? []).join('; '), c.address ?? '', c.mapUrl ?? '']
				.join(' | ')
				.replace(/(\s*\|\s*)+$/, '')
		)
		.join('\n');
}

/** Renders parsed giving methods back into the editable text format. */
export function givingMethodsToText(methods: readonly GivingMethod[] | undefined): string {
	return (methods ?? [])
		.map((m) => [m.label, m.detail, m.note ?? ''].join(' | ').replace(/(\s*\|\s*)+$/, ''))
		.join('\n');
}

export type SocialLink = { label: string; url: string };

/** `Label | https://url` per line. Only http(s) links are accepted. */
export function parseSocialLinks(text: string | undefined, max = 6): ParseOutcome<SocialLink> {
	const rows = lines(text);
	if (rows.length > max) return { items: [], error: `Add at most ${max} social links` };

	const items: SocialLink[] = [];
	for (const row of rows) {
		const [label, url] = fields(row);
		if (!label || !url) {
			return { items: [], error: `Each social link needs a name and an address, separated by "|": ${row}` };
		}
		if (!isHttpUrl(url)) {
			return { items: [], error: `"${label}" must be an http(s) address` };
		}
		if (label.length > 40 || url.length > 300) {
			return { items: [], error: `This social link is too long: ${label}` };
		}
		items.push({ label, url });
	}

	return { items };
}

export function socialLinksToText(links: readonly SocialLink[] | undefined): string {
	return (links ?? []).map((l) => `${l.label} | ${l.url}`).join('\n');
}

/**
 * A `tel:` href for a displayed phone number.
 *
 * The number is shown exactly as staff typed it, because local formatting is
 * what people recognise, while the href keeps only the digits and a leading
 * plus so a phone can dial it.
 */
export function telHref(phone: string | null | undefined): string | undefined {
	const value = (phone ?? '').trim();
	if (!value) return undefined;
	const cleaned = (value.startsWith('+') ? '+' : '') + value.replace(/[^\d]/g, '');
	return cleaned.replace(/\D/g, '').length >= 6 ? `tel:${cleaned}` : undefined;
}
