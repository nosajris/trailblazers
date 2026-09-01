import { services } from '$lib/server/services';
import { catalogues, createTranslator, resolveLocale } from '@trailblazers/core';
import type { LayoutServerLoad } from './$types';

/** Remembers a language choice so it survives the next visit. */
const LOCALE_COOKIE = 'tb_locale';
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const load: LayoutServerLoad = async ({ url, request, cookies }) => {
	const settings = await services.settings.getBundle();
	const siteUrl = url.origin;
	const orgName = settings.siteExtras.organizationName ?? 'Trailblazers Young Adults';

	// Explicit ?lang= beats a stored preference, which beats the browser's
	// Accept-Language. `languageOptions` has been in site settings all along
	// with nothing reading it; this is what makes it mean something.
	const locale = resolveLocale({
		query: url.searchParams.get('lang'),
		cookie: cookies.get(LOCALE_COOKIE),
		acceptLanguage: request.headers.get('accept-language')
	});

	// Persist only an explicit choice — never a guess from Accept-Language,
	// which would silently pin someone to a locale they never picked.
	if (url.searchParams.get('lang') === locale) {
		cookies.set(LOCALE_COOKIE, locale, {
			path: '/',
			maxAge: LOCALE_COOKIE_MAX_AGE,
			httpOnly: false,
			sameSite: 'lax'
		});
	}

	const t = createTranslator(locale, catalogues);

	const jsonLdOrganization = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: orgName,
		url: siteUrl,
		description: settings.seoDefaults.description
	};

	const jsonLdWebsite = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: settings.seoDefaults.title,
		url: siteUrl,
		inLanguage: locale,
		publisher: {
			'@type': 'Organization',
			name: orgName
		}
	};

	return {
		siteUrl,
		locale,
		// Serialised to the client as a plain object; the page re-creates the
		// translator from it rather than shipping a function.
		messages: { [locale]: catalogues[locale], en: catalogues.en },
		skipToContent: t('nav.skipToContent'),
		jsonLdOrganization,
		jsonLdWebsite
	};
};
