/**
 * Picks the event the hero should point at. Kept free of Svelte and the database
 * so it can be unit tested with `npm test`.
 */

type WithDate = { date: Date | string };

const toTime = (d: Date | string): number => new Date(d).getTime();

/** Earliest event that has not started yet, or null. Unparseable dates are skipped. */
export function pickNextEvent<T extends WithDate>(events: readonly T[], now: Date): T | null {
	let best: T | null = null;
	let bestTime = Infinity;
	for (const event of events) {
		const time = toTime(event.date);
		if (Number.isNaN(time) || time < now.getTime()) continue;
		if (time < bestTime) {
			best = event;
			bestTime = time;
		}
	}
	return best;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** "Today", "Tomorrow" or "In N days", counted in whole UTC calendar days. */
export function daysUntil(date: Date | string, now: Date): string {
	const startOfDay = (t: number) => Math.floor(t / DAY_MS);
	const diff = startOfDay(toTime(date)) - startOfDay(now.getTime());
	if (diff <= 0) return 'Today';
	if (diff === 1) return 'Tomorrow';
	return `In ${diff} days`;
}
