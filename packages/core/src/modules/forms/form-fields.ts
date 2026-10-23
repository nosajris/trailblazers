/**
 * The fields of a staff-built form, as one record per line.
 *
 * A FORM block lets staff put a form on any CMS page without a developer, which
 * means the questions themselves are content. They are edited as lines —
 *
 *     Your name | text | required
 *     Email | email | required
 *     Which service? | choice: 7am, 9am, 11am
 *     Anything else | long
 *
 * — the same shape site settings already use for giving methods and campuses
 * (ADR 0008), parsed by pure functions that are the single definition of the
 * format. A line is forgiving on purpose: an unknown kind becomes a text box
 * rather than silently dropping a question staff meant to ask.
 *
 * Everything here is pure and free of imports, so the format, the validation of
 * an answer and the shape of the resulting inquiry are all testable without a
 * database or a browser.
 */

export const MAX_FORM_FIELDS = 12;

/** Longest answer accepted for each kind of field. */
const MAX_ANSWER_LENGTH: Record<FormFieldKind, number> = {
	text: 200,
	long: 2000,
	email: 200,
	phone: 40,
	choice: 80
};

export type FormFieldKind = 'text' | 'long' | 'email' | 'phone' | 'choice';

export type FormFieldDef = {
	/** The input's `name`, derived from the label and unique within the form. */
	name: string;
	label: string;
	kind: FormFieldKind;
	required: boolean;
	/** For `choice`, the options offered. Empty for every other kind. */
	options: string[];
};

const KINDS: FormFieldKind[] = ['text', 'long', 'email', 'phone', 'choice'];

/** A label becomes a field name: lowercase, hyphenated, punctuation dropped. */
function toFieldName(label: string): string {
	const slug = label
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return slug === '' ? 'field' : slug.slice(0, 40);
}

export function parseFormFields(text: string): FormFieldDef[] {
	const fields: FormFieldDef[] = [];
	const used = new Map<string, number>();

	for (const rawLine of (text ?? '').split('\n')) {
		if (fields.length >= MAX_FORM_FIELDS) break;

		const line = rawLine.trim();
		if (line === '' || line.startsWith('#')) continue;

		const parts = line.split('|').map((part) => part.trim());
		const label = parts[0];
		if (!label) continue;

		const required = parts.slice(1).some((part) => part.toLowerCase() === 'required');

		let kind: FormFieldKind = 'text';
		let options: string[] = [];

		for (const part of parts.slice(1)) {
			const lower = part.toLowerCase();

			if (lower.startsWith('choice')) {
				options = part
					.slice(part.indexOf(':') + 1)
					.split(',')
					.map((option) => option.trim())
					.filter((option) => option.length > 0);
				// A closed list with nothing in it would render an empty menu, so
				// it falls back to a text box.
				if (part.includes(':') && options.length > 0) kind = 'choice';
				continue;
			}

			if ((KINDS as string[]).includes(lower)) kind = lower as FormFieldKind;
		}

		// Two questions worded the same way would otherwise submit under one
		// name, and the second would overwrite the first.
		const base = toFieldName(label);
		const seen = used.get(base) ?? 0;
		used.set(base, seen + 1);
		const name = seen === 0 ? base : `${base}-${seen + 1}`;

		fields.push({ name, label: label.slice(0, 80), kind, required, options });
	}

	return fields;
}

/**
 * Why a set of fields cannot be published yet, or null when it can.
 *
 * Checked when the section is saved rather than when it is submitted: a form
 * with no way to reply is a problem for staff to see while they are building
 * it, not for a visitor to discover afterwards.
 */
export function formFieldsProblem(fields: FormFieldDef[]): string | null {
	if (fields.length === 0) return 'Add at least one question, one per line.';

	if (!fields.some((field) => field.kind === 'email')) {
		// `inquiries.email` is NOT NULL, and an inquiry nobody can answer is of
		// no use to the office.
		return 'Add a field of kind "email" — staff reply to that address.';
	}

	return null;
}

export type SubmissionValues = Record<string, string | undefined>;

export type SubmissionCheck =
	| { ok: true; values: Record<string, string> }
	| { ok: false; errors: Record<string, string> };

/** Checks one visitor's answers against the fields staff defined. */
export function validateSubmission(
	fields: FormFieldDef[],
	values: SubmissionValues
): SubmissionCheck {
	const errors: Record<string, string> = {};
	const cleaned: Record<string, string> = {};

	for (const field of fields) {
		const answer = (values[field.name] ?? '').trim();

		if (answer === '') {
			if (field.required) errors[field.name] = `${field.label} is required.`;
			continue;
		}

		if (answer.length > MAX_ANSWER_LENGTH[field.kind]) {
			errors[field.name] = `${field.label} is too long.`;
			continue;
		}

		if (field.kind === 'email' && !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(answer)) {
			errors[field.name] = `${field.label} needs to be an email address.`;
			continue;
		}

		// A closed list is closed on the server too: the options are the only
		// answers, whatever was actually posted.
		if (field.kind === 'choice' && !field.options.includes(answer)) {
			errors[field.name] = `Choose one of the options for ${field.label}.`;
			continue;
		}

		cleaned[field.name] = answer;
	}

	if (Object.keys(errors).length > 0) return { ok: false, errors };
	return { ok: true, values: cleaned };
}

export type ComposedInquiry = {
	name: string;
	email: string;
	message: string;
};

/**
 * Turns answers into the inquiry row staff read in the portal.
 *
 * The office sees one list of questions and answers, led by the form's own
 * title, so a form staff invented this morning is readable without anyone
 * having to know which section it came from. Sanitisation happens after this,
 * in the inquiry service, as it does for every other submission.
 */
export function composeInquiry(
	formTitle: string,
	fields: FormFieldDef[],
	values: SubmissionValues
): ComposedInquiry {
	const answered = fields
		.map((field) => ({ field, answer: (values[field.name] ?? '').trim() }))
		.filter((entry) => entry.answer !== '');

	const email = answered.find((entry) => entry.field.kind === 'email')?.answer ?? '';
	const name = answered.find((entry) => entry.field.kind === 'text')?.answer ?? 'Website visitor';

	const lines = answered.map((entry) => `${entry.field.label}: ${entry.answer}`);
	const message = [`${formTitle}`, '', ...lines].join('\n');

	return { name, email, message };
}
