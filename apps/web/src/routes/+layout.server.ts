import { services } from '$lib/server/services';
import { catalogues, createTranslator, organizationJsonLd, resolveLocale } from '@trailblazers/core';
import { issueFormToken } from '$lib/server/form-guard';
import type { LayoutServerLoad } from './$types';

/** Remembers a language choice so it survives the next visit. */
const LOCALE_COOKIE = 'tb_locale';
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const load: LayoutServerLoad = async ({ url, request, cookies, locals }) => {
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

	// Built from the same Settings fields staff already fill in (phone, email,
	// address, social links) — Google reads these into a result's knowledge
	// panel via telephone/email/address/sameAs, so leaving them out of the
	// Organization node was leaving that panel empty for no reason.
	const jsonLdOrganization = organizationJsonLd(settings, siteUrl);

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
		// Lets the navbar show "My account"/"Sign in" without threading a prop
		// through every page's own load — it reads this via `page.data` instead.
		user: locals.user,
		// The footer's newsletter box is on every page, so its token is minted
		// here rather than in each route. See `lib/server/form-guard.ts`.
		newsletterToken: issueFormToken('newsletter'),
		// Same for a FORM block, which can sit on any CMS page. One name covers
		// them all: they file the same kind of record, so a token moving between
		// two of them is not a privilege it did not already have.
		cmsFormToken: issueFormToken('cms-form'),
		// Serialised to the client as a plain object; the page re-creates the
		// translator from it rather than shipping a function.
		messages: { [locale]: catalogues[locale], en: catalogues.en },
		skipToContent: t('nav.skipToContent'),
		jsonLdOrganization,
		jsonLdWebsite
	};
};
