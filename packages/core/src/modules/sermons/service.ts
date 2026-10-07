import type { Database } from '../../db/client.js';
import { createSermonRepository } from './repository.js';
import {
	toSeriesCard,
	toSermonCard,
	toSermonDetail,
	type SeriesCardVm,
	type SermonCardVm,
	type SermonDetailVm
} from './mappers.js';
import type { sermons } from './schema.js';

export function createSermonService(db: Database) {
	const repo = createSermonRepository(db);

	return {
		async getAllSermons() {
			return repo.findAll();
		},

		async getFeaturedSermon() {
			const featured = await repo.findFeatured();
			if (featured.length > 0) return featured[0];
			const all = await repo.findAll();
			return all[0] || null;
		},

		/**
		 * The newest message, as a card for the homepage.
		 *
		 * Returning a view model rather than the row keeps staff-only fields
		 * (notes, discussion guide) off the public page.
		 */
		async getLatestCard(): Promise<SermonCardVm | null> {
			const featured = await repo.findFeatured();
			const row = featured[0] ?? (await repo.findAll())[0];
			return row ? toSermonCard(row) : null;
		},

		async getSermonBySlug(slug: string) {
			return repo.findBySlug(slug);
		},

		/** Every published message as a card, newest first, for listings. */
		async listCards(): Promise<SermonCardVm[]> {
			const rows = await repo.findAll();
			return rows.map(toSermonCard);
		},

		/**
		 * One message's own page, or null when the slug is unknown.
		 *
		 * `slug` was populated on every row and used nowhere public, so no
		 * message could be shared, bookmarked or indexed.
		 */
		async getMessagePage(slug: string): Promise<SermonDetailVm | null> {
			const row = await repo.findBySlugWithSeries(slug);
			if (!row) return null;
			return toSermonDetail(
				row.sermon,
				row.series ? { title: row.series.title, slug: row.series.slug } : null
			);
		},

		/** Series that actually hold messages, for the Messages page. */
		async listSeriesCards(): Promise<SeriesCardVm[]> {
			const rows = await repo.findSeriesWithCounts();
			return rows.map(toSeriesCard);
		},

		/** One series and its messages, or null when the slug is unknown. */
		async getSeriesPage(
			slug: string
		): Promise<{ series: SeriesCardVm; messages: SermonCardVm[] } | null> {
			const series = await repo.findSeriesBySlug(slug);
			if (!series) return null;

			const rows = await repo.findBySeriesId(series.id);
			return {
				series: toSeriesCard({
					...series,
					messageCount: rows.length,
					latestPublishedAt: rows[0]?.publishedAt ?? null
				}),
				messages: rows.map(toSermonCard)
			};
		},

		async getSermonById(id: number) {
			return repo.findById(id);
		},

		async saveSermon(data: Partial<typeof sermons.$inferInsert> & { title: string }) {
			const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
			if (data.id) {
				return repo.update(data.id, { ...data, slug });
			}
			return repo.create({
				title: data.title,
				slug,
				speaker: data.speaker || 'Pastor / Speaker',
				videoUrl: data.videoUrl || null,
				youtubeId: data.youtubeId || null,
				audioUrl: data.audioUrl || null,
				scripture: data.scripture || null,
				summary: data.summary || null,
				notes: data.notes || null,
				discussionGuide: data.discussionGuide || null,
				notesUrl: data.notesUrl || null,
				isLiveNow: data.isLiveNow ?? false,
				liveStreamUrl: data.liveStreamUrl || null,
				thumbnailUrl: data.thumbnailUrl || null,
				isFeatured: data.isFeatured ?? false,
				publishedAt: data.publishedAt || new Date()
			});
		},

		async deleteSermon(id: number) {
			return repo.delete(id);
		},

		async getAllSeries() {
			return repo.findAllSeries();
		},

		async createSeries(title: string, description?: string, coverImageUrl?: string) {
			const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
			return repo.createSeries({ title, slug, description, coverImageUrl });
		},

		async deleteSeries(id: number) {
			return repo.deleteSeries(id);
		}
	};
}

