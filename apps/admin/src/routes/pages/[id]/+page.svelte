<script lang="ts">
	import { tick } from 'svelte';
	import { resolve } from '$app/paths';
	import { enhance, deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import SectionPreview from '@trailblazers/ui/home/section-preview.svelte';
	import Icon from '@trailblazers/ui/components/Icon.svelte';
	import MediaPicker from '$lib/components/MediaPicker.svelte';
	import IconPicker from '$lib/components/IconPicker.svelte';
	// Browser-safe subpath — see the note in the settings page.
	import {
		BLOCKS,
		fieldsFor,
		flattenConfig,
		formFieldNames,
		patchBlockConfig,
		searchBlocks,
		type BlockField,
		type PageSectionType
	} from '@trailblazers/core/modules/pages/block-registry';
	import type { HomeSectionBlock } from '@trailblazers/core/modules/pages/view-models';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type SectionRow = PageData['sections'][number];

	/**
	 * The section being edited, or a new one. `null` closes the editor.
	 *
	 * `values` is the flat, one-string-per-input shape the block registry reads
	 * and writes (`flattenConfig` / `projectConfig`), so this component no longer
	 * names a single field of a single block: which inputs exist, what they are
	 * called and what a blank one means are all the registry's to say. Before, a
	 * new field meant editing this file, the zod schema, the config mapper, the
	 * section strategy and the preview patch — and when those drifted, a hero's
	 * buttons rendered in the preview and were missing from the live page.
	 */
	let editing = $state<{
		id?: number;
		sectionType: PageSectionType;
		status: string;
		values: Record<string, string>;
	} | null>(null);

	/**
	 * Where a section added with a "+" between rows should land. A new section is
	 * always created at the end (one insert, no sort-order arithmetic), then moved
	 * into place by the same reorder action a drag uses.
	 */
	let pendingInsertIndex = $state<number | null>(null);

	/** Filters the type grid in the editor; blank shows every block. */
	let blockQuery = $state('');
	const blockChoices = $derived(searchBlocks(blockQuery));

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
		// Only the fields this block declares are submitted; the server projects
		// them through the same registry, so a value left over from a type the
		// staff member switched away from cannot reach the saved config.
		for (const name of formFieldNames(editing.sectionType)) {
			body.set(name, editing.values[name] ?? '');
		}

		return body;
	}

	function applySaveResult(result: {
		type: string;
		data?: { savedId?: number; error?: string; errors?: Record<string, string> };
	}) {
		if (result.type === 'success') {
			const savedId = result.data?.savedId;
			const wasNew = editing && !editing.id;

			if (editing && savedId && wasNew) {
				skipNextChange = true;
				editing.id = savedId;
			}
			saveStatus = 'saved';
			saveError = '';
			saveFieldErrors = {};
			void invalidateAll();
			if (wasNew && savedId) void placeNewSection(savedId);
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
		pendingInsertIndex = null;
		blockQuery = '';
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

	/**
	 * Moves a just-created section to the position its "+" was clicked at.
	 *
	 * Deliberately a reorder rather than an insert with a computed sort order:
	 * the reorder action already renumbers a whole page in one transaction and
	 * validates the id set, so inserting reuses a tested path instead of adding
	 * midpoint arithmetic that would eventually run out of gap. `tick()` lets
	 * the hidden form's value catch up with `order` before it is submitted.
	 */
	async function placeNewSection(savedId: number) {
		const index = pendingInsertIndex;
		pendingInsertIndex = null;
		if (index === null) return;

		const next = order.filter((id) => id !== savedId);
		next.splice(index, 0, savedId);
		order = next;
		await tick();
		reorderForm?.requestSubmit();
	}

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
	 * Patches the one block being edited with whatever is in the form right now,
	 * so typing a headline updates the preview before anything is saved.
	 *
	 * `patchBlockConfig` is the registry's own read path applied to the form's
	 * values, which is what makes this preview trustworthy: it cannot interpret a
	 * field differently from the published page, because it is the same function.
	 * Fields the registry marks as needing a fresh query (a count) are left
	 * alone until the section is saved, rather than showing three events under a
	 * heading that says six.
	 */
	const previewBlocks: HomeSectionBlock[] = $derived.by(() => {
		const blocks = data.previewBlocks;
		const cur = editing;
		if (!cur?.id) return blocks;

		const patch = patchBlockConfig(cur.sectionType, cur.values);
		if (Object.keys(patch).length === 0) return blocks;

		return blocks.map((block): HomeSectionBlock => {
			if (block.sectionId !== cur.id || block.kind !== cur.sectionType) return block;
			return { ...block, data: { ...(block.data as object), ...patch } } as HomeSectionBlock;
		});
	});

	function onPreviewClick(sectionId: number | null) {
		if (sectionId === null) return;
		const section = data.sections.find((s) => s.id === sectionId);
		if (section) openEdit(section);
	}

	/** Uploading for an image field — see the `uploadImage` action. */
	let uploadingField = $state<string | null>(null);
	let uploadError = $state('');

	async function handleImageUpload(event: Event, fieldName: string) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file || !editing) return;

		uploadingField = fieldName;
		uploadError = '';
		try {
			const body = new FormData();
			body.set('file', file);
			const response = await fetch('?/uploadImage', { method: 'POST', body });
			const result = deserialize<{ uploadedUrl?: string }, { error?: string }>(await response.text());

			if (result.type === 'success' && result.data?.uploadedUrl) {
				editing.values[fieldName] = result.data.uploadedUrl;
			} else if (result.type === 'failure') {
				uploadError = result.data?.error ?? 'That upload failed.';
			} else {
				uploadError = 'That upload failed.';
			}
		} catch {
			uploadError = 'That upload failed.';
		} finally {
			uploadingField = null;
			input.value = '';
		}
	}

	function str(config: Record<string, unknown>, key: string): string {
		const value = config[key];
		return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
	}

	function openNew(insertIndex: number | null = null) {
		pendingInsertIndex = insertIndex;
		editing = {
			sectionType: 'HERO',
			status: 'PUBLISHED',
			values: flattenConfig('HERO', {})
		};
		blockQuery = '';
		resetAutosave();
	}

	function openEdit(section: SectionRow) {
		const type = section.sectionType as PageSectionType;
		pendingInsertIndex = null;
		editing = {
			id: section.id,
			sectionType: type,
			status: section.status,
			// The draft is what staff are working on; `config` is what visitors
			// are still reading until the next publish.
			values: flattenConfig(type, effectiveConfig(section))
		};
		blockQuery = '';
		resetAutosave();
	}

	/**
	 * Switching type keeps any value the new block also has a field for — a
	 * heading typed under the wrong type carries over instead of being retyped —
	 * and gives its own fields an empty string to bind to.
	 */
	function chooseType(type: PageSectionType) {
		if (!editing) return;
		const kept: Record<string, string> = {};
		for (const name of formFieldNames(type)) {
			if (editing.values[name] !== undefined) kept[name] = editing.values[name];
		}
		editing.sectionType = type;
		editing.values = { ...flattenConfig(type, {}), ...kept };
	}

	const labelOf = (section: SectionRow) =>
		BLOCKS[section.sectionType as PageSectionType]?.label ?? section.sectionType;
	const iconOf = (section: SectionRow) =>
		BLOCKS[section.sectionType as PageSectionType]?.icon ?? 'help';
	/** What the section will look like once published: its draft, else what is live. */
	const effectiveConfig = (section: SectionRow) =>
		((section.draftConfig ?? section.config) ?? {}) as Record<string, unknown>;

	const limitOf = (section: SectionRow) => str(effectiveConfig(section), 'limit');
	const titleOf = (section: SectionRow) => str(effectiveConfig(section), 'title');

	/** One short line per section saying what is waiting, or nothing at all. */
	function pendingLabel(section: SectionRow): string | null {
		if (section.pendingDelete) return 'Removing on publish';
		if (section.publishedAt === null) return 'New — not published yet';
		if (section.draftConfig !== null && section.draftSortOrder !== null) return 'Edited and moved';
		if (section.draftConfig !== null) return 'Edited, not published';
		if (section.draftSortOrder !== null) return 'Moved, not published';
		return null;
	}

	const changeSummary = $derived.by(() => {
		const c = data.changes;
		if (c.total === 0) return null;

		const parts: string[] = [];
		if (c.additions) parts.push(`${c.additions} new`);
		if (c.edits) parts.push(`${c.edits} edited`);
		if (c.reorders) parts.push(`${c.reorders} moved`);
		if (c.deletions) parts.push(`${c.deletions} to remove`);
		return parts.join(' · ');
	});

	/** `datetime-local` wants `YYYY-MM-DDTHH:mm` in Harare's time, not UTC. */
	function toHarareInput(value: string | Date | null | undefined): string {
		if (!value) return '';
		const date = typeof value === 'string' ? new Date(value) : value;
		if (Number.isNaN(date.getTime())) return '';
		const harare = new Date(date.getTime() + 2 * 60 * 60 * 1000);
		return harare.toISOString().slice(0, 16);
	}

	let scheduleOpen = $state(false);
	const errorFor = (name: string) => saveFieldErrors[name];
