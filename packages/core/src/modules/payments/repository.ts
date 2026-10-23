import { and, count, desc, eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { payments } from './schema.js';
import type { PaymentMethod, PaymentStatus } from './types.js';

export type InsertPaymentInput = {
	reference: string;
	purpose: 'GIVING' | 'EVENT_REGISTRATION';
	purposeId?: number;
	provider: 'PAYNOW' | 'PESEPAY';
	providerReference?: string;
	amount: number;
	currency: string;
	payerName: string;
	payerEmail: string;
	payerPhone?: string;
	method?: PaymentMethod;
};

export function createPaymentsRepository(db: Database) {
	return {
		async insert(values: InsertPaymentInput) {
			const rows = await db.insert(payments).values(values).returning();
			return rows[0];
		},

		async findByReference(reference: string) {
			const rows = await db
				.select()
				.from(payments)
				.where(eq(payments.reference, reference))
				.limit(1);
			return rows[0] ?? null;
		},

		/**
		 * Moves a payment to its terminal (or still-pending) status, recording
		 * the provider's own reference and raw payload once known. Called from
		 * both the result callback and the active poll fallback, so it is
		 * idempotent by nature — setting the same status twice changes nothing
		 * a caller needs to react to differently.
		 */
		async updateStatus(
			reference: string,
			status: PaymentStatus,
			extra: { providerReference?: string; rawResult?: Record<string, unknown> } = {}
		) {
			const rows = await db
				.update(payments)
				.set({
					status,
					providerReference: extra.providerReference,
					rawResult: extra.rawResult,
					updatedAt: new Date()
				})
				.where(eq(payments.reference, reference))
				.returning();
			return rows[0] ?? null;
		},

		async findByPurpose(purpose: 'GIVING' | 'EVENT_REGISTRATION', purposeId: number) {
			const rows = await db
				.select()
				.from(payments)
				.where(and(eq(payments.purpose, purpose), eq(payments.purposeId, purposeId)));
			return rows;
		},

		/** Newest first, paged — the admin listing. */
		listForAdminPage(limit: number, offset: number) {
			return db.select().from(payments).orderBy(desc(payments.createdAt)).limit(limit).offset(offset);
		},

		/** Total rows, for the pager. */
		countAll() {
			return db.select({ value: count() }).from(payments);
		},

		/** Sum of PAID amounts, in cents — the giving-tile total. */
		async sumPaidAmount() {
			const rows = await db
				.select({ value: payments.amount })
				.from(payments)
				.where(and(eq(payments.status, 'PAID'), eq(payments.purpose, 'GIVING')));
			return rows.reduce((total, row) => total + row.value, 0);
		},

		async countByStatus(status: PaymentStatus) {
			const rows = await db.select({ value: count() }).from(payments).where(eq(payments.status, status));
			return rows[0]?.value ?? 0;
		},

		/** Every payment under one payer email, newest first — a member's "my gifts" tile. */
		async listForEmail(email: string) {
			return db
				.select()
				.from(payments)
				.where(eq(payments.payerEmail, email))
				.orderBy(desc(payments.createdAt));
		}
	};
}
