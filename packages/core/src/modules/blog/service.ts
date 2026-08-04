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
		},

		async getAllForAdmin() {
			const rows = await db
				.select()
				.from(blogs)
				.orderBy(desc(blogs.createdAt));
			return rows.map((r) => ({
				...toBlogPost(r),
				status: r.status,
				createdAt: r.createdAt || new Date()
			}));
		},

		async savePost(input: {
			id?: number;
			title: string;
			category?: string;
			summary: string;
			content?: string;
			imageUrl?: string;
			authorId?: number;
			status?: string;
		}) {
			const values = {
				title: input.title,
				category: input.category || 'Story',
				summary: input.summary,
				content: input.content || '',
				imageUrl: input.imageUrl || null,
				authorId: input.authorId || null,
				status: input.status || 'PUBLISHED',
				publishedAt: (input.status === 'PUBLISHED' || !input.status) ? new Date() : null
			};

			if (input.id) {
				const rows = await db.update(blogs).set(values).where(eq(blogs.id, input.id)).returning();
				return rows[0];
			} else {
				const rows = await db.insert(blogs).values(values).returning();
				return rows[0];
			}
		},

		async deletePost(id: number) {
			await db.delete(blogs).where(eq(blogs.id, id));
		}
	};
}

