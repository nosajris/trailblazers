/**
 * Draft and publish for CMS pages: the decisions, kept pure and testable.
 *
 * Why a page needs a draft at all. The section editor autosaves — every settled
 * pause in typing writes to the server. On a published page that meant visitors
 * were reading half-finished headlines as staff worked, and there was no way to
 * see a change before the public did. So editing now writes a *draft* of each
 * section (`draft_config`, `draft_sort_order`, `pending_delete`), the public
 * page keeps rendering what was last published, and one Publish copies the
 * draft across in a single transaction — Strata's "the draft is one document
 * for the whole site, published in a transaction", in the shape of this
 * codebase's relational sections.
 *
 * Two things follow from that, and they are the reason this file exists:
 *
 * - staff need to be told what is waiting (`pendingChanges`), in terms they
 *   recognise — added, edited, moved, removed;
 * - a draft has to be viewable before it goes live, by someone who is not
 *   signed into the portal (a pastor approving wording on their phone), which
 *   means a signed link rather than a login.
 *
 * Imports are limited to `node:crypto`, as in `iam/session-tokens.ts` and
 * `og-image/sign.ts`, so all of this is directly testable.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * How long a preview link stays good. Long enough to send to someone and have
 * them look at it after the weekend; short enough that a link forwarded on, or
 * left in a chat thread, stops working. A draft church page is not a secret,
 * but it is also not finished, and being read as finished is the harm.
 */
export const PREVIEW_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type PublishableSection = {
	id: number;
	status: string;
	draftConfig: Record<string, unknown> | null;
	draftSortOrder: number | null;
	/** Null until the section has been published once. */
	publishedAt: Date | null;
	pendingDelete: boolean;
};

export type PendingChanges = {
	/** Sections visitors can already see, whose wording has changed. */
	edits: number;
	/** Sections that have never been published. */
	additions: number;
	/** Sections marked for removal on the next publish. */
	deletions: number;
	/** Sections that have been moved. */
	reorders: number;
	/** How many sections will change — not how many times they were touched. */
	total: number;
};

/**
 * What is waiting to be published on a page.
 *
 * `total` counts *sections*, so a section that was moved and reworded is one
 * change rather than two: it is the number staff see on the Publish button, and
 * it should match the number of things they can point at on the page.
 */
export function pendingChanges(sections: readonly PublishableSection[]): PendingChanges {
	const changes: PendingChanges = {
		edits: 0,
		additions: 0,
		deletions: 0,
		reorders: 0,
		total: 0
	};

	for (const section of sections) {
		// A section on its way out is described as a removal and nothing else —
		// calling it an edit as well would be true and useless.
		if (section.pendingDelete) {
			changes.deletions += 1;
			changes.total += 1;
			continue;
		}

		const isNew = section.publishedAt === null;
		const edited = section.draftConfig !== null;
		const moved = section.draftSortOrder !== null;

		if (isNew) changes.additions += 1;
		else if (edited) changes.edits += 1;
		if (moved) changes.reorders += 1;

		if (isNew || edited || moved) changes.total += 1;
	}

	return changes;
}

/** True when a scheduled page's time has come. */
export function isDueForPublish(page: { publishAt: Date | null }, now: Date): boolean {
	if (!page.publishAt) return false;
	return page.publishAt.getTime() <= now.getTime();
}

function sign(secret: string, pageId: number, expiresAtMs: number): string {
	return createHmac('sha256', secret)
		.update(`preview:${pageId}\n${expiresAtMs}`)
		.digest('hex')
		.slice(0, 32);
}

/**
 * A link to one page's draft, good until it expires.
 *
 * The page id and the expiry are both signed, so neither can be edited in the
 * URL: a token cannot be pointed at another page's draft, and the expiry cannot
 * be pushed into the future.
 */
export function createPagePreviewToken(
	secret: string,
	pageId: number,
	now: Date = new Date()
): string {
	const expiresAtMs = now.getTime() + PREVIEW_TOKEN_TTL_MS;
	return `${expiresAtMs}.${sign(secret, pageId, expiresAtMs)}`;
}

export function verifyPagePreviewToken(
	secret: string,
	pageId: number,
	token: string | undefined | null,
	now: Date = new Date()
): boolean {
	if (!token) return false;

	const [expiryPart, signature] = token.split('.');
	if (!expiryPart || !signature) return false;

	const expiresAtMs = Number(expiryPart);
	if (!Number.isFinite(expiresAtMs)) return false;

	const want = Buffer.from(sign(secret, pageId, expiresAtMs));
	const got = Buffer.from(signature);
	// Constant-time: a signature check is exactly where a timing side-channel
	// would matter (the same reasoning as `og-image/sign.ts`).
	if (want.length !== got.length || !timingSafeEqual(want, got)) return false;

	return now.getTime() < expiresAtMs;
}

/** Where a preview token is redeemed. */
export function previewPath(pageId: number, token: string): string {
	return `/preview/${pageId}?t=${encodeURIComponent(token)}`;
}
