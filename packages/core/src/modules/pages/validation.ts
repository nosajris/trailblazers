import { z } from 'zod';
import { optionalText, optionalUrl, requiredText } from '../../util/form.js';
import { formFieldsProblem, parseFormFields } from '../forms/form-fields.js';
import {
	BLOCKS,
	PAGE_SECTION_TYPES,
	projectConfig,
	type FlatSectionValues,
	type PageSectionType
} from './block-registry.js';

/** The widest count any block accepts, so the form agrees with the registry. */
export const MAX_EVENTS_RAIL_LIMIT =
	BLOCKS.EVENTS_RAIL.fields.find((field) => field.name === 'limit')?.max ?? 12;

/**
 * One page section as the staff editor submits it.
 *
 * The editor posts every input of the chosen block, so this validates the flat
 * form: that each value is the right shape and safe to store. *Which* of those
 * values is kept is the registry's decision, applied by `toSectionConfig` —
 * config is jsonb, and a setting a block does not declare has nothing to render
 * it.
 *
 * Image and video values end up in `src` attributes, hence `optionalUrl`, which
 * allows only http(s); plain `z.string().url()` would accept `javascript:`.
 *
 * `block-registry.test.ts` asserts this schema covers exactly the form fields
 * the registry declares, so a new field on a block cannot reach jsonb
 * unvalidated.
 */
export const pageSectionFields = z.object({
	sectionType: z.enum(PAGE_SECTION_TYPES, {
		errorMap: () => ({ message: 'Choose a section type' })
	}),
	status: z.enum(['PUBLISHED', 'DRAFT']).default('PUBLISHED'),
	title: optionalText(120),
	subtitle: optionalText(300),
	intro: optionalText(300),
	imageUrl: optionalUrl('Background image'),
	videoUrl: optionalUrl('Background video'),
	primaryCtaLabel: optionalText(40),
	primaryCtaHref: optionalText(300),
	secondaryCtaLabel: optionalText(40),
	secondaryCtaHref: optionalText(300),
	icon: optionalText(40),
	fieldsText: optionalText(2000),
	submitLabel: optionalText(40),
	successMessage: optionalText(300),
	limit: z
		.union([z.literal(''), z.coerce.number()])
		.optional()
		.transform((value) => (value === '' || value === undefined ? undefined : Number(value)))
		.pipe(
			z
				.number()
				.int()
				.min(1, 'Show at least one')
				.max(MAX_EVENTS_RAIL_LIMIT, `Show at most ${MAX_EVENTS_RAIL_LIMIT}`)
				.optional()
		)
});

/**
 * The same fields, plus the checks that depend on more than one of them.
 *
 * A FORM block's questions are content staff type, so "is this a usable form"
 * is a validation question rather than something to discover when the first
 * visitor cannot submit: the questions must parse, and one of them must collect
 * an email address, since `inquiries.email` is NOT NULL and an inquiry nobody
 * can answer is no use to the office.
 *
 * `pageSectionFields` stays exported as the plain object so
 * `block-registry.test.ts` can read its shape and assert every declared field
 * has a validator — `.superRefine` returns an effect, which has no `.shape`.
 */
export const pageSectionSchema = pageSectionFields.superRefine((value, ctx) => {
	if (value.sectionType !== 'FORM') return;

	const problem = formFieldsProblem(parseFormFields(value.fieldsText ?? ''));
	if (problem) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: problem, path: ['fieldsText'] });
	}
});

export type PageSectionInput = z.infer<typeof pageSectionSchema>;

/** A page itself: the slug is what the public URL will be. */
export const pageSchema = z.object({
	title: requiredText('Page title', 120),
	slug: requiredText('URL path', 120).pipe(
		z
			.string()
			.regex(
				// '/' itself, or one or more '/segment' parts. A segment is
				// lowercase alphanumerics with single hyphens inside it, so
				// '/about--' and '/about-' are refused along with '/About'.
				/^\/$|^(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)+$/,
				'Use a path like /about — lowercase letters, numbers and single hyphens'
			)
	),
	status: z.enum(['PUBLISHED', 'DRAFT']).default('PUBLISHED')
});

/**
 * Turns the validated form into the `config` a section stores.
 *
 * The registry owns the mapping — which fields this block has, how a call to
 * action is paired, and what a blank means — so the save path cannot disagree
 * with the render path the way it did when both were written by hand.
 */
export function toSectionConfig(input: PageSectionInput): Record<string, unknown> {
	return projectConfig(input.sectionType as PageSectionType, input as FlatSectionValues);
}
