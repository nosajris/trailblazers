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
		}
	};
}
