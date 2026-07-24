import { asc, eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { testimonials } from './schema.js';
import { toTestimonialVm } from './mappers.js';
import type { TestimonialVm } from './types.js';

export function createTestimonialService(db: Database) {
	return {
		async listPublished(): Promise<TestimonialVm[]> {
			const rows = await db
				.select()
				.from(testimonials)
				.where(eq(testimonials.status, 'PUBLISHED'))
				.orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
			return rows.map(toTestimonialVm);
		}
	};
}
