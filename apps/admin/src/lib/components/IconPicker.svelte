<script lang="ts">
	import Icon from '@trailblazers/ui/components/Icon.svelte';
	import { ICON_NAMES, searchIcons } from '@trailblazers/ui/icons';

	/**
	 * Picks one icon from the shared set, searchable by what staff would call it
	 * ("phone" finds `call`). Used by any block field of kind `icon`.
	 *
	 * Opens as a popover rather than a modal because it is edited alongside the
	 * rest of a section's fields — a second full-screen layer over the section
	 * editor would bury the form it belongs to.
	 */
	let {
		value = '',
		onselect
	}: { value?: string; onselect: (name: string) => void } = $props();

	let open = $state(false);
	let query = $state('');

	const matches = $derived(searchIcons(query, ICON_NAMES));

	function choose(name: string) {
		onselect(name);
		open = false;
		query = '';
	}
</script>

<div class="relative">
	<div class="flex items-center gap-2">
		<button
			type="button"
			onclick={() => (open = !open)}
			class="admin-btn-secondary flex items-center gap-2 px-3 py-2 text-xs"
			aria-expanded={open}
		>
			{#if value}
				<Icon name={value} size={18} />
				<span>{value}</span>
			{:else}
				<Icon name="search" size={18} />
				<span>Choose an icon</span>
			{/if}
		</button>
		{#if value}
			<button
				type="button"
				onclick={() => choose('')}
				class="text-xs font-semibold text-[var(--zinc-500)] hover:underline"
			>
				Clear
			</button>
		{/if}
	</div>

	{#if open}
		<div
			class="absolute left-0 z-20 mt-2 w-80 rounded-lg border border-[var(--color-border)] bg-white p-3 shadow-xl"
		>
			<div class="flex items-center gap-2">
				<!-- svelte-ignore a11y_autofocus -->
				<input
					type="text"
					bind:value={query}
					placeholder="Search icons — try “phone” or “giving”"
					class="admin-input text-sm"
					autofocus
				/>
				<button
					type="button"
					onclick={() => (open = false)}
					class="shrink-0 text-xs font-semibold text-[var(--zinc-500)] hover:underline"
				>
					Close
				</button>
			</div>

			<div class="mt-3 grid max-h-56 grid-cols-6 gap-1 overflow-y-auto">
				{#each matches as name (name)}
					<button
						type="button"
						onclick={() => choose(name)}
						title={name}
						aria-label={name}
						class="flex h-10 items-center justify-center rounded-md border text-[var(--zinc-600)] hover:bg-[var(--zinc-100)] {value ===
						name
							? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
							: 'border-transparent'}"
					>
						<Icon {name} size={20} />
					</button>
				{/each}
			</div>

			{#if matches.length === 0}
				<p class="mt-3 text-xs text-[var(--zinc-500)]">No icon matches “{query}”.</p>
			{/if}
		</div>
	{/if}
</div>
