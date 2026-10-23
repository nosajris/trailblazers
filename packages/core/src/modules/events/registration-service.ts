/**
 * Event registration.
 *
 * The capacity decisions live in `registration.ts` (pure, tested); this file
 * only talks to the database.
 */

import { and, count, desc, eq, inArray, isNull } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { events, eventRegistrations } from './schema.js';
import { PolicyError } from '../iam/permissions.js';
import { Sanitizer } from '../../util/sanitizer.js';
import { logger } from '../../logger.js';
import {
	isDueForReminder,
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
	registrationId: number;
	status: RegistrationStatus;
	/** True when this email was already registered for this event. */
	alreadyRegistered: boolean;
	eventTitle: string;
	seatsLeft: number | null;
	/** True when `status` is PENDING_PAYMENT — the caller must start a payment next. */
	requiresPayment: boolean;
	/** Integer cents. 0 for a free event. */
	priceCents: number;
};

export function createEventRegistrationService(db: Database) {
	/**
	 * Confirmed seats taken for an event. PENDING_PAYMENT does not count: a
	 * seat is only taken once it is paid for, same as it is only taken once
	 * capacity is checked against CONFIRMED rows on a free event.
	 */
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
			const priceCents = event.price ?? 0;

			return {
				capacity: event.capacity,
				confirmed,
				priceCents,
				seatsLeft: seatsRemaining(state),
				isOpen: isRegistrationOpen(event.date),
				willWaitlist: nextRegistrationStatus(state, priceCents) === 'WAITLIST'
			};
		},

		/**
		 * Registers someone, or puts them on the waitlist when the event is
		 * full, or marks them PENDING_PAYMENT when the event is priced — see
		 * `nextRegistrationStatus`. The caller is responsible for starting a
		 * payment (`services.payments.startPayment`) when `requiresPayment` is
		 * true; this method never talks to the payments module, so an event
		 * module change here never has to know about Paynow or Pesepay.
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

			const priceCents = event.price ?? 0;

			const existing = await db
				.select()
				.from(eventRegistrations)
				.where(
					and(eq(eventRegistrations.eventId, input.eventId), eq(eventRegistrations.email, email))
				)
				.limit(1);

			if (existing[0] && existing[0].status !== 'CANCELLED') {
				return {
					registrationId: existing[0].id,
					status: existing[0].status as RegistrationStatus,
					alreadyRegistered: true,
					eventTitle: event.title,
					seatsLeft: seatsRemaining({
						capacity: event.capacity,
						confirmed: await countConfirmed(input.eventId)
					}),
					requiresPayment: existing[0].status === 'PENDING_PAYMENT',
					priceCents
				};
			}

			const confirmed = await countConfirmed(input.eventId);
			const status = nextRegistrationStatus({ capacity: event.capacity, confirmed }, priceCents);

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
			const [saved] = await db
				.insert(eventRegistrations)
				.values(values)
				.onConflictDoUpdate({
					target: [eventRegistrations.eventId, eventRegistrations.email],
					set: { status, fullName: values.fullName, phone: values.phone, notes: values.notes }
				})
				.returning();

			logger.info('EventRegistration', 'registered', { eventId: input.eventId, status });

			return {
				registrationId: saved.id,
				status,
				alreadyRegistered: false,
				eventTitle: event.title,
				seatsLeft: seatsRemaining({
					capacity: event.capacity,
					confirmed: status === 'CONFIRMED' ? confirmed + 1 : confirmed
				}),
				requiresPayment: status === 'PENDING_PAYMENT',
				priceCents
			};
		},

		/**
		 * Moves a PENDING_PAYMENT registration to CONFIRMED once its payment is
		 * PAID. Called from the payments callback route and from the public
		 * payment-status page's active poll — both compose this service with
		 * `services.payments`, which never calls it itself (see the module doc
		 * comment in `payments/service.ts`).
		 *
		 * Idempotent on purpose: a registration that is already CONFIRMED (a
		 * second callback for the same payment) is left exactly as it is, and
		 * one that was CANCELLED by staff in the meantime is not silently
		 * revived by a late callback.
		 */
		async confirmPaidRegistration(registrationId: number) {
			const rows = await db
				.update(eventRegistrations)
				.set({ status: 'CONFIRMED' })
				.where(
					and(
						eq(eventRegistrations.id, registrationId),
						eq(eventRegistrations.status, 'PENDING_PAYMENT')
					)
				)
				.returning();

			if (rows[0]) {
				logger.info('EventRegistration', 'payment confirmed, seat granted', { registrationId });
			}

			return rows[0] ?? null;
		},

		async getById(registrationId: number) {
			const rows = await db
				.select()
				.from(eventRegistrations)
				.where(eq(eventRegistrations.id, registrationId))
				.limit(1);
			return rows[0] ?? null;
		},

		/** Registrations for one event, for the staff portal. */
		async listForEvent(eventId: number) {
			return db
				.select()
				.from(eventRegistrations)
				.where(eq(eventRegistrations.eventId, eventId))
				.orderBy(desc(eventRegistrations.createdAt));
		},

		/**
		 * Every registration under one email, newest first — the "my
		 * registrations" tile on a signed-in member's account page. Joined
		 * with `events` for the title/date a member actually wants to see,
		 * rather than making the page do a second round of lookups.
		 */
		async listForEmail(email: string) {
			return db
				.select({
					registrationId: eventRegistrations.id,
					status: eventRegistrations.status,
					createdAt: eventRegistrations.createdAt,
					eventId: events.id,
					eventTitle: events.title,
					eventDate: events.date,
					eventLocation: events.location
				})
				.from(eventRegistrations)
				.innerJoin(events, eq(eventRegistrations.eventId, events.id))
				.where(eq(eventRegistrations.email, Sanitizer.email(email)))
				.orderBy(desc(eventRegistrations.createdAt));
		},

		/**
		 * Confirmed registrations for an event starting 20-32 hours from now
		 * that have not had their reminder yet — see `isDueForReminder` for why
		 * the window is wide rather than a strict "tomorrow". Published events
		 * only: a draft or unpublished event should not be emailing anyone.
		 */
		async listDueForReminders(now: Date = new Date()) {
			const rows = await db
				.select({
					registrationId: eventRegistrations.id,
					fullName: eventRegistrations.fullName,
					email: eventRegistrations.email,
					eventId: events.id,
					eventTitle: events.title,
					eventDate: events.date,
					eventLocation: events.location
				})
				.from(eventRegistrations)
				.innerJoin(events, eq(eventRegistrations.eventId, events.id))
				.where(
					and(
						eq(eventRegistrations.status, 'CONFIRMED'),
						eq(events.status, 'PUBLISHED'),
						isNull(eventRegistrations.reminderSentAt)
					)
				);

			return rows.filter((row) => isDueForReminder(row.eventDate, now));
		},

		/** Marks a batch of registrations as reminded, so the next run skips them. */
		async markReminded(registrationIds: number[]) {
			if (registrationIds.length === 0) return;
			await db
				.update(eventRegistrations)
				.set({ reminderSentAt: new Date() })
				.where(inArray(eventRegistrations.id, registrationIds));
		}
	};
}
