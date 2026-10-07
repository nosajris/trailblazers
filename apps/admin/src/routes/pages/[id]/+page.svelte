<script lang="ts">
	import { resolve } from '$app/paths';
	// Browser-safe subpath — see the note in the settings page.
	import {
		PAGE_SECTION_TYPES,
		SECTION_TYPE_INFO,
		type PageSectionType
	} from '@trailblazers/core/modules/pages/section-types';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type SectionRow = PageData['sections'][number];

	const fieldErrors = $derived((form as { errors?: Record<string, string> } | null)?.errors ?? {});

	/** The section being edited, or a new one. `null` closes the editor. */
	let editing = $state<{
		id?: number;
		sectionType: PageSectionType;
		status: string;
		title: string;
		subtitle: string;
		intro: string;
		imageUrl: string;
		videoUrl: string;
		primaryCtaLabel: string;
		primaryCtaHref: string;
		secondaryCtaLabel: string;
		secondaryCtaHref: string;
		limit: string;
	} | null>(null);

	const fieldsFor = (type: PageSectionType) => SECTION_TYPE_INFO[type].fields;

	function str(config: Record<string, unknown>, key: string): string {
		const value = config[key];
		return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
	}

	function cta(config: Record<string, unknown>, key: string, part: 'label' | 'href'): string {
		const value = config[key];
		if (!value || typeof value !== 'object') return '';
		const pair = value as { label?: unknown; href?: unknown };
		const picked = part === 'label' ? pair.label : pair.href;
		return typeof picked === 'string' ? picked : '';
	}

	function openNew() {
		editing = {
			sectionType: 'HERO',
			status: 'PUBLISHED',
			title: '',
			subtitle: '',
			intro: '',
			imageUrl: '',
			videoUrl: '',
			primaryCtaLabel: '',
			primaryCtaHref: '',
			secondaryCtaLabel: '',
			secondaryCtaHref: '',
			limit: ''
		};
	}

	function openEdit(section: SectionRow) {
		const config = (section.config ?? {}) as Record<string, unknown>;
		editing = {
			id: section.id,
			sectionType: section.sectionType as PageSectionType,
			status: section.status,
			title: str(config, 'title'),
			subtitle: str(config, 'subtitle'),
			intro: str(config, 'intro'),
			imageUrl: str(config, 'imageUrl'),
			videoUrl: str(config, 'videoUrl'),
			primaryCtaLabel: cta(config, 'primaryCta', 'label'),
			primaryCtaHref: cta(config, 'primaryCta', 'href'),
			secondaryCtaLabel: cta(config, 'secondaryCta', 'label'),
			secondaryCtaHref: cta(config, 'secondaryCta', 'href'),
			limit: str(config, 'limit')
		};
	}

	const limitOf = (section: SectionRow) => str((section.config ?? {}) as Record<string, unknown>, 'limit');
	const titleOf = (section: SectionRow) => str((section.config ?? {}) as Record<string, unknown>, 'title');
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<a href={resolve('/pages')} class="text-xs font-semibold text-brand-primary hover:underline">← All pages</a>
			<h1 class="mt-2 text-2xl font-bold text-[var(--zinc-900)]">{data.page.title}</h1>
			<p class="text-sm text-[var(--zinc-500)]">
				Sections render top to bottom at <code>{data.page.slug}</code>. Draft sections stay hidden
				from visitors.
			</p>
		</div>
		<button onclick={openNew} class="admin-btn-primary">+ Add Section</button>
	</div>

	{#if form?.error}
		<div
			class="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-3 text-sm font-semibold text-[var(--color-danger-fg)]"
			role="alert"
		>
			{form.error}
		</div>
	{/if}

	{#if data.sections.length === 0}
		<div class="admin-card bg-white p-10 text-center">
			<p class="font-semibold text-[var(--zinc-900)]">This page has no sections yet.</p>
			<p class="mx-auto mt-2 max-w-md text-sm text-[var(--zinc-500)]">
				Add a hero first, then the sections you want under it. Until a page has sections, the public
				site falls back to its built-in layout.
			</p>
			<button onclick={openNew} class="admin-btn-primary mt-6">+ Add the first section</button>
		</div>
	{:else}
		<ol class="space-y-3">
			{#each data.sections as section, i (section.id)}
				<li class="admin-card flex flex-col gap-4 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
					<div class="min-w-0">
						<div class="flex flex-wrap items-center gap-2">
							<span class="admin-badge admin-badge-neutral">
								{SECTION_TYPE_INFO[section.sectionType as PageSectionType]?.label ?? section.sectionType}
							</span>
							{#if section.status === 'PUBLISHED'}
								<span class="admin-badge admin-badge-success">Published</span>
							{:else}
								<span class="admin-badge admin-badge-warning">Draft</span>
							{/if}
						</div>
						<p class="mt-2 truncate text-sm font-semibold text-[var(--zinc-900)]">
							{titleOf(section) || SECTION_TYPE_INFO[section.sectionType as PageSectionType]?.help}
						</p>
						{#if limitOf(section)}
							<p class="text-xs text-[var(--zinc-500)]">Shows {limitOf(section)}</p>
						{/if}
					</div>

					<div class="flex shrink-0 flex-wrap items-center gap-2">
						<form action="?/moveSection" method="POST" class="inline">
							<input type="hidden" name="id" value={section.id} />
							<input type="hidden" name="direction" value="up" />
							<button
								type="submit"
								class="admin-btn-secondary px-3 py-1.5 text-xs"
								disabled={i === 0}
								aria-label="Move {titleOf(section) || section.sectionType} up">↑</button
							>
						</form>
						<form action="?/moveSection" method="POST" class="inline">
							<input type="hidden" name="id" value={section.id} />
							<input type="hidden" name="direction" value="down" />
							<button
								type="submit"
								class="admin-btn-secondary px-3 py-1.5 text-xs"
								disabled={i === data.sections.length - 1}
								aria-label="Move {titleOf(section) || section.sectionType} down">↓</button
							>
						</form>
						<form action="?/toggleSection" method="POST" class="inline">
							<input type="hidden" name="id" value={section.id} />
							<input
								type="hidden"
								name="status"
								value={section.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'}
							/>
							<button type="submit" class="admin-btn-secondary px-3 py-1.5 text-xs">
								{section.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
							</button>
						</form>
						<button onclick={() => openEdit(section)} class="text-xs font-semibold text-brand-primary hover:underline"
							>Edit</button
						>
						<form action="?/deleteSection" method="POST" class="inline">
							<input type="hidden" name="id" value={section.id} />
							<button type="submit" class="text-xs font-semibold text-[var(--color-danger-fg)] hover:underline"
								>Delete</button
							>
						</form>
					</div>
				</li>
			{/each}
		</ol>
	{/if}
</div>

{#if editing}
	<div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
		<div class="my-8 w-full max-w-2xl bg-white admin-card p-6 shadow-2xl">
			<h2 class="mb-1 text-xl font-bold text-[var(--zinc-900)]">
				{editing.id ? 'Edit section' : 'Add section'}
			</h2>
			<p class="mb-5 text-xs text-[var(--zinc-500)]">{SECTION_TYPE_INFO[editing.sectionType].help}</p>

			<form action="?/saveSection" method="POST" class="space-y-4">
				{#if editing.id}
					<input type="hidden" name="id" value={editing.id} />
				{/if}

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="section-type" class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]">Section type</label>
						<select id="section-type" name="sectionType" bind:value={editing.sectionType} class="admin-input">
							{#each PAGE_SECTION_TYPES as type (type)}
								<option value={type}>{SECTION_TYPE_INFO[type].label}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="section-status" class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]">Status</label>
						<select id="section-status" name="status" bind:value={editing.status} class="admin-input">
							<option value="PUBLISHED">PUBLISHED</option>
							<option value="DRAFT">DRAFT</option>
						</select>
					</div>
				</div>

				{#if fieldsFor(editing.sectionType) === 'none'}
					<p class="rounded-lg border border-[var(--zinc-200)] bg-[var(--zinc-50)] p-3 text-xs text-[var(--zinc-600)]">
						This section has no settings here — its content is edited in its own area of the portal.
					</p>
				{:else}
					<div>
						<label for="section-title" class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]">
							{fieldsFor(editing.sectionType) === 'hero' ? 'Headline' : 'Heading'}
						</label>
						<input id="section-title" type="text" name="title" bind:value={editing.title} class="admin-input" />
						{#if fieldErrors.title}
							<p class="mt-1 text-xs font-semibold text-[var(--color-danger-fg)]">{fieldErrors.title}</p>
						{/if}
					</div>
				{/if}

				{#if fieldsFor(editing.sectionType) === 'hero'}
					<div>
						<label for="section-subtitle" class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]">Short line under the headline</label>
						<textarea id="section-subtitle" name="subtitle" rows="2" bind:value={editing.subtitle} class="admin-input"></textarea>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="section-image" class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]">Background image URL</label>
							<input id="section-image" type="text" name="imageUrl" bind:value={editing.imageUrl} placeholder="https://..." class="admin-input" />
							{#if fieldErrors.imageUrl}
								<p class="mt-1 text-xs font-semibold text-[var(--color-danger-fg)]">{fieldErrors.imageUrl}</p>
							{/if}
						</div>
						<div>
							<label for="section-video" class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]">Background video (YouTube)</label>
							<input id="section-video" type="text" name="videoUrl" bind:value={editing.videoUrl} placeholder="https://youtu.be/..." class="admin-input" />
							{#if fieldErrors.videoUrl}
								<p class="mt-1 text-xs font-semibold text-[var(--color-danger-fg)]">{fieldErrors.videoUrl}</p>
							{/if}
							<p class="mt-1 text-xs text-[var(--zinc-500)]">Phones and metered connections always get the photo.</p>
						</div>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="section-cta1-label" class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]">Main button label</label>
							<input id="section-cta1-label" type="text" name="primaryCtaLabel" bind:value={editing.primaryCtaLabel} class="admin-input" />
						</div>
						<div>
							<label for="section-cta1-href" class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]">Main button link</label>
							<input id="section-cta1-href" type="text" name="primaryCtaHref" bind:value={editing.primaryCtaHref} placeholder="/plan-a-visit" class="admin-input" />
						</div>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="section-cta2-label" class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]">Second button label</label>
							<input id="section-cta2-label" type="text" name="secondaryCtaLabel" bind:value={editing.secondaryCtaLabel} class="admin-input" />
						</div>
						<div>
							<label for="section-cta2-href" class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]">Second button link</label>
							<input id="section-cta2-href" type="text" name="secondaryCtaHref" bind:value={editing.secondaryCtaHref} placeholder="/watch" class="admin-input" />
						</div>
					</div>
					<p class="text-xs text-[var(--zinc-500)]">A button appears only when it has both a label and a link.</p>
				{/if}

				{#if fieldsFor(editing.sectionType) === 'titleAndLimit'}
					<div>
						<label for="section-limit" class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]">How many to show</label>
						<input
							id="section-limit"
							type="number"
							name="limit"
							min="1"
							max="12"
							placeholder="3"
							bind:value={editing.limit}
							class="admin-input"
						/>
						{#if fieldErrors.limit}
							<p class="mt-1 text-xs font-semibold text-[var(--color-danger-fg)]">{fieldErrors.limit}</p>
						{/if}
					</div>
				{/if}

				{#if fieldsFor(editing.sectionType) === 'titleAndIntro'}
					<div>
						<label for="section-intro" class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]">Invitation text</label>
						<textarea id="section-intro" name="intro" rows="3" bind:value={editing.intro} class="admin-input"></textarea>
					</div>
				{/if}

				<div class="flex items-center justify-end gap-3 border-t border-[var(--zinc-200)] pt-4">
					<button type="button" onclick={() => (editing = null)} class="admin-btn-secondary">Cancel</button>
					<button type="submit" class="admin-btn-primary">Save section</button>
				</div>
			</form>
		</div>
	</div>
{/if}
