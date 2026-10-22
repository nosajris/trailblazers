/**
 * SvelteKit serves `static/images/*` at `/images/*`. Rewrite legacy
 * `/assets/` paths. CMS uploads (`packages/core/src/modules/media/service.ts`)
 * are stored as bare Blob pathnames (`cms/<uuid>-<width>.webp`), not a
 * fetchable URL, because the Blob store is private — route them through
 * `/media/<pathname>`, which `routes/media/[...path]/+server.ts` in both
 * `apps/web` and `apps/admin` streams from the store via the SDK's `get()`.
 */
export function publicMediaUrl(url: string | null | undefined): string | null {
	if (url == null || url === '') return null;
	if (url.startsWith('cms/')) return `/media/${url}`;
	return url.replace(/^\/assets\//, '/images/');
}
