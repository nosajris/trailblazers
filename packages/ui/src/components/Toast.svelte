<script lang="ts">
	import { toast } from './toast-store.svelte.js';

	const STYLES = {
		success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
		error: 'border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)]',
		info: 'border-neutral-200 bg-white text-brand-dark'
	} as const;
</script>

<!--
	Fixed, top-right on anything wider than a phone (top-center, full-width on
	a phone where "top-right" would sit under a thumb). `pointer-events-none`
	on the wrapper and `pointer-events-auto` on each toast means the empty
	space around a toast never blocks a click on the page underneath it.
-->
<div
	class="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end"
	role="status"
	aria-live="polite"
>
	{#each toast.items as item (item.id)}
		<div
			class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg {STYLES[
				item.kind
			]}"
		>
			<span class="flex-1">{item.text}</span>
			<button
				type="button"
				onclick={() => toast.dismiss(item.id)}
				class="shrink-0 text-base leading-none opacity-60 transition hover:opacity-100"
				aria-label="Dismiss notification"
			>
				&times;
			</button>
		</div>
	{/each}
</div>
