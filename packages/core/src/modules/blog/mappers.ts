import { publicMediaUrl } from '../../util/public-media-url.js';
import type { blogs } from './schema.js';
import type { BlogCardVm, BlogPostVm } from './types.js';

type BlogRow = typeof blogs.$inferSelect;

export function toBlogCard(row: BlogRow): BlogCardVm {
	return {
		id: row.id,
		title: row.title,
		category: row.category,
		summary: row.summary,
		imageUrl: publicMediaUrl(row.imageUrl),
		createdAt: row.createdAt ?? new Date()
	};
}

export function toBlogPost(row: BlogRow): BlogPostVm {
	return {
		...toBlogCard(row),
		content: row.content ?? ''
	};
}
