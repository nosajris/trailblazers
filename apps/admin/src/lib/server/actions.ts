import { fail } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import {
	PolicyError,
	logger,
	parseForm,
	summarizeErrors,
	type AdminSection,
	type PublicUserVm
} from '@trailblazers/core';
import { requireSection } from './auth.js';
import { services } from './services.js';

/**
 * One place for the shape every admin form action shares.
 *
 * All twenty-one admin controllers repeated the same block by hand: parse
 * FormData field by field, check a couple of them, call a service, write an
 * audit log, return `{ success: true }`. The repetition made the audit call
 * easy to forget and let error handling drift from route to route.
 *
 * Here it is expressed once. A route declares the section it belongs to, a zod
 * schema, what to do, and what to record — and gets consistent validation,
 * authorization, error handling and audit logging for free.
 */

export type AuditEntry = {
	/** Verb, e.g. 'UPDATE_EVENT'. */
	action: string;
	/** Noun, e.g. 'EVENT'. */
	entityType: string;
	entityId?: string | number | null;
	details?: string;
};

export type ActionConfig<S extends z.ZodTypeAny, T> = {
	/**
	 * Section this action belongs to. Actions run *before* layout loads in
	 * SvelteKit, so the page guard does not cover POSTs — this does.
	 */
	section: AdminSection;
	schema: S;
	/** The work itself. Anything thrown is handled below. */
	perform: (data: z.infer<S>, actor: PublicUserVm) => Promise<T>;
	/**
	 * What to write to the audit log. Return null to skip — read-only actions
	 * do not need an entry.
	 */
	audit?: (data: z.infer<S>, result: T) => AuditEntry | null;
	/** Extra fields to return to the page on success. */
	respond?: (result: T) => Record<string, unknown>;
	/** Log tag, e.g. 'AdminEvents'. */
	module: string;
};

/**
 * Runs one admin form action end to end.
 *
 * Validation failures come back as `{ errors, error }` so a form can show a
 * message per field and a summary at the top. A `PolicyError` carries text
 * written for the operator and is safe to show; anything else is logged and
 * replaced with a generic message, because driver errors name the database
 * host and role.
 */
export async function handleAction<S extends z.ZodTypeAny, T>(
	event: RequestEvent,
	config: ActionConfig<S, T>
) {
	const actor = requireSection(event.locals.user, config.section);

	const form = await event.request.formData();
	const parsed = parseForm(form, config.schema);

	if (!parsed.success) {
		return fail(400, {
			error: summarizeErrors(parsed.errors),
			errors: parsed.errors
		});
	}

	try {
		const result = await config.perform(parsed.data, actor);

		const entry = config.audit?.(parsed.data, result);
		if (entry) {
			await services.auditLogs.logAction(
				entry.action,
				entry.entityType,
				entry.entityId === null || entry.entityId === undefined
					? undefined
					: String(entry.entityId),
				entry.details,
				actor.id,
				actor.fullName
			);
		}

		return { success: true, ...(config.respond?.(result) ?? {}) };
	} catch (err) {
		if (err instanceof PolicyError) {
			return fail(409, { error: err.message });
		}

		// Re-throw SvelteKit's own redirect/error objects.
		if (err && typeof err === 'object' && ('status' in err || 'location' in err)) {
			throw err;
		}

		logger.error(config.module, 'action failed', {
			userId: actor.id,
			message: err instanceof Error ? err.message : String(err)
		});

		return fail(500, { error: 'Something went wrong. Please try again.' });
	}
}
