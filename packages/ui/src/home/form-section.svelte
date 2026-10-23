<script lang="ts">
	import { page } from '$app/state';
	import type { HomeFormVm } from '@trailblazers/core';
	import { container, sectionY } from '../tb-layout.js';
	import Icon from '../components/Icon.svelte';

	/**
	 * A form whose questions staff wrote themselves, droppable on any CMS page.
	 *
	 * Works with no JavaScript: it is a plain POST to `/forms/<sectionId>`,
	 * which files the answers and redirects back here with `?sent=` or
	 * `?formError=`. That is why the endpoint is generic rather than a form
	 * action on each page route — a block that can be added to any page,
	 * including pages that do not exist yet, cannot depend on per-route wiring.
	 *
	 * The cost of having no JavaScript is that answers are not preserved when
	 * something is wrong; `?fields=` at least says *which* questions to look at,
	 * and those names are only ever matched against this form's own fields, so
	 * a hand-edited URL cannot make it mark anything else.
	 */
	let { data }: { data: HomeFormVm } = $props();

	const sent = $derived(page.url.searchParams.get('sent') === String(data.sectionId));
	const failed = $derived(page.url.searchParams.get('formError') === String(data.sectionId));

	const flaggedFields = $derived.by(() => {
		if (!failed) return new Set<string>();
		const named = (page.url.searchParams.get('fields') ?? '').split(',');
		return new Set(data.fields.filter((f) => named.includes(f.name)).map((f) => f.name));
	});

	/**
	 * Why the last attempt failed. A short fixed list rather than a message
	 * passed through the URL, so nothing a visitor can edit is ever rendered as
	 * our own words.
	 */
	const REASONS: Record<string, string> = {
		invalid: 'Some answers need another look.',
		stale: 'This page had been open a while. Please send it again.',
		throttled: 'That is a lot of submissions in a short time. Please try again shortly.',
		failed: 'We could not send that just now. Please try again shortly.'
	};
	const reason = $derived(REASONS[page.url.searchParams.get('reason') ?? ''] ?? REASONS.failed);

	/** The form token, minted per request by the root layout's load. */
	const formToken = $derived(
		typeof page.data.cmsFormToken === 'string' ? page.data.cmsFormToken : ''
	);
</script>

<section class="{sectionY} bg-brand-light" id="form-{data.sectionId}">
	<div class="{container} max-w-2xl">
		<div class="flex items-center gap-3">
			{#if data.icon}
				<span class="text-brand-primary"><Icon name={data.icon} size={28} /></span>
			{/if}
			<h2 class="font-sans text-2xl font-black tracking-tight text-brand-dark lg:text-3xl">
				{data.title}
			</h2>
		</div>

		{#if data.intro}
			<p class="mt-3 text-base text-brand-dark/70">{data.intro}</p>
		{/if}

		{#if sent}
			<p
				class="mt-6 rounded-2xl border border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-5 text-sm font-semibold text-[var(--color-success-fg)]"
				role="status"
			>
				{data.successMessage}
			</p>
		{:else}
			{#if failed}
				<p
					class="mt-6 rounded-2xl border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-4 text-sm font-semibold text-[var(--color-danger-fg)]"
					role="alert"
				>
					{reason}
				</p>
			{/if}

			<form method="POST" action="/forms/{data.sectionId}" class="mt-6 space-y-5">
				<!--
					Decoy field: hidden from people and assistive tech, but filled in by
					form-spamming bots. The server drops any submission that carries it.
				-->
				<div class="hidden" aria-hidden="true">
					<label for="form-{data.sectionId}-website">Leave this field empty</label>
					<input
						id="form-{data.sectionId}-website"
						type="text"
						name="website"
						tabindex="-1"
						autocomplete="off"
					/>
				</div>
				<!-- Proves this came from a page we served — see `lib/server/form-guard.ts`. -->
				<input type="hidden" name="_ft" value={formToken} />

				{#each data.fields as field (field.name)}
					{@const invalid = flaggedFields.has(field.name)}
					<div>
						<label
							class="text-xs font-bold uppercase tracking-wide text-brand-dark/60"
							for="form-{data.sectionId}-{field.name}"
						>
							{field.label}{#if field.required}<span aria-hidden="true"> *</span>{/if}
						</label>

						{#if field.kind === 'long'}
							<textarea
								id="form-{data.sectionId}-{field.name}"
								name={field.name}
								rows="4"
								required={field.required}
								aria-invalid={invalid ? 'true' : undefined}
								class="tb-field {invalid ? 'tb-field-invalid' : ''}"
							></textarea>
						{:else if field.kind === 'choice'}
							<select
								id="form-{data.sectionId}-{field.name}"
								name={field.name}
								required={field.required}
								aria-invalid={invalid ? 'true' : undefined}
								class="tb-field {invalid ? 'tb-field-invalid' : ''}"
							>
								<option value="">Choose one…</option>
								{#each field.options as option (option)}
									<option value={option}>{option}</option>
								{/each}
							</select>
						{:else}
							<input
								id="form-{data.sectionId}-{field.name}"
								name={field.name}
								type={field.kind === 'email' ? 'email' : field.kind === 'phone' ? 'tel' : 'text'}
								autocomplete={field.kind === 'email'
									? 'email'
									: field.kind === 'phone'
										? 'tel'
										: undefined}
								required={field.required}
								aria-invalid={invalid ? 'true' : undefined}
								class="tb-field {invalid ? 'tb-field-invalid' : ''}"
							/>
						{/if}

						{#if invalid}
							<p class="mt-1 text-xs font-semibold text-[var(--color-danger-fg)]">
								Please check this answer.
							</p>
						{/if}
					</div>
				{/each}

				<button
					type="submit"
					class="min-h-12 rounded-full bg-brand-primary px-8 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-lg transition hover:brightness-105"
				>
					{data.submitLabel}
				</button>
			</form>
		{/if}
	</div>
</section>

<style>
	.tb-field {
		margin-top: 0.35rem;
		display: block;
		width: 100%;
		min-height: 3rem;
		border-radius: 0.75rem;
		border: 1px solid var(--color-border);
		background-color: var(--color-bg-surface);
		padding: 0.6rem 0.9rem;
		font-size: 0.925rem;
		color: var(--zinc-900);
	}
	.tb-field:focus {
		border-color: var(--brand-primary);
		outline: 2px solid rgb(var(--brand-primary-rgb) / 0.25);
		outline-offset: 1px;
	}
	.tb-field-invalid {
		border-color: var(--color-danger-border);
	}
</style>
