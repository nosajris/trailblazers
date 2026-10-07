import { z } from 'zod';
import { Sanitizer } from '../../util/sanitizer.js';
import { optionalText, optionalUrl } from '../../util/form.js';
import {
	normalizeWhatsappNumber,
	parseCampuses,
	parseGivingMethods,
	parseSocialLinks,
	type CampusDetail,
	type GivingMethod,
	type SocialLink
} from './site-content.js';

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

export const MAX_GIVING_METHODS = 6;
export const MAX_SOCIAL_LINKS = 6;
export const MAX_CAMPUSES = 8;

/**
 * Turns one of the free-text settings blocks into structured data, surfacing a
 * parse failure as an ordinary field error so the staff portal can show it
 * under the right textarea.
 */
function parsedLines<T>(
	parse: (text: string | undefined) => { items: T[]; error?: string }
) {
	return z
		.string()
		.optional()
		.superRefine((value, ctx) => {
			const { error } = parse(value);
			if (error) ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
		})
		.transform((value) => parse(value).items);
}

/**
 * How people reach the church directly. The number is stored as digits so
 * every wa.me link is built the same way; an empty value hides the chat button
 * rather than rendering a dead link.
 */
export const contactChannelsSchema = z.object({
	whatsappNumber: z
		.string()
		.optional()
		.superRefine((value, ctx) => {
			const { error } = normalizeWhatsappNumber(value);
			if (error) ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
		})
		.transform((value) => normalizeWhatsappNumber(value).number ?? undefined),
	whatsappGreeting: optionalText(200)
});

/**
 * Giving details. Payment instructions are the content people actually need
 * and they vary by country, so they are staff-entered rather than hardcoded;
 * /give shows only what is filled in.
 */
export const givingDetailsSchema = z.object({
	givingNote: optionalText(600),
	givingMethods: parsedLines<GivingMethod>((text) => parseGivingMethods(text, MAX_GIVING_METHODS))
});

/**
 * How to reach a human.
 *
 * The site had no phone number, email address or postal address on any page —
 * only a contact form. Someone who wants to call before visiting, or a parent
 * checking out a camp, had no way to do it.
 */
export const contactDetailsSchema = z.object({
	contactPhone: optionalText(40),
	contactEmail: z
		.string()
		.optional()
		.transform((value) => (value ?? '').trim())
		.refine((value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
			message: 'Enter a valid email address, or leave it empty'
		})
		.transform((value) => (value === '' ? undefined : Sanitizer.email(value))),
	postalAddress: optionalText(300),
	officeHours: optionalText(200),
	socialLinks: parsedLines<SocialLink>((text) => parseSocialLinks(text, MAX_SOCIAL_LINKS))
});

/** Campuses, each of which gets its own public page at /campus/<id>. */
export const campusesSchema = z.object({
	campuses: parsedLines<CampusDetail>((text) => parseCampuses(text, MAX_CAMPUSES))
});

export type ContactChannels = z.infer<typeof contactChannelsSchema>;
export type ContactDetails = z.infer<typeof contactDetailsSchema>;
export type GivingDetails = z.infer<typeof givingDetailsSchema>;
export type Campuses = z.infer<typeof campusesSchema>;
