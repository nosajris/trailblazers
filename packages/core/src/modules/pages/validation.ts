import { z } from 'zod';
import { optionalText, optionalUrl, requiredText } from '../../util/form.js';
import { PAGE_SECTION_TYPES } from './section-types.js';

export const MAX_EVENTS_RAIL_LIMIT = 12;

/** A link on a hero: both halves or neither, so no button renders with no destination. */
const ctaPair = {
	ctaLabel: optionalText(40),
	ctaHref: optionalText(300)
};

/**
 * One page section as the staff editor submits it.
 *
 * Config is stored as jsonb, so without validation here anything at all could
 * land in it and reach the public page. Image and video values end up in `src`
 * and `href`, hence `optionalUrl`, which allows only http(s).
 */
export const pageSectionSchema = z.object({
	sectionType: z.enum(PAGE_SECTION_TYPES, {
		errorMap: () => ({ message: 'Choose a section type' })
	}),
	status: z.enum(['PUBLISHED', 'DRAFT']).default('PUBLISHED'),
	title: optionalText(120),
	subtitle: optionalText(300),
	intro: optionalText(300),
	imageUrl: optionalUrl('Background image'),
	videoUrl: optionalUrl('Background video'),
	primaryCtaLabel: ctaPair.ctaLabel,
	primaryCtaHref: ctaPair.ctaHref,
	secondaryCtaLabel: ctaPair.ctaLabel,
	secondaryCtaHref: ctaPair.ctaHref,
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
 * Turns the flat form into the `config` shape each section strategy reads.
 * Empty values are dropped so a section never stores a blank it will render.
 */
export function toSectionConfig(input: PageSectionInput): Record<string, unknown> {
	const config: Record<string, unknown> = {};
	const put = (key: string, value: unknown) => {
		if (value !== undefined && value !== '') config[key] = value;
	};

	put('title', input.title);
	put('subtitle', input.subtitle);
	put('intro', input.intro);
	put('imageUrl', input.imageUrl);
	put('videoUrl', input.videoUrl);
	put('limit', input.limit);

	if (input.primaryCtaLabel && input.primaryCtaHref) {
		config.primaryCta = { label: input.primaryCtaLabel, href: input.primaryCtaHref };
	}
	if (input.secondaryCtaLabel && input.secondaryCtaHref) {
		config.secondaryCta = { label: input.secondaryCtaLabel, href: input.secondaryCtaHref };
	}

	return config;
}
