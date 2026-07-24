import type { faqs } from './schema.js';
import type { FaqVm } from './types.js';

type Row = typeof faqs.$inferSelect;

export function toFaqVm(row: Row): FaqVm {
	return {
		id: row.id,
		question: row.question,
		answer: row.answer,
		order: row.order ?? 0
	};
}
