import { error, redirect } from '@sveltejs/kit';
import {
	composeInquiry,
	formFieldsProblem,
	logger,
	parseFormFields,
	validateSubmission
} from '@trailblazers/core';
import { services } from '$lib/server/services';
import { guardFormSubmission } from '$lib/server/form-guard';
import type { RequestHandler } from './$types';

/**
 * Where a FORM block's submissions land.
 *
 * One endpoint for every staff-built form on the site, rather than an action on
 * each page route: a form block can be dropped on any CMS page, including pages
 * that do not exist yet, so per-route wiring would mean a developer every time
 * someone adds a form — which is the thing the block exists to avoid.
 *
 * It answers with a redirect in every case, so the form works with no
 * JavaScript and a reload never resubmits. The cost of that is field-level
 * errors cannot be returned with the answers intact, so `?fields=` names the
 * questions to look at and the block marks those.
 *
 * `reason` is a fixed code, never a message: nothing a visitor can edit in the
 * URL is rendered back to them as our own words.
 */
const FORM_NAME = 'cms-form';

function back(slug: string, sectionId: number, params: Record<string, string>): never {
	const query = new URLSearchParams(params).toString();
	redirect(303, `${slug}?${query}#form-${sectionId}`);
}

export const POST: RequestHandler = async ({ params, request, getClientAddress }) => {
	const sectionId = Number(params.sectionId);
	if (!Number.isInteger(sectionId) || sectionId <= 0) error(404, 'No such form.');

	// Only a form a visitor could actually have seen: published section, on a
	// published page. A draft form is not a submission endpoint.
	const section = await services.pages.getPublishedFormSection(sectionId);
	if (!section) error(404, 'No such form.');

	const form = await request.formData();
	const config = (section.config ?? {}) as Record<string, unknown>;
	const title = typeof config.title === 'string' && config.title ? config.title : 'Get in touch';

	const guard = await guardFormSubmission(form, FORM_NAME, getClientAddress());
	if (!guard.ok) {
		// A bot: answer exactly as a success and drop it, so the decoy field is
		// never named.
		if (guard.pretendSuccess) back(section.slug, sectionId, { sent: String(sectionId) });

		back(section.slug, sectionId, {
			formError: String(sectionId),
			reason: guard.status === 429 ? 'throttled' : 'stale'
		});
	}

	const fields = parseFormFields(typeof config.fieldsText === 'string' ? config.fieldsText : '');
	if (formFieldsProblem(fields)) {
		// The block renders nothing in this state, so there is no form to submit
		// from — this is a stale page, or a hand-made POST.
		error(404, 'No such form.');
	}

	const answers: Record<string, string> = {};
	for (const field of fields) {
		answers[field.name] = form.get(field.name)?.toString() ?? '';
	}

	const checked = validateSubmission(fields, answers);
	if (!checked.ok) {
		back(section.slug, sectionId, {
			formError: String(sectionId),
			reason: 'invalid',
			fields: Object.keys(checked.errors).join(',')
		});
	}

	const inquiry = composeInquiry(title, fields, checked.values);

	try {
		// Sanitisation happens in the inquiry service, as it does for every other
		// public submission.
		await services.inquiries.createGeneral({
			name: inquiry.name,
			email: inquiry.email,
			message: inquiry.message,
			type: 'FORM'
		});
	} catch (err) {
		logger.error('CmsForm', 'submission failed', {
			sectionId,
			message: err instanceof Error ? err.message : String(err)
		});
		back(section.slug, sectionId, { formError: String(sectionId), reason: 'failed' });
	}

	// Never throws, so a mail problem cannot cost the visitor their submission —
	// the answers are already filed.
	await services.email.notifyOffice(
		`Website form: ${title}`,
		`${inquiry.message}\n\nReply to: ${inquiry.email}`,
		inquiry.email
	);

	logger.info('CmsForm', 'submission filed', { sectionId });
	back(section.slug, sectionId, { sent: String(sectionId) });
};
