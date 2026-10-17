<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance, deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import SectionPreview from '@trailblazers/ui/home/section-preview.svelte';
	import MediaPicker from '$lib/components/MediaPicker.svelte';
	// Browser-safe subpath — see the note in the settings page.
	import {
		PAGE_SECTION_TYPES,
		SECTION_TYPE_INFO,
		type PageSectionType,
		type SectionGlyph
	} from '@trailblazers/core/modules/pages/section-types';
	import type { HomeSectionBlock } from '@trailblazers/core/modules/pages/view-models';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	/**
	 * One 16×16 stroke path per section glyph (see section-types.ts). Plain
	 * inline SVG, not an icon package — this editor is the only place that
	 * needs them, and the whole set is a handful of lines.
	 */
	const GLYPH_PATHS: Record<SectionGlyph, string> = {
		hero: 'M3 5h18M3 12h12M3 19h18',
		calendar: 'M4 5h16v16H4zM4 9h16M8 3v4M16 3v4M8 14h2M14 14h2',
		book: 'M4 4h8a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H4zM20 4h-8a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h9z',
		quote: 'M7 7a4 4 0 0 0-4 4v2a2 2 0 0 0 2 2h2v4H5v2h4v-8H5a2 2 0 0 1 2-4zM17 7a4 4 0 0 0-4 4v2a2 2 0 0 0 2 2h2v4h-2v2h4v-8h-2a2 2 0 0 1 2-4z',
		users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M17 11a3 3 0 1 0 0-6M21 20a6 6 0 0 0-5.5-6',
		badge: 'M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H5v-4l-3-3 3-3V5h4z M9.5 12l1.8 1.8L15 10',
		heart: 'M12 20s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z',
		baby: 'M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM5 21a7 7 0 0 1 14 0M9 13.5c.6.6 1.4 1 3 1s2.4-.4 3-1',
		help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 1 1 4 2c-.6.5-1.5 1-1.5 2.5M12 17h.01',
		mail: 'M4 5h16v14H4zM4 6l8 7 8-7'
	};

	type SectionRow = PageData['sections'][number];


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

	/**
	 * Autosave + undo/redo for the section editor, borrowed from Strata's
	 * block editor: every settled pause in typing both saves the section and
	 * records a history checkpoint, so leaving the modal open never loses
	 * work and stepping back is always one click away.
	 *
	 * `history`/`historyIndex` hold JSON snapshots of `editing`'s fields.
	 * `skipNextChange` suppresses the effect's own reaction to a change *it*
	 * just made (opening the editor, or an undo/redo restoring a snapshot) so
	 * those don't themselves get queued as a new edit.
	 */
	let saveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let saveError = $state('');
	let saveFieldErrors = $state<Record<string, string>>({});
	let history = $state<string[]>([]);
	let historyIndex = $state(-1);
	let autosaveTimer: ReturnType<typeof setTimeout> | undefined;
	let skipNextChange = false;

	function buildSectionFormData(): FormData {
		const body = new FormData();
		if (!editing) return body;
		if (editing.id) body.set('id', String(editing.id));
		body.set('sectionType', editing.sectionType);
		body.set('status', editing.status);
		body.set('title', editing.title);
		body.set('subtitle', editing.subtitle);
		body.set('intro', editing.intro);
		body.set('imageUrl', editing.imageUrl);
		body.set('videoUrl', editing.videoUrl);
		body.set('primaryCtaLabel', editing.primaryCtaLabel);
		body.set('primaryCtaHref', editing.primaryCtaHref);
		body.set('secondaryCtaLabel', editing.secondaryCtaLabel);
		body.set('secondaryCtaHref', editing.secondaryCtaHref);
		body.set('limit', editing.limit);
		return body;
	}

	function applySaveResult(result: {
		type: string;
		data?: { savedId?: number; error?: string; errors?: Record<string, string> };
	}) {
		if (result.type === 'success') {
			if (editing && result.data?.savedId && !editing.id) {
				skipNextChange = true;
				editing.id = result.data.savedId;
			}
			saveStatus = 'saved';
			saveError = '';
			saveFieldErrors = {};
			void invalidateAll();
		} else {
			saveStatus = 'error';
			saveError = result.data?.error ?? 'That save failed.';
			saveFieldErrors = result.data?.errors ?? {};
		}
	}

	async function triggerSave() {
		if (!editing) return;
		saveStatus = 'saving';
		try {
			const body = buildSectionFormData();
			const response = await fetch('?/saveSection', { method: 'POST', body });
			const result = deserialize<
				{ savedId?: number },
				{ error?: string; errors?: Record<string, string> }
			>(await response.text());
			applySaveResult(result);
		} catch {
			saveStatus = 'error';
			saveError = 'That save failed.';
		}
	}

	/** Records a checkpoint (if the content actually changed) and saves it. */
	function commitSnapshot(snapshot: string) {
		if (history[historyIndex] !== snapshot) {
			history = [...history.slice(0, historyIndex + 1), snapshot];
			historyIndex = history.length - 1;
		}
		void triggerSave();
	}

	/** Seeds a fresh history/save state when the editor opens on a section. */
	function resetAutosave() {
		if (autosaveTimer) clearTimeout(autosaveTimer);
		autosaveTimer = undefined;
		saveStatus = 'idle';
		saveError = '';
		saveFieldErrors = {};
		history = editing ? [JSON.stringify(editing)] : [];
		historyIndex = 0;
		skipNextChange = true;
	}

	/** Flushes any pending debounced change immediately — used by Close/Undo/Redo. */
	function flushPendingSave() {
		if (!autosaveTimer) return;
		clearTimeout(autosaveTimer);
		autosaveTimer = undefined;
		if (editing) commitSnapshot(JSON.stringify(editing));
	}

	function closeEditor() {
		flushPendingSave();
		editing = null;
	}

	function undo() {
		if (!editing || historyIndex <= 0) return;
		flushPendingSave();
		historyIndex -= 1;
		skipNextChange = true;
		editing = { ...editing, ...JSON.parse(history[historyIndex]) };
		void triggerSave();
	}

	function redo() {
		if (!editing || historyIndex >= history.length - 1) return;
		flushPendingSave();
		historyIndex += 1;
		skipNextChange = true;
		editing = { ...editing, ...JSON.parse(history[historyIndex]) };
		void triggerSave();
	}

	/** Debounces every change to the open section into one save + checkpoint ~1.2s after typing settles. */
	$effect(() => {
		if (!editing) return;
		const snapshot = JSON.stringify(editing);
		if (skipNextChange) {
			skipNextChange = false;
			return;
		}
		if (autosaveTimer) clearTimeout(autosaveTimer);
		autosaveTimer = setTimeout(() => commitSnapshot(snapshot), 1200);
	});

	/**
	 * Drag-to-reorder for the section list, inspired by Strata's block
	 * editor. `order` holds section ids in their current (possibly
	 * mid-drag) top-to-bottom order; it resyncs whenever the server's list
	 * changes shape (a section added, deleted, or published elsewhere).
	 * Dropping submits the hidden reorder form; the up/down buttons stay as
	 * a keyboard- and screen-reader-friendly fallback.
	 */
	let order = $state(data.sections.map((s) => s.id));
	$effect(() => {
		const ids = data.sections.map((s) => s.id);
		const same = ids.length === order.length && ids.every((id) => order.includes(id));
		if (!same) order = ids;
	});
	let draggingId = $state<number | null>(null);
	let reorderForm = $state<HTMLFormElement | undefined>(undefined);

	const sectionFor = (id: number) => data.sections.find((s) => s.id === id)!;

	function onDragStart(id: number) {
		draggingId = id;
	}

	function onDragOver(event: DragEvent, overId: number) {
		event.preventDefault();
		if (draggingId === null || draggingId === overId) return;
		const from = order.indexOf(draggingId);
		const to = order.indexOf(overId);
		if (from === -1 || to === -1) return;
		const next = order.slice();
		next.splice(from, 1);
		next.splice(to, 0, draggingId);
		order = next;
	}

	function onDrop() {
		if (draggingId !== null) reorderForm?.requestSubmit();
		draggingId = null;
	}

	const fieldsFor = (type: PageSectionType) => SECTION_TYPE_INFO[type].fields;

	/**
	 * Live preview, synced both ways with the section list: hovering a row
	 * highlights its block below and vice versa, and whichever section is
	 * open in the editor is highlighted too. Borrowed from Strata's editor,
	 * which keeps a live miniature of every section with the same hover/click
	 * sync between the form and the preview.
	 */
	let hoveredRowId = $state<number | null>(null);
	const activeSectionId = $derived(editing?.id ?? hoveredRowId);

	/**
	 * Patches the one block being edited with whatever is in the form right
	 * now, so typing a headline updates the preview before "Save section" is
	 * even clicked. Only for fields that need no extra data (text and links);
	 * a changed `limit` still needs a fresh events/posts query, so that one
	 * only updates once saved.
	 */
	const previewBlocks: HomeSectionBlock[] = $derived.by(() => {
		const blocks = data.previewBlocks;
		const cur = editing;
		if (!cur?.id) return blocks;

		return blocks.map((block): HomeSectionBlock => {
			if (block.sectionId !== cur.id || block.kind !== cur.sectionType) return block;

			if (block.kind === 'HERO') {
				return {
					...block,
					data: {
						...block.data,
						title: cur.title || 'Welcome',
						subtitle: cur.subtitle || undefined,
						imageUrl: cur.imageUrl || undefined,
						videoUrl: cur.videoUrl || undefined,
						primaryCta:
							cur.primaryCtaLabel && cur.primaryCtaHref
								? { label: cur.primaryCtaLabel, href: cur.primaryCtaHref }
								: undefined,
						secondaryCta:
							cur.secondaryCtaLabel && cur.secondaryCtaHref
								? { label: cur.secondaryCtaLabel, href: cur.secondaryCtaHref }
								: undefined
					}
				};
			}

			if (block.kind === 'CONTACT') {
				return {
					...block,
					data: { ...block.data, title: cur.title || undefined, intro: cur.intro || undefined }
				};
			}

			if (block.kind === 'BLOG') {
				return { ...block, data: { ...block.data, title: cur.title || undefined } };
			}
			if (block.kind === 'TESTIMONIALS') {
				return { ...block, data: { ...block.data, title: cur.title || undefined } };
			}
			if (block.kind === 'GROUPS') {
				return { ...block, data: { ...block.data, title: cur.title || undefined } };
			}
			if (block.kind === 'LEADERS') {
				return { ...block, data: { ...block.data, title: cur.title || undefined } };
			}
			if (block.kind === 'FAQ') {
				return { ...block, data: { ...block.data, title: cur.title || undefined } };
			}

			return block;
		});
	});

	function onPreviewClick(sectionId: number | null) {
		if (sectionId === null) return;
		const section = data.sections.find((s) => s.id === sectionId);
		if (section) openEdit(section);
	}

	/** Uploading for the hero background image field — see the `uploadImage` action. */
	let uploading = $state(false);
	let uploadError = $state('');

	async function handleImageUpload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file || !editing) return;

		uploading = true;
		uploadError = '';
		try {
			const body = new FormData();
			body.set('file', file);
			const response = await fetch('?/uploadImage', { method: 'POST', body });
			const result = deserialize<{ uploadedUrl?: string }, { error?: string }>(await response.text());

			if (result.type === 'success' && result.data?.uploadedUrl) {
				editing.imageUrl = result.data.uploadedUrl;
			} else if (result.type === 'failure') {
				uploadError = result.data?.error ?? 'That upload failed.';
			} else {
				uploadError = 'That upload failed.';
			}
		} catch {
			uploadError = 'That upload failed.';
		} finally {
			uploading = false;
			input.value = '';
		}
	}

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
		resetAutosave();
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
		resetAutosave();
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
				from visitors. Drag a section by its handle to reorder it, or use the arrows.
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

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
	<div>
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
			{#each order as id, i (id)}
				{@const section = sectionFor(id)}
				<li
					class="admin-card flex flex-col gap-4 bg-white p-5 transition-all sm:flex-row sm:items-center sm:justify-between {draggingId ===
					section.id
						? 'opacity-40'
						: ''} {activeSectionId === section.id ? 'admin-section-row-active' : ''}"
					draggable="true"
					ondragstart={() => onDragStart(section.id)}
					ondragover={(e) => onDragOver(e, section.id)}
					ondrop={onDrop}
					ondragend={() => (draggingId = null)}
					onmouseenter={() => (hoveredRowId = section.id)}
					onmouseleave={() => (hoveredRowId = null)}
				>
					<div class="flex min-w-0 items-start gap-3">
						<span
							class="mt-0.5 shrink-0 cursor-grab select-none text-[var(--zinc-400)]"
							aria-hidden="true"
							title="Drag to reorder"
						>
							⠿
						</span>
						<svg
							class="mt-0.5 h-5 w-5 shrink-0 text-[var(--zinc-400)]"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.75"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d={GLYPH_PATHS[SECTION_TYPE_INFO[section.sectionType as PageSectionType]?.glyph ?? 'help']} />
						</svg>
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

		<form
			bind:this={reorderForm}
			action="?/reorderSections"
			method="POST"
			use:enhance
			class="hidden"
		>
			<input type="hidden" name="order" value={order.join(',')} />
		</form>
	{/if}
	</div>

	<div class="lg:sticky lg:top-6 lg:self-start">
		<div class="admin-card max-h-[75vh] overflow-y-auto bg-white">
			<p
				class="sticky top-0 border-b border-[var(--zinc-200)] bg-white/95 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--zinc-500)] backdrop-blur"
			>
				Live preview
			</p>
			<SectionPreview
				blocks={previewBlocks}
				{activeSectionId}
				onhoversection={(id) => (hoveredRowId = id)}
				onclicksection={onPreviewClick}
			/>
		</div>
	</div>
	</div>
