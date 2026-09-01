/**
 * Locale resolution and message lookup.
 *
 * `languageOptions` has existed in site settings all along with nothing
 * consuming it. This is the plumbing that makes it mean something.
 *
 * Import-free so it stays directly testable.
 *
 * IMPORTANT: the Shona (`sn`) and Ndebele (`nd`) catalogues are intentionally
 * empty. Machine-translating pastoral and liturgical language is not
 * appropriate — a human translator fills these in. Until then, every lookup
 * falls back to English, so an untranslated site is complete English rather
 * than a page of missing-key markers.
 */

export const DEFAULT_LOCALE = 'en';

export const SUPPORTED_LOCALES = ['en', 'sn', 'nd'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
	en: 'English',
	sn: 'chiShona',
	nd: 'isiNdebele'
};

export type Messages = Record<string, string>;

export function isSupportedLocale(value: string): value is Locale {
	return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Picks a locale from an Accept-Language header.
 *
 * Quality values are honoured, and a regional tag matches its base language so
 * `sn-ZW` resolves to `sn`.
 */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
	if (!header) return DEFAULT_LOCALE;

	const candidates = header
		.split(',')
		.map((part) => {
			const [tag, ...params] = part.trim().split(';');
			const q = params.find((p) => p.trim().startsWith('q='));
			const quality = q ? Number.parseFloat(q.split('=')[1]) : 1;
			return { tag: tag.trim().toLowerCase(), quality: Number.isFinite(quality) ? quality : 0 };
		})
		.filter((c) => c.tag.length > 0)
		.sort((a, b) => b.quality - a.quality);

	for (const candidate of candidates) {
		if (isSupportedLocale(candidate.tag)) return candidate.tag;

		const base = candidate.tag.split('-')[0];
		if (isSupportedLocale(base)) return base;
	}

	return DEFAULT_LOCALE;
}

/**
 * Resolves the locale for a request.
 *
 * Precedence: an explicit `?lang=` (someone clicked a language link), then a
 * stored cookie preference, then the browser's Accept-Language, then English.
 */
export function resolveLocale(input: {
	query?: string | null;
	cookie?: string | null;
	acceptLanguage?: string | null;
}): Locale {
	if (input.query && isSupportedLocale(input.query)) return input.query;
	if (input.cookie && isSupportedLocale(input.cookie)) return input.cookie;
	return localeFromAcceptLanguage(input.acceptLanguage);
}

/**
 * Builds a lookup function for a locale.
 *
 * A missing key returns the English string; a key missing from English too
 * returns the key itself, which is ugly on purpose so it gets noticed in
 * review rather than shipping as a blank.
 *
 * `{placeholders}` are substituted from `values`.
 */
export function createTranslator(
	locale: Locale,
	catalogues: Record<Locale, Messages>
): (key: string, values?: Record<string, string | number>) => string {
	const primary = catalogues[locale] ?? {};
	const fallback = catalogues[DEFAULT_LOCALE] ?? {};

	return (key, values) => {
		const template = primary[key] ?? fallback[key] ?? key;

		if (!values) return template;

		return template.replace(/\{(\w+)\}/g, (match, name: string) =>
			name in values ? String(values[name]) : match
		);
	};
}

/** How complete a translation is, for a progress view. */
export function translationCoverage(catalogues: Record<Locale, Messages>, locale: Locale): number {
	const english = Object.keys(catalogues[DEFAULT_LOCALE] ?? {});
	if (english.length === 0) return 1;

	const translated = catalogues[locale] ?? {};
	const done = english.filter((key) => typeof translated[key] === 'string' && translated[key] !== '');

	return done.length / english.length;
}
