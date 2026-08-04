import type { Database } from '../../db/client.js';
import { createSermonRepository } from './repository.js';
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

		async getSermonBySlug(slug: string) {
			return repo.findBySlug(slug);
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

