import { and, desc, eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { blogs } from './schema.js';
import { toBlogCard, toBlogPost } from './mappers.js';
import type { BlogCardVm, BlogPostVm } from './types.js';

export function createBlogService(db: Database) {
	return {
		async listLatest(limit = 3): Promise<BlogCardVm[]> {
			const rows = await db
				.select()
				.from(blogs)
				.where(eq(blogs.status, 'PUBLISHED'))
				.orderBy(desc(blogs.createdAt))
				.limit(limit);
			return rows.map(toBlogCard);
		},

		async listPublished(limit = 48): Promise<BlogCardVm[]> {
			const cap = Math.min(100, Math.max(1, limit));
			const rows = await db
				.select()
				.from(blogs)
				.where(eq(blogs.status, 'PUBLISHED'))
				.orderBy(desc(blogs.createdAt))
				.limit(cap);
			return rows.map(toBlogCard);
		},

		async getPublishedPost(id: number): Promise<BlogPostVm | null> {
			const row = await db.query.blogs.findFirst({
				where: and(eq(blogs.id, id), eq(blogs.status, 'PUBLISHED'))
			});
			return row ? toBlogPost(row) : null;
		},

		async getById(id: number): Promise<BlogCardVm | null> {
			const row = await db.query.blogs.findFirst({
				where: and(eq(blogs.id, id), eq(blogs.status, 'PUBLISHED'))
			});
			return row ? toBlogCard(row) : null;
		}
	};
}
