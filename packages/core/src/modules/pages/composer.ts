import { and, asc, eq, isNotNull, isNull, lte, max, or, sql } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { pageSections, pages } from './schema.js';
import {
	createSectionStrategyRegistry,
	createSectionStrategyServices
} from './section-strategies.js';
import { pendingChanges, type PendingChanges } from './publishing.js';
import type { HomeSectionBlock } from './view-models.js';

export function createPageComposerService(db: Database) {
	const services = createSectionStrategyServices(db);
	const registry = createSectionStrategyRegistry(services);

	/**
	 * Runs each section's loader. Independent of one another (events, blog,
	 * groups and so on don't depend on each other), so they run concurrently —
	 * N sequential database round trips become one round trip's worth of
	 * latency.
	 */
	async function loadBlocks(
		rows: (typeof pageSections.$inferSelect)[],
		options: { tagSection?: boolean } = {}
	): Promise<HomeSectionBlock[]> {
		const results = await Promise.all(
			rows.map(async (section): Promise<HomeSectionBlock | null> => {
				const loader = registry[section.sectionType] as
					((s: typeof section) => Promise<HomeSectionBlock | null>) | undefined;
				const block = loader ? await loader(section) : null;
				if (!block) return null;
				if (!options.tagSection) return block;
				return { ...block, sectionId: section.id, draft: section.status !== 'PUBLISHED' };
			})
		);

		return results.filter((block): block is HomeSectionBlock => block !== null);
	}

	/**
	 * A section as it will look once published: unpublished edits where there
	 * are any, otherwise what is already live. Used by both previews, never by
	 * the public page.
	 */
	function withDraftApplied(row: typeof pageSections.$inferSelect) {
		return { ...row, config: row.draftConfig ?? row.config };
	}

	/** Effective order, newest move first — the same expression the publish uses. */
	const effectiveOrder = sql`coalesce(${pageSections.draftSortOrder}, ${pageSections.sortOrder})`;

	return {
		async composePublicPage(slug: string): Promise<HomeSectionBlock[]> {
			const page = await db.query.pages.findFirst({
				where: and(eq(pages.slug, slug), eq(pages.status, 'PUBLISHED'))
			});
			if (!page) return [];

			// Deliberately reads `config` and `sortOrder`, never their draft
			// counterparts: the public page shows what was last published, which
			// is the whole point of there being a draft. A section marked for
			// removal keeps rendering until the publish that removes it.
			//
			// `publishedAt is not null` is the invariant that makes the draft
			// model safe: a section's content lives in `draftConfig` until a
			// publish copies it into `config`, so one that has never been
			// published has an empty `config` and would render as a blank band if
			// its status alone were enough to make it live.
			const sections = await db
				.select()
				.from(pageSections)
				.where(
					and(
						eq(pageSections.pageId, page.id),
						eq(pageSections.status, 'PUBLISHED'),
						isNotNull(pageSections.publishedAt)
					)
				)
				.orderBy(asc(pageSections.sortOrder), asc(pageSections.id));

			return loadBlocks(sections);
		},

		/**
		 * Same composition as `composePublicPage`, but for the staff editor's
		 * live preview: by page id rather than slug, with unpublished edits and
		 * moves applied, every section regardless of status (so a DRAFT section
		 * is visible while staff work on it), and each block tagged with the
		 * section it came from so the editor can sync hovering a list row to
		 * highlighting the matching block.
		 *
		 * Sections marked for removal are left out — a staff member who has just
		 * marked one should see the page without it.
		 */
		async composePreviewPage(pageId: number): Promise<HomeSectionBlock[]> {
			const page = await db.query.pages.findFirst({ where: eq(pages.id, pageId) });
			if (!page) return [];

			const sections = await db
				.select()
				.from(pageSections)
				.where(and(eq(pageSections.pageId, page.id), eq(pageSections.pendingDelete, false)))
				.orderBy(effectiveOrder, asc(pageSections.id));

			return loadBlocks(sections.map(withDraftApplied), { tagSection: true });
		},

		/**
		 * The page exactly as it will look once published, for the signed
		 * preview link staff share with someone who is not in the portal.
		 *
		 * Unlike the editor's preview this leaves out a section staff
		 * deliberately unpublished: it answers "what will visitors get", and
		 * that section is not part of the answer. A section that has simply
		 * never been published yet *is* part of it, because the publish will
		 * make it live.
		 */
		async composeDraftPage(pageId: number) {
			const page = await db.query.pages.findFirst({ where: eq(pages.id, pageId) });
			if (!page) return null;

			const sections = await db
				.select()
				.from(pageSections)
				.where(
					and(
						eq(pageSections.pageId, page.id),
						eq(pageSections.pendingDelete, false),
						or(eq(pageSections.status, 'PUBLISHED'), isNull(pageSections.publishedAt))
					)
				)
				.orderBy(effectiveOrder, asc(pageSections.id));

			return { page, blocks: await loadBlocks(sections.map(withDraftApplied)) };
		},

		/** Published page slugs, for the sitemap. */
		async listPublishedSlugs(): Promise<string[]> {
			const rows = await db
				.select({ slug: pages.slug })
				.from(pages)
				.where(eq(pages.status, 'PUBLISHED'));
			return rows.map((row) => row.slug);
		},

		async getAllPagesForAdmin() {
			return db.select().from(pages);
		},

		/**
		 * One published FORM section, with the slug of the page it sits on.
		 *
		 * The submission endpoint is generic — `/forms/<sectionId>` serves a form
		 * on any CMS page, including pages that do not exist yet — so it has to
		 * resolve the section itself, and only accept one a visitor could
		 * actually have seen: the section published, of type FORM, on a
		 * published page, with its published questions rather than a draft's.
		 * Returns the slug so the endpoint knows where to send the visitor back
		 * to.
		 */
		async getPublishedFormSection(sectionId: number) {
			const rows = await db
				.select({
					id: pageSections.id,
					config: pageSections.config,
					slug: pages.slug
				})
				.from(pageSections)
				.innerJoin(pages, eq(pageSections.pageId, pages.id))
				.where(
					and(
						eq(pageSections.id, sectionId),
						eq(pageSections.sectionType, 'FORM'),
						eq(pageSections.status, 'PUBLISHED'),
						isNotNull(pageSections.publishedAt),
						eq(pageSections.pendingDelete, false),
						eq(pages.status, 'PUBLISHED')
					)
				)
				.limit(1);

			return rows[0] ?? null;
		},

		/**
		 * One page and its sections for the staff editor, with what is waiting to
		 * be published.
		 */
		async getPageForAdmin(id: number) {
			const page = await db.query.pages.findFirst({ where: eq(pages.id, id) });
			if (!page) return null;

			const sections = await db
				.select()
				.from(pageSections)
				.where(eq(pageSections.pageId, id))
				.orderBy(effectiveOrder, asc(pageSections.id));

			return { page, sections, changes: pendingChanges(sections) };
		},

		/**
		 * Saves an edit as a draft.
		 *
		 * `config` is left alone on purpose — it is what visitors are reading,
		 * and this is called by an autosave that fires while staff are still
		 * typing. A new section is created DRAFT with an empty published config,
		 * so it cannot appear on the public page before anyone has published it.
		 */
		async saveSection(input: {
			id?: number;
			pageId: number;
			sectionType: (typeof pageSections.$inferInsert)['sectionType'];
			config?: Record<string, unknown>;
			status?: string;
			sortOrder?: number;
		}) {
			if (input.id) {
				const rows = await db
					.update(pageSections)
					.set({
						sectionType: input.sectionType,
						draftConfig: input.config ?? {},
						status: input.status || 'PUBLISHED',
						...(input.sortOrder === undefined ? {} : { draftSortOrder: input.sortOrder })
					})
					.where(eq(pageSections.id, input.id))
					.returning();
				return rows[0];
			}

			// A new section goes to the end rather than fighting for position 0.
			const [current] = await db
				.select({ value: max(pageSections.sortOrder) })
				.from(pageSections)
				.where(eq(pageSections.pageId, input.pageId));

			const rows = await db
				.insert(pageSections)
				.values({
					pageId: input.pageId,
					sectionType: input.sectionType,
					config: {},
					draftConfig: input.config ?? {},
					status: 'DRAFT',
					publishedAt: null,
					sortOrder: input.sortOrder ?? (current?.value ?? 0) + 10
				})
				.returning();
			return rows[0];
		},

		/**
		 * Publish or unpublish one section immediately, without touching its
		 * config.
		 *
		 * Deliberately not a draft operation: unpublishing is how staff take
		 * something down, and a takedown that waited for a separate publish step
		 * would be a trap.
		 */
		async setSectionStatus(id: number, status: 'PUBLISHED' | 'DRAFT') {
			// Only `status` — not `publishedAt`. This records whether staff want the
			// section visible; a publish is what makes it so, and is also what
			// moves its draft into the config the public page reads.
			await db.update(pageSections).set({ status }).where(eq(pageSections.id, id));
		},

		/**
		 * Removes a section.
		 *
		 * One that visitors have never seen goes immediately — there is nothing
		 * live to keep. One that is published is only *marked*, and disappears
		 * from the public page at the next publish, so removal follows the same
		 * rule as every other edit instead of being the one that takes effect
		 * while staff are still deciding.
		 */
		async deleteSection(id: number): Promise<'deleted' | 'marked'> {
			const section = await db.query.pageSections.findFirst({ where: eq(pageSections.id, id) });
			if (!section) return 'deleted';

			if (section.publishedAt === null) {
				await db.delete(pageSections).where(eq(pageSections.id, id));
				return 'deleted';
			}

			await db.update(pageSections).set({ pendingDelete: true }).where(eq(pageSections.id, id));
			return 'marked';
		},

		/** Takes back a removal that has not been published yet. */
		async restoreSection(id: number) {
			await db.update(pageSections).set({ pendingDelete: false }).where(eq(pageSections.id, id));
		},

		/**
		 * Applies a full new order as a draft, in one transaction.
		 *
		 * Scoped to `pageId` so a stale or tampered id list cannot touch another
		 * page's sections.
		 */
		async reorderSections(pageId: number, orderedIds: number[]) {
			await db.transaction(async (tx) => {
				for (const [index, id] of orderedIds.entries()) {
					await tx
						.update(pageSections)
						.set({ draftSortOrder: (index + 1) * 10 })
						.where(and(eq(pageSections.id, id), eq(pageSections.pageId, pageId)));
				}
			});
		},

		/**
		 * Moves one section up or down among its siblings.
		 *
		 * Expressed as a reorder of the whole page so that it writes a draft
		 * order like every other move, rather than swapping the live
		 * `sort_order` of two rows.
		 */
		async moveSection(id: number, direction: 'up' | 'down') {
			const section = await db.query.pageSections.findFirst({ where: eq(pageSections.id, id) });
			if (!section) return;

			const siblings = await db
				.select({ id: pageSections.id })
				.from(pageSections)
				.where(and(eq(pageSections.pageId, section.pageId), eq(pageSections.pendingDelete, false)))
				.orderBy(effectiveOrder, asc(pageSections.id));

			const order = siblings.map((row) => row.id);
			const index = order.indexOf(id);
			const target = direction === 'up' ? index - 1 : index + 1;
			if (index === -1 || target < 0 || target >= order.length) return;

			[order[index], order[target]] = [order[target], order[index]];

			await db.transaction(async (tx) => {
				for (const [position, sectionId] of order.entries()) {
					await tx
						.update(pageSections)
						.set({ draftSortOrder: (position + 1) * 10 })
						.where(eq(pageSections.id, sectionId));
				}
			});
		},

		/**
		 * Makes every waiting change live, in one transaction.
		 *
		 * All of it or none of it: a page half-published — a new section visible
		 * above a heading that still says the old thing — is worse than either
		 * state. Removals are applied first, then each draft is copied over its
		 * published counterpart, then the page itself is marked published and any
		 * schedule is consumed.
		 *
		 * A section staff deliberately unpublished keeps its status: publishing
		 * the page must not quietly put back something they took down. Only a
		 * section that has never been published is turned on here.
		 */
		async publishPage(pageId: number, now: Date = new Date()) {
			await db.transaction(async (tx) => {
				await tx
					.delete(pageSections)
					.where(and(eq(pageSections.pageId, pageId), eq(pageSections.pendingDelete, true)));

				await tx
					.update(pageSections)
					.set({
						config: sql`coalesce(${pageSections.draftConfig}, ${pageSections.config})`,
						sortOrder: sql`coalesce(${pageSections.draftSortOrder}, ${pageSections.sortOrder})`,
						draftConfig: null,
						draftSortOrder: null,
						status: sql`case when ${pageSections.publishedAt} is null then 'PUBLISHED' else ${pageSections.status} end`,
						publishedAt: sql`coalesce(${pageSections.publishedAt}, ${now})`
					})
					.where(eq(pageSections.pageId, pageId));

				await tx
					.update(pages)
					.set({ status: 'PUBLISHED', publishedAt: now, publishAt: null })
					.where(eq(pages.id, pageId));
			});
		},

		/** Sets or clears the time a page should go live by itself. */
		async schedulePage(pageId: number, publishAt: Date | null) {
			await db.update(pages).set({ publishAt }).where(eq(pages.id, pageId));
		},

		/**
		 * Pages whose scheduled time has passed. Read by the daily cron, which
		 * publishes each one.
		 */
		async listDueForPublish(now: Date = new Date()) {
			return db
				.select({ id: pages.id, title: pages.title, slug: pages.slug })
				.from(pages)
				.where(lte(pages.publishAt, now));
		},

		async savePage(input: { id?: number; title: string; slug: string; status?: string }) {
			const values = {
				title: input.title,
				slug: input.slug,
				status: input.status || 'PUBLISHED'
			};

			if (input.id) {
				const rows = await db.update(pages).set(values).where(eq(pages.id, input.id)).returning();
				return rows[0];
			} else {
				const rows = await db.insert(pages).values(values).returning();
				return rows[0];
			}
		},

		async deletePage(id: number) {
			await db.delete(pages).where(eq(pages.id, id));
		}
	};
}

export type { PendingChanges };
