/**
 * Who may see a prayer request, and in what form.
 *
 * Import-free so the rules are directly testable — this is the part of the
 * feature where a mistake does real pastoral harm, so it gets tested properly
 * rather than being trusted to a template condition.
 */

export type PrayerRequestRecord = {
	id: number;
	fullName: string | null;
	request: string;
	isPrivate: boolean;
	isAnonymous: boolean;
	sharedPublicly: boolean;
};

/** What the public wall renders. Never carries contact details. */
export type PublicPrayerVm = {
	id: number;
	/** 'Anonymous' when the person asked not to be named. */
	name: string;
	request: string;
};

/**
 * Whether a request may appear on a public wall.
 *
 * Requires BOTH the submitter's consent (`isPrivate === false`) and a staff
 * decision (`sharedPublicly`). Either alone is not enough: consent without
 * review means unmoderated content, and review without consent means publishing
 * something entrusted in confidence.
 */
export function canShowPublicly(record: PrayerRequestRecord): boolean {
	return !record.isPrivate && record.sharedPublicly;
}

/** Strips a record down to what a public page may render, or null. */
export function toPublicPrayer(record: PrayerRequestRecord): PublicPrayerVm | null {
	if (!canShowPublicly(record)) return null;

	return {
		id: record.id,
		name: record.isAnonymous || !record.fullName ? 'Anonymous' : record.fullName,
		request: record.request
	};
}

/** Filters a list to the publishable ones. */
export function toPublicPrayerList(records: PrayerRequestRecord[]): PublicPrayerVm[] {
	return records
		.map(toPublicPrayer)
		.filter((entry): entry is PublicPrayerVm => entry !== null);
}

/**
 * Whether staff may mark this request as publicly shareable.
 *
 * A private request can never be promoted — the answer is to ask the person,
 * not to flip a flag.
 */
export function canStaffShare(record: PrayerRequestRecord): boolean {
	return !record.isPrivate;
}
