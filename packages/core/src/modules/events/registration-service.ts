/**
 * Event registration.
 *
 * The capacity decisions live in `registration.ts` (pure, tested); this file
 * only talks to the database.
 */

import { and, count, desc, eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { events, eventRegistrations } from './schema.js';
import { PolicyError } from '../iam/permissions.js';
import { Sanitizer } from '../../util/sanitizer.js';
import { logger } from '../../logger.js';
import {
	isRegistrationOpen,
	nextRegistrationStatus,
	seatsRemaining,
	type RegistrationStatus
} from './registration.js';

export type RegisterInput = {
	eventId: number;
	fullName: string;
	email: string;
	phone?: string;
	notes?: string;
};

export type RegisterResult = {
	status: RegistrationStatus;
	/** True when this email was already registered for this event. */
	alreadyRegistered: boolean;
	eventTitle: string;
	seatsLeft: number | null;
};

export function createEventRegistrationService(db: Database) {
	/** Confirmed seats taken for an event. */
	async function countConfirmed(eventId: number): Promise<number> {
		const rows = await db
			.select({ value: count() })
			.from(eventRegistrations)
			.where(
				and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.status, 'CONFIRMED'))
			);
		return rows[0]?.value ?? 0;
	}

	return {
		countConfirmed,

		/** Seat availability, for rendering the form. */
		async getAvailability(eventId: number) {
			const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
			if (!event) return null;

			const confirmed = await countConfirmed(eventId);
			const state = { capacity: event.capacity, confirmed };

			return {
				capacity: event.capacity,
				confirmed,
				seatsLeft: seatsRemaining(state),
				isOpen: isRegistrationOpen(event.date),
				willWaitlist: nextRegistrationStatus(state) === 'WAITLIST'
			};
		},

		/**
		 * Registers someone, or puts them on the waitlist when the event is full.
		 *
		 * Submitting twice is idempotent: the unique index on (event, email)
		 * means the second attempt updates the existing row instead of taking a
		 * second seat.
		 */
		async register(input: RegisterInput): Promise<RegisterResult> {
			const email = Sanitizer.email(input.email);
			const fullName = Sanitizer.text(input.fullName);

			const event = await db.query.events.findFirst({ where: eq(events.id, input.eventId) });
			if (!event || event.status !== 'PUBLISHED') {
				throw new PolicyError('That event is not open for registration.');
			}

			if (!isRegistrationOpen(event.date)) {
				throw new PolicyError('Registration for this event has closed.');
			}

			const existing = await db
				.select()
				.from(eventRegistrations)
				.where(
					and(eq(eventRegistrations.eventId, input.eventId), eq(eventRegistrations.email, email))
				)
				.limit(1);

			if (existing[0] && existing[0].status !== 'CANCELLED') {
				return {
					status: existing[0].status as RegistrationStatus,
					alreadyRegistered: true,
					eventTitle: event.title,
					seatsLeft: seatsRemaining({
						capacity: event.capacity,
						confirmed: await countConfirmed(input.eventId)
					})
				};
			}

			const confirmed = await countConfirmed(input.eventId);
			const status = nextRegistrationStatus({ capacity: event.capacity, confirmed });

			const values = {
				eventId: input.eventId,
				fullName,
				email,
				phone: input.phone ? Sanitizer.phone(input.phone) : null,
				notes: input.notes ? Sanitizer.text(input.notes) : null,
				status
			};

			// Re-registering after cancelling reuses the row the unique index
			// already holds.
			await db
				.insert(eventRegistrations)
				.values(values)
				.onConflictDoUpdate({
					target: [eventRegistrations.eventId, eventRegistrations.email],
					set: { status, fullName: values.fullName, phone: values.phone, notes: values.notes }
				});

			logger.info('EventRegistration', 'registered', { eventId: input.eventId, status });

			return {
				status,
				alreadyRegistered: false,
				eventTitle: event.title,
				seatsLeft: seatsRemaining({
					capacity: event.capacity,
					confirmed: status === 'CONFIRMED' ? confirmed + 1 : confirmed
				})
			};
		},

		/** Registrations for one event, for the staff portal. */
		async listForEvent(eventId: number) {
			return db
				.select()
				.from(eventRegistrations)
				.where(eq(eventRegistrations.eventId, eventId))
				.orderBy(desc(eventRegistrations.createdAt));
		}
	};
}
