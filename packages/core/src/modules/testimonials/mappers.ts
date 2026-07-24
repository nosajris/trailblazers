import type { testimonials } from './schema.js';
import type { TestimonialVm } from './types.js';

type Row = typeof testimonials.$inferSelect;

export function toTestimonialVm(row: Row): TestimonialVm {
	return {
		id: row.id,
		name: row.name,
		role: row.role,
		content: row.content,
		rating: row.rating ?? 5
	};
}
