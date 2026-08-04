import { asc, eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { faqs } from './schema.js';
import { toFaqVm } from './mappers.js';
import type { FaqVm } from './types.js';

export function createFaqService(db: Database) {
	return {
		async listPublished(): Promise<FaqVm[]> {
			const rows = await db
				.select()
				.from(faqs)
				.where(eq(faqs.status, 'PUBLISHED'))
				.orderBy(asc(faqs.order), asc(faqs.id));
			return rows.map(toFaqVm);
		},

		async getAllForAdmin() {
			const rows = await db
				.select()
				.from(faqs)
				.orderBy(asc(faqs.order), asc(faqs.id));
			return rows.map((r) => ({
				id: r.id,
				question: r.question,
				answer: r.answer,
				order: r.order,
				status: r.status
			}));
		},

		async saveFaq(input: {
			id?: number;
			question: string;
			answer: string;
			order?: number;
			status?: string;
		}) {
			const values = {
				question: input.question,
				answer: input.answer,
				order: input.order ?? 0,
				status: input.status || 'PUBLISHED'
			};

			if (input.id) {
				const rows = await db.update(faqs).set(values).where(eq(faqs.id, input.id)).returning();
				return rows[0];
			} else {
				const rows = await db.insert(faqs).values(values).returning();
				return rows[0];
			}
		},

		async deleteFaq(id: number) {
			await db.delete(faqs).where(eq(faqs.id, id));
		}
	};
}