</div>

{#if editing}
	<div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
		<div class="my-8 w-full max-w-2xl bg-white admin-card p-6 shadow-2xl">
			<div class="mb-1 flex items-start justify-between gap-3">
				<h2 class="text-xl font-bold text-[var(--zinc-900)]">
					{editing.id ? 'Edit section' : 'Add section'}
				</h2>
				<div class="flex shrink-0 items-center gap-1">
					<button
						type="button"
						onclick={undo}
						disabled={historyIndex <= 0}
						title="Undo"
						class="admin-btn-secondary px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
					>
						Undo
					</button>
					<button
						type="button"
						onclick={redo}
						disabled={historyIndex >= history.length - 1}
						title="Redo"
						class="admin-btn-secondary px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
					>
						Redo
					</button>
				</div>
			</div>
			<p class="mb-1 text-xs text-[var(--zinc-500)]">{SECTION_TYPE_INFO[editing.sectionType].help}</p>
			<p class="mb-5 text-xs font-medium">
				{#if saveStatus === 'saving'}
					<span class="text-[var(--zinc-500)]">Saving…</span>
				{:else if saveStatus === 'saved'}
					<span class="text-[var(--color-success-fg)]">All changes saved</span>
				{:else if saveStatus === 'error'}
					<span class="text-[var(--color-danger-fg)]">{saveError || 'Save failed'}</span>
				{:else}
					<span class="text-[var(--zinc-500)]">&nbsp;</span>
				{/if}
			</p>

			<form class="space-y-4">

				<div>
					<p id="section-type-label" class="mb-2 block text-xs font-semibold uppercase text-[var(--zinc-700)]">Section type</p>
					<div
						role="radiogroup"
						aria-labelledby="section-type-label"
						class="grid grid-cols-3 gap-2 sm:grid-cols-4"
					>
						{#each PAGE_SECTION_TYPES as type (type)}
							<button
								type="button"
								role="radio"
								aria-checked={editing.sectionType === type}
								onclick={() => {
									if (editing) editing.sectionType = type;
								}}
								class="admin-type-pick {editing.sectionType === type ? 'admin-type-pick-active' : ''}"
							>
								<svg
									class="h-5 w-5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.75"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
								>
									<path d={GLYPH_PATHS[SECTION_TYPE_INFO[type].glyph]} />
								</svg>
								{SECTION_TYPE_INFO[type].label}
							</button>
						{/each}
					</div>
				</div>

				<div>
					<label for="section-status" class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]">Status</label>
					<select id="section-status" name="status" bind:value={editing.status} class="admin-input max-w-xs">
						<option value="PUBLISHED">PUBLISHED</option>
						<option value="DRAFT">DRAFT</option>
					</select>
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
						{#if saveFieldErrors.title}
							<p class="mt-1 text-xs font-semibold text-[var(--color-danger-fg)]">{saveFieldErrors.title}</p>
						{:else if SECTION_TYPE_INFO[editing.sectionType].defaultTitle}
							<p class="mt-1 text-xs text-[var(--zinc-500)]">
								Leave blank to use the default heading, "{SECTION_TYPE_INFO[editing.sectionType].defaultTitle}".
							</p>
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
							<label for="section-image" class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]">Background image</label>
							<div class="flex items-center gap-2">
								<input id="section-image" type="text" name="imageUrl" bind:value={editing.imageUrl} placeholder="https://..." class="admin-input" />
								<label class="admin-btn-secondary shrink-0 cursor-pointer px-3 py-2 text-xs">
									{uploading ? 'Uploading…' : 'Upload'}
									<input
										type="file"
										accept="image/jpeg,image/png,image/webp"
										class="hidden"
										disabled={uploading}
										onchange={handleImageUpload}
									/>
								</label>
								<MediaPicker onselect={(url) => {
									if (editing) editing.imageUrl = url;
								}} />
							</div>
							<p class="mt-1 text-xs text-[var(--zinc-500)]">
								Upload a photo and it's resized and compressed automatically — or paste a URL instead.
							</p>
							{#if uploadError}
								<p class="mt-1 text-xs font-semibold text-[var(--color-danger-fg)]">{uploadError}</p>
							{/if}
							{#if saveFieldErrors.imageUrl}
								<p class="mt-1 text-xs font-semibold text-[var(--color-danger-fg)]">{saveFieldErrors.imageUrl}</p>
							{/if}
						</div>
						<div>
							<label for="section-video" class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]">Background video (YouTube)</label>
							<input id="section-video" type="text" name="videoUrl" bind:value={editing.videoUrl} placeholder="https://youtu.be/..." class="admin-input" />
							{#if saveFieldErrors.videoUrl}
								<p class="mt-1 text-xs font-semibold text-[var(--color-danger-fg)]">{saveFieldErrors.videoUrl}</p>
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
						{#if saveFieldErrors.limit}
							<p class="mt-1 text-xs font-semibold text-[var(--color-danger-fg)]">{saveFieldErrors.limit}</p>
						{:else}
							<p class="mt-1 text-xs text-[var(--zinc-500)]">
								Counts only published, upcoming events — a past or draft event never fills a slot.
							</p>
						{/if}
					</div>
				{/if}

				{#if fieldsFor(editing.sectionType) === 'titleAndIntro'}
					<div>
						<label for="section-intro" class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]">Invitation text</label>
						<textarea id="section-intro" name="intro" rows="3" bind:value={editing.intro} class="admin-input"></textarea>
					</div>
				{/if}

				<div class="flex items-center justify-between gap-3 border-t border-[var(--zinc-200)] pt-4">
					<p class="text-xs text-[var(--zinc-500)]">Changes save automatically as you type.</p>
					<div class="flex items-center gap-3">
						<button type="button" onclick={flushPendingSave} class="admin-btn-secondary">Save now</button>
						<button type="button" onclick={closeEditor} class="admin-btn-primary">Close</button>
					</div>
				</div>
			</form>
		</div>
	</div>
{/if}
