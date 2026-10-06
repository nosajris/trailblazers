import { z } from 'zod';
import { Sanitizer } from '../../util/sanitizer.js';
import { optionalText, optionalUrl } from '../../util/form.js';

export const MAX_VISIT_TIMES = 8;

/** One gathering time per line; blank lines dropped, tags stripped. */
const visitTimes = z
	.string()
	.optional()
	.transform((value) =>
		(value ?? '')
			.split(/\r?\n/)
			.map((line) => Sanitizer.text(line))
			.filter((line) => line.length > 0)
	)
	.pipe(
		z
			.array(z.string().max(120, 'Each gathering time must be 120 characters or fewer'))
			.max(MAX_VISIT_TIMES, `Add at most ${MAX_VISIT_TIMES} gathering times`)
	);

/**
 * What a first-time visitor needs before they arrive. Edited in the staff portal
 * and shown on /plan-a-visit only when filled in, so nothing is invented.
 * `visitMapUrl` ends up in an href, hence `optionalUrl` (http/https only).
 */
export const visitDetailsSchema = z.object({
	visitTimes,
	visitAddress: optionalText(300),
	visitNotes: optionalText(600),
	visitMapUrl: optionalUrl('Map link')
});

export type VisitDetails = z.infer<typeof visitDetailsSchema>;