</script>

{#snippet fieldInputs(field: BlockField, values: Record<string, string>)}
	{#if field.kind === 'cta'}
		<div class="grid grid-cols-2 gap-4">
			<div>
				<label
					for="section-field-{field.name}-label"
					class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]"
				>
					{field.label} label
				</label>
				<input
					id="section-field-{field.name}-label"
					type="text"
					maxlength={field.maxLength}
					class="admin-input"
					value={values[`${field.name}Label`] ?? ''}
					oninput={(e) => (values[`${field.name}Label`] = e.currentTarget.value)}
				/>
				{#if errorFor(`${field.name}Label`)}
					<p class="mt-1 text-xs font-semibold text-[var(--color-danger-fg)]">
						{errorFor(`${field.name}Label`)}
					</p>
				{/if}
			</div>
			<div>
				<label
					for="section-field-{field.name}-href"
					class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]"
				>
					{field.label} link
				</label>
				<input
					id="section-field-{field.name}-href"
					type="text"
					placeholder={field.placeholder}
					class="admin-input"
					value={values[`${field.name}Href`] ?? ''}
					oninput={(e) => (values[`${field.name}Href`] = e.currentTarget.value)}
				/>
				{#if errorFor(`${field.name}Href`)}
					<p class="mt-1 text-xs font-semibold text-[var(--color-danger-fg)]">
						{errorFor(`${field.name}Href`)}
					</p>
				{/if}
			</div>
		</div>
		{#if field.help}
			<p class="-mt-2 text-xs text-[var(--zinc-500)]">{field.help}</p>
		{/if}
	{:else}
		<div>
			<label
				for="section-field-{field.name}"
				class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]"
			>
				{field.label}
			</label>

			{#if field.kind === 'longText'}
				<textarea
					id="section-field-{field.name}"
					rows="3"
					maxlength={field.maxLength}
					class="admin-input"
					value={values[field.name] ?? ''}
					oninput={(e) => (values[field.name] = e.currentTarget.value)}
				></textarea>
			{:else if field.kind === 'count'}
				<input
					id="section-field-{field.name}"
					type="number"
					min={field.min}
					max={field.max}
					placeholder={field.fallbackCount ? String(field.fallbackCount) : undefined}
					class="admin-input max-w-xs"
					value={values[field.name] ?? ''}
					oninput={(e) => (values[field.name] = e.currentTarget.value)}
				/>
			{:else if field.kind === 'icon'}
				<IconPicker
					value={values[field.name] ?? ''}
					onselect={(name) => (values[field.name] = name)}
				/>
			{:else if field.kind === 'image'}
				<div class="flex items-center gap-2">
					<input
						id="section-field-{field.name}"
						type="text"
						placeholder={field.placeholder}
						class="admin-input"
						value={values[field.name] ?? ''}
						oninput={(e) => (values[field.name] = e.currentTarget.value)}
					/>
					<label class="admin-btn-secondary shrink-0 cursor-pointer px-3 py-2 text-xs">
						{uploadingField === field.name ? 'Uploading…' : 'Upload'}
						<input
							type="file"
							accept="image/jpeg,image/png,image/webp"
							class="hidden"
							disabled={uploadingField !== null}
							onchange={(e) => handleImageUpload(e, field.name)}
						/>
					</label>
					<MediaPicker onselect={(url) => (values[field.name] = url)} />
				</div>
				{#if uploadError && uploadingField === null}
					<p class="mt-1 text-xs font-semibold text-[var(--color-danger-fg)]">{uploadError}</p>
				{/if}
			{:else}
				<input
					id="section-field-{field.name}"
					type="text"
					maxlength={field.maxLength}
					placeholder={field.placeholder}
					class="admin-input"
					value={values[field.name] ?? ''}
					oninput={(e) => (values[field.name] = e.currentTarget.value)}
				/>
			{/if}

			{#if errorFor(field.name)}
				<p class="mt-1 text-xs font-semibold text-[var(--color-danger-fg)]">{errorFor(field.name)}</p>
			{:else if field.help}
				<p class="mt-1 text-xs text-[var(--zinc-500)]">{field.help}</p>
			{/if}
		</div>
	{/if}
{/snippet}

{#snippet insertHere(index: number, description: string)}
	<div class="group/insert flex items-center justify-center py-1">
		<button
			type="button"
			onclick={() => openNew(index)}
			aria-label="Add a section {description}"
			class="admin-insert-here opacity-40 transition group-hover/insert:opacity-100 focus-visible:opacity-100"
		>
			<span aria-hidden="true">+</span> Add a section {description}
		</button>
	</div>
{/snippet}

<div class="space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<a href={resolve('/pages')} class="text-xs font-semibold text-brand-primary hover:underline">← All pages</a>
			<h1 class="mt-2 text-2xl font-bold text-[var(--zinc-900)]">{data.page.title}</h1>
			<p class="text-sm text-[var(--zinc-500)]">
				Sections render top to bottom at <code>{data.page.slug}</code>. Edits here are saved as a
				draft and go live when you publish, so visitors never read a half-finished page. Drag a
				section by its handle to reorder it, use the arrows, or add one exactly where you want it
				with the "+" between rows.
			</p>
		</div>
		<button onclick={() => openNew()} class="admin-btn-primary">+ Add Section</button>
	</div>

	<!--
		Publishing. Editing a section autosaves, so without this the public page
		changed as staff typed; now every edit waits here until someone says so.
	-->
	<div class="admin-card flex flex-col gap-3 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="min-w-0">
			{#if data.changes.total > 0}
				<p class="text-sm font-semibold text-[var(--zinc-900)]">
					{data.changes.total} change{data.changes.total === 1 ? '' : 's'} waiting to go live
				</p>
				<p class="text-xs text-[var(--zinc-500)]">{changeSummary}</p>
			{:else}
				<p class="text-sm font-semibold text-[var(--zinc-900)]">Everything here is published.</p>
				<p class="text-xs text-[var(--zinc-500)]">
					Visitors are seeing this page exactly as it looks in the preview.
				</p>
			{/if}
			{#if data.page.publishAt}
				<p class="mt-1 text-xs font-semibold text-[var(--color-warning-fg)]">
					Scheduled to publish automatically on {new Date(data.page.publishAt).toLocaleString('en-GB', {
						timeZone: 'Africa/Harare',
						dateStyle: 'medium',
						timeStyle: 'short'
					})}
				</p>
			{/if}
		</div>

		<div class="flex shrink-0 flex-wrap items-center gap-2">
			{#if data.previewLink}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- a signed link into the public site, not an admin route -->
				<a
					href={data.previewLink}
					target="_blank"
					rel="noreferrer"
					class="admin-btn-secondary px-3 py-1.5 text-xs"
				>
					Preview draft ↗
				</a>
			{/if}
			<button
				type="button"
				onclick={() => (scheduleOpen = !scheduleOpen)}
				class="admin-btn-secondary px-3 py-1.5 text-xs"
				aria-expanded={scheduleOpen}
			>
				{data.page.publishAt ? 'Change schedule' : 'Schedule'}
			</button>
			<form action="?/publishPage" method="POST" use:enhance class="inline">
				<button
					type="submit"
					class="admin-btn-primary px-4 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
					disabled={data.changes.total === 0}
				>
					Publish {data.changes.total > 0 ? `(${data.changes.total})` : ''}
				</button>
			</form>
		</div>
	</div>

	{#if scheduleOpen}
		<form
			action="?/schedulePage"
			method="POST"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
					scheduleOpen = false;
				};
			}}
			class="admin-card flex flex-col gap-3 bg-[var(--zinc-50)] p-4 sm:flex-row sm:items-end"
		>
			<div class="min-w-0 flex-1">
				<label
					for="publish-at"
					class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]"
				>
					Publish automatically at (Harare time)
				</label>
				<input
					id="publish-at"
					type="datetime-local"
					name="publishAt"
					value={toHarareInput(data.page.publishAt)}
					class="admin-input max-w-xs"
				/>
				<p class="mt-1 text-xs text-[var(--zinc-500)]">
					Checked once a day, so a time is honoured to the day rather than to the minute. Leave
					blank to publish only by hand.
				</p>
			</div>
			<div class="flex shrink-0 items-center gap-2">
				<button type="submit" class="admin-btn-primary px-4 py-1.5 text-xs">Save schedule</button>
				<button
					type="button"
					onclick={() => (scheduleOpen = false)}
					class="admin-btn-secondary px-3 py-1.5 text-xs"
				>
					Cancel
				</button>
			</div>
		</form>
	{/if}

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
			<button onclick={() => openNew()} class="admin-btn-primary mt-6">+ Add the first section</button>
		</div>
	{:else}
		<ol>
			{#each order as id, i (id)}
				{@const section = sectionFor(id)}
				<li>
					{@render insertHere(i, i === 0 ? 'at the top' : `above ${labelOf(section)}`)}
					<div
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
						role="presentation"
					>
						<div class="flex min-w-0 items-start gap-3">
							<span
								class="mt-0.5 shrink-0 cursor-grab select-none text-[var(--zinc-400)]"
								aria-hidden="true"
								title="Drag to reorder"
							>
								⠿
							</span>
							<span class="mt-0.5 shrink-0 text-[var(--zinc-400)]">
								<Icon name={iconOf(section)} />
							</span>
							<div class="min-w-0">
							<div class="flex flex-wrap items-center gap-2">
								<span class="admin-badge admin-badge-neutral">{labelOf(section)}</span>
								{#if section.status === 'PUBLISHED'}
									<span class="admin-badge admin-badge-success">Published</span>
								{:else}
									<span class="admin-badge admin-badge-warning">Draft</span>
								{/if}
								{#if pendingLabel(section)}
									<span class="admin-badge admin-badge-warning">{pendingLabel(section)}</span>
								{/if}
							</div>
							<p class="mt-2 truncate text-sm font-semibold text-[var(--zinc-900)]">
								{titleOf(section) || BLOCKS[section.sectionType as PageSectionType]?.help}
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
							{#if section.pendingDelete}
								<form action="?/restoreSection" method="POST" class="inline">
									<input type="hidden" name="id" value={section.id} />
									<button type="submit" class="text-xs font-semibold text-brand-primary hover:underline"
										>Keep it</button
									>
								</form>
							{:else}
								<form action="?/deleteSection" method="POST" class="inline">
									<input type="hidden" name="id" value={section.id} />
									<button
										type="submit"
										class="text-xs font-semibold text-[var(--color-danger-fg)] hover:underline"
										title={section.publishedAt === null
											? 'Deletes it now — visitors have never seen it'
											: 'Stays on the public page until you publish'}
									>
										{section.publishedAt === null ? 'Delete' : 'Remove'}
									</button>
								</form>
							{/if}
						</div>
					</div>
				</li>
			{/each}
		</ol>
		{@render insertHere(order.length, 'at the bottom')}

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
			<p class="mb-1 text-xs text-[var(--zinc-500)]">{BLOCKS[editing.sectionType].help}</p>
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
					<div class="mb-2 flex items-center justify-between gap-3">
						<p id="section-type-label" class="block text-xs font-semibold uppercase text-[var(--zinc-700)]">
							Section type
						</p>
						<input
							type="search"
							bind:value={blockQuery}
							placeholder="Search section types"
							aria-label="Search section types"
							class="admin-input max-w-[14rem] py-1 text-xs"
						/>
					</div>
					<div
						role="radiogroup"
						aria-labelledby="section-type-label"
						class="grid grid-cols-3 gap-2 sm:grid-cols-4"
					>
						{#each blockChoices as type (type)}
							<button
								type="button"
								role="radio"
								aria-checked={editing.sectionType === type}
								onclick={() => chooseType(type)}
								title={BLOCKS[type].help}
								class="admin-type-pick {editing.sectionType === type ? 'admin-type-pick-active' : ''}"
							>
								<Icon name={BLOCKS[type].icon} />
								{BLOCKS[type].label}
							</button>
						{/each}
					</div>
					{#if blockChoices.length === 0}
						<p class="mt-2 text-xs text-[var(--zinc-500)]">
							No section type matches “{blockQuery}”.
						</p>
					{/if}
				</div>

				<div>
					<label for="section-status" class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]">Status</label>
					<select id="section-status" name="status" bind:value={editing.status} class="admin-input max-w-xs">
						<option value="PUBLISHED">PUBLISHED</option>
						<option value="DRAFT">DRAFT</option>
					</select>
				</div>

				{#if BLOCKS[editing.sectionType].sourced}
					<p class="rounded-lg border border-[var(--zinc-200)] bg-[var(--zinc-50)] p-3 text-xs text-[var(--zinc-600)]">
						This section has no settings here — its content is edited in its own area of the portal.
					</p>
				{:else}
					{#each fieldsFor(editing.sectionType) as field (field.name)}
						{@render fieldInputs(field, editing.values)}
					{/each}
					{#if BLOCKS[editing.sectionType].defaultTitle}
						<p class="text-xs text-[var(--zinc-500)]">
							Leave the heading blank to use the default, "{BLOCKS[editing.sectionType].defaultTitle}".
						</p>
					{/if}
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

<style>
	/**
	 * The "+" between two rows. Faint until the strip is hovered or the button
	 * is focused, so a page of sections does not read as a page of buttons —
	 * but never fully hidden, because an invisible control is one nobody finds.
	 */
	.admin-insert-here {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.1rem 0.6rem;
		border: 1px dashed var(--color-border);
		border-radius: 999px;
		background-color: var(--zinc-50);
		color: var(--zinc-500);
		font-size: 0.7rem;
		font-weight: 600;
	}
	.admin-insert-here:hover {
		border-color: var(--brand-primary);
		color: var(--brand-primary);
	}
</style>
