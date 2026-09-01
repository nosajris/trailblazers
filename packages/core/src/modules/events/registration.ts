/**
 * Registration rules, kept separate from the database so they are directly
 * testable. Import-free on purpose.
 */

export type RegistrationStatus = 'CONFIRMED' | 'WAITLIST' | 'CANCELLED';

export type CapacityState = {
	/** Seats on the event. Null or 0 means unlimited. */
	capacity: number | null;
	/** How many CONFIRMED registrations already exist. */
	confirmed: number;
};

/**
 * Whether a new registration takes a seat or joins the waitlist.
 *
 * An event with no capacity set is treated as unlimited rather than as zero
 * seats — otherwise every existing event, none of which has ever had a
 * capacity meaningfully set, would waitlist everybody.
 */
export function nextRegistrationStatus(state: CapacityState): RegistrationStatus {
	if (state.capacity === null || state.capacity <= 0) return 'CONFIRMED';
	return state.confirmed < state.capacity ? 'CONFIRMED' : 'WAITLIST';
}

/** Seats left, or null when the event is unlimited. */
export function seatsRemaining(state: CapacityState): number | null {
	if (state.capacity === null || state.capacity <= 0) return null;
	return Math.max(0, state.capacity - state.confirmed);
}

/** True when a registration would go to the waitlist. */
export function isFull(state: CapacityState): boolean {
	return nextRegistrationStatus(state) === 'WAITLIST';
}

/**
 * Whether registration is open at all.
 *
 * Closed once the event has started: taking a booking for something already
 * under way only creates a conversation the office has to unwind.
 */
export function isRegistrationOpen(eventDate: Date, now: Date = new Date()): boolean {
	return eventDate.getTime() > now.getTime();
}

/**
 * Who to promote when a confirmed seat is released.
 *
 * Waitlisted registrations are promoted oldest-first, which is the only order
 * anybody can argue is fair.
 */
export function nextInLine<T extends { status: RegistrationStatus; createdAt: Date }>(
	registrations: T[]
): T | null {
	const waiting = registrations
		.filter((r) => r.status === 'WAITLIST')
		.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

	return waiting[0] ?? null;
}
