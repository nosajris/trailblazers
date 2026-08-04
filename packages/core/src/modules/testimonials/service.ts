import { asc, desc, eq } from 'drizzle-orm';
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
		},

		async getAllForAdmin() {
			const rows = await db
				.select()
				.from(testimonials)
				.orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
			return rows.map((r) => ({
				id: r.id,
				name: r.name,
				role: r.role,
				content: r.content,
				rating: r.rating,
				isFeatured: r.isFeatured,
				status: r.status,
				sortOrder: r.sortOrder
			}));
		},

		async saveTestimonial(input: {
			id?: number;
			name: string;
			role?: string;
			content: string;
			rating?: number;
			isFeatured?: boolean;
			status?: string;
			sortOrder?: number;
		}) {
			const values = {
				name: input.name,
				role: input.role || null,
				content: input.content,
				rating: input.rating ?? 5,
				isFeatured: input.isFeatured ?? false,
				status: input.status || 'PUBLISHED',
				sortOrder: input.sortOrder ?? 0
			};

			if (input.id) {
				const rows = await db.update(testimonials).set(values).where(eq(testimonials.id, input.id)).returning();
				return rows[0];
			} else {
				const rows = await db.insert(testimonials).values(values).returning();
				return rows[0];
			}
		},

		async deleteTestimonial(id: number) {
			await db.delete(testimonials).where(eq(testimonials.id, id));
		}
	};
}

