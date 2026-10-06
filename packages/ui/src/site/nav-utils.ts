/** Small, framework-free helpers for the site navigation (unit tested with `npm test`). */

type LanguageOption = { code: string; label: string; href?: string };

const isReal = (href: string | undefined): boolean => {
	const h = href?.trim();
	return !!h && h !== '#';
};

/**
 * The language switcher only shows when at least two languages really link
 * somewhere. The shipped defaults point at "#", which rendered a dead
 * "Español" link on a site that has no translation.
 */
export function realLanguageOptions<T extends LanguageOption>(options: readonly T[] | undefined): T[] {
	const real = (options ?? []).filter((o) => isReal(o.href));
	return real.length > 1 ? real : [];
}

/** Whether a bottom-nav item should be highlighted for the current path. */
export function isActivePath(pathname: string, href: string): boolean {
	if (!href.startsWith('/')) return false;
	if (href === '/') return pathname === '/';
	return pathname === href || pathname.startsWith(href + '/');
}
