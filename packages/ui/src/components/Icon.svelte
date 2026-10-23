<script lang="ts">
	import { ICONS } from '../icons.js';

	/**
	 * Draws one icon from the shared set by name.
	 *
	 * The viewBox, stroke weight and `currentColor` live here rather than in
	 * every call site, so an icon inherits the colour of whatever it sits in and
	 * a path in `icons.ts` only ever describes shape. An unknown name falls back
	 * to `help` rather than rendering an empty box, so a typo is visible as a
	 * question mark instead of silently leaving a gap.
	 */
	let {
		name,
		size = 20,
		class: className = ''
	}: { name: string; size?: number; class?: string } = $props();

	const icon = $derived(ICONS[name] ?? ICONS.help);
</script>

<svg
	class={className}
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.75"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#each icon.paths as d (d)}
		<path {d} />
	{/each}
</svg>
