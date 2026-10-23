/** Input schema for the public "Give online" form. */

import { z } from 'zod';
import { email, optionalPhone, requiredText } from '../../util/form.js';

/** $1.00 to $10,000.00 — wide enough for a real gift, narrow enough that a typo (an extra zero) doesn't go through silently. */
export const MIN_GIVING_CENTS = 100;
export const MAX_GIVING_CENTS = 1_000_000;

export const PAYMENT_METHODS = ['ECOCASH', 'ONEMONEY', 'INNBUCKS', 'CARD', 'OTHER'] as const;

/**
 * The form takes dollars-and-cents as a person would type them ("25" or
 * "25.50"); `amountCents` is what the rest of the system works in, rounded
 * once here rather than carried as a float through a payment call.
 */
export const startGivingPaymentSchema = z
	.object({
		amount: z.coerce.number().positive('Enter an amount greater than zero.'),
		fullName: requiredText('Your name', 120),
		email: email(),
		phone: optionalPhone(),
		method: z.enum(PAYMENT_METHODS).default('ECOCASH'),
		provider: z.enum(['PAYNOW', 'PESEPAY']).optional()
	})
	.transform((data) => ({ ...data, amountCents: Math.round(data.amount * 100) }))
	.refine((data) => data.amountCents >= MIN_GIVING_CENTS, {
		message: 'Enter at least $1.00.',
		path: ['amount']
	})
	.refine((data) => data.amountCents <= MAX_GIVING_CENTS, {
		message: 'That amount looks too large — contact the office for a gift this size.',
		path: ['amount']
	});

export type StartGivingPaymentInput = z.infer<typeof startGivingPaymentSchema>;


/** Staff "mark as paid" override — see `markAsPaidManually` in service.ts. */
export const markPaymentPaidSchema = z.object({
	reference: requiredText('Reference', 64),
	note: requiredText('Note', 500)
});

export type MarkPaymentPaidInput = z.infer<typeof markPaymentPaidSchema>;
