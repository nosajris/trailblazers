/**
 * FormData parsing and validation.
 *
 * Every admin controller used to hand-parse its own `FormData` — twenty-one
 * near-identical blocks of `form.get('x')?.toString().trim()` followed by
 * ad-hoc `if (!x) return fail(400)`. `zod` was already a dependency of this
 * package and imported nowhere.
 *
 * This module turns that into one declarative step. Controllers describe the
 * shape they expect; parsing, coercion, trimming and error formatting happen
 * here.
 */

import { z } from 'zod';
import { Sanitizer } from './sanitizer.js';

export type FieldErrors = Record<string, string>;

export type ParseResult<T> = { success: true; data: T } | { success: false; errors: FieldErrors };

/**
 * Turns FormData into a plain object.
 *
 * Checkboxes are the awkward case: an unchecked box sends nothing at all, so
 * absence has to mean `false` rather than "not provided". Callers declare those
 * fields with `checkbox()` below, which treats `undefined` as false.
 */
export function formDataToObject(form: FormData): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	for (const [key, value] of form.entries()) {
		if (typeof value !== 'string') continue;

		// Repeated keys (multi-selects) collapse into an array.
		if (key in result) {
			const existing = result[key];
			result[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
		} else {
			result[key] = value;
		}
	}

	return result;
}

/** Flattens a ZodError into `{ fieldName: firstMessage }`. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
	const errors: FieldErrors = {};

	for (const issue of error.issues) {
		const key = issue.path.join('.') || '_form';
		// First message per field: forms show one message under one input.
		if (!(key in errors)) errors[key] = issue.message;
	}

	return errors;
}

/** Validates FormData against a schema, returning data or per-field errors. */
export function parseForm<T extends z.ZodTypeAny>(
	form: FormData,
	schema: T
): ParseResult<z.infer<T>> {
	const parsed = schema.safeParse(formDataToObject(form));

	if (!parsed.success) {
		return { success: false, errors: toFieldErrors(parsed.error) };
	}

	return { success: true, data: parsed.data };
}

/** A single message summarising a field-error map, for a form-level banner. */
export function summarizeErrors(errors: FieldErrors): string {
	const messages = Object.values(errors);
	if (messages.length === 0) return 'Please check the form and try again.';
	return messages[0];
}

/* ---------------------------------------------------------------- *
 * Reusable field schemas
 *
 * Sanitization lives here, in the validation layer, so it applies once at the
 * boundary rather than being remembered per controller. `Sanitizer` was
 * previously used in exactly one module despite the rule requiring it.
 * ---------------------------------------------------------------- */

/** Required text: trimmed, tag-stripped, non-empty. */
export function requiredText(label: string, max = 500) {
	return z
		.string({ required_error: `${label} is required` })
		.transform((value) => Sanitizer.text(value))
		.pipe(
			z
				.string()
				.min(1, `${label} is required`)
				.max(max, `${label} must be ${max} characters or fewer`)
		);
}

/** Optional text: trimmed and tag-stripped, empty string becomes undefined. */
export function optionalText(max = 5000) {
	return z
		.string()
		.optional()
		.transform((value) => {
			const clean = Sanitizer.text(value ?? '');
			return clean.length > 0 ? clean : undefined;
		})
		.pipe(z.string().max(max).optional());
}

/** An email address, lowercased and stripped of stray whitespace. */
export function email(label = 'Email') {
	return z
		.string({ required_error: `${label} is required` })
		.transform((value) => Sanitizer.email(value))
		.pipe(z.string().min(1, `${label} is required`).email(`Enter a valid ${label.toLowerCase()}`));
}

/** An optional phone number, kept as typed minus junk characters. */
export function optionalPhone() {
	return z
		.string()
		.optional()
		.transform((value) => {
			const clean = Sanitizer.phone(value ?? '');
			return clean.length > 0 ? clean : undefined;
		});
}

/** A database id arriving as a form string. */
export function id(label = 'Record') {
	return z.coerce
		.number({ invalid_type_error: `${label} reference is invalid` })
		.int(`${label} reference is invalid`)
		.positive(`${label} reference is invalid`);
}

/** An optional id — absent or empty means "creating a new record". */
export function optionalId(label = 'Record') {
	return z
		.union([z.literal(''), z.coerce.number().int().positive()])
		.optional()
		.transform((value) => (value === '' || value === undefined ? undefined : value))
		.pipe(z.number().int().positive(`${label} reference is invalid`).optional());
}

/**
 * An HTML checkbox. Unchecked boxes are omitted from FormData entirely, so
 * absence means false; browsers send 'on' when checked.
 */
export function checkbox() {
	return z
		.union([z.literal('on'), z.literal('true'), z.literal('false'), z.literal('')])
		.optional()
		.transform((value) => value === 'on' || value === 'true');
}

/** A value restricted to a fixed set, with a readable message. */
export function oneOf<const T extends readonly [string, ...string[]]>(values: T, label: string) {
	return z.enum(values, {
		errorMap: () => ({ message: `Choose a valid ${label.toLowerCase()}` })
	});
}

/** A date arriving as a form string. */
export function date(label = 'Date') {
	return z.coerce.date({
		invalid_type_error: `Enter a valid ${label.toLowerCase()}`,
		required_error: `${label} is required`
	});
}

/**
 * An optional absolute http(s) URL.
 *
 * The scheme check is the point: zod's `.url()` alone accepts `javascript:`
 * and `data:`, and these values end up in `href` and `src` attributes, so
 * accepting them would be a stored-XSS sink.
 */
export function optionalUrl(label = 'URL') {
	return z
		.string()
		.optional()
		.transform((value) => (value?.trim() ? value.trim() : undefined))
		.pipe(
			z
				.string()
				.url(`Enter a valid ${label.toLowerCase()}`)
				.refine(
					(value) => {
						try {
							const protocol = new URL(value).protocol;
							return protocol === 'http:' || protocol === 'https:';
						} catch {
							return false;
						}
					},
					{ message: `${label} must start with http:// or https://` }
				)
				.optional()
		);
}
