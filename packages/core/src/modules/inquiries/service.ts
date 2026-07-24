import { desc } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { inquiries } from './schema.js';
import { Sanitizer } from '../../util/sanitizer.js';
import { logger } from '../../logger.js';

export type CreateInquiryInput = {
	name: string;
	email: string;
	message: string;
	type?: string;
	phone?: string;
};

export function createInquiryService(db: Database) {
	return {
		async createGeneral(input: CreateInquiryInput) {
			const cleanEmail = Sanitizer.email(input.email);
			const cleanName = Sanitizer.text(input.name);
			const cleanMsg = Sanitizer.text(input.message);

			logger.info('INQUIRY', `Creating general inquiry for ${cleanEmail}`);

			const rows = await db.insert(inquiries).values({
				name: cleanName,
				email: cleanEmail,
				message: cleanMsg,
				type: input.type ?? 'GENERAL',
				status: 'PENDING'
			}).returning();
			return rows[0];
		},

		async createInquiry(input: { fullName: string; email: string; message?: string; type?: string; phone?: string }) {
			const cleanEmail = Sanitizer.email(input.email);
			const cleanName = Sanitizer.text(input.fullName);
			const cleanMsg = Sanitizer.text(input.message);

			logger.info('INQUIRY', `Creating inquiry (${input.type || 'GENERAL'}) for ${cleanEmail}`);

			const rows = await db.insert(inquiries).values({
				name: cleanName,
				email: cleanEmail,
				message: cleanMsg,
				type: input.type ?? 'GENERAL',
				status: 'PENDING'
			}).returning();
			return rows[0];
		},

		async listForAdmin() {
			const rows = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
			return rows.map((r) => ({
				id: r.id,
				fullName: r.name,
				email: r.email,
				message: r.message || '',
				type: r.type || 'GENERAL',
				status: r.status || 'PENDING',
				createdAt: r.createdAt || new Date()
			}));
		}
	};
}
