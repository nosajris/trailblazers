<script lang="ts">
	import type { HomeSectionBlock } from '@trailblazers/core';
	import HeroSection from './hero-section.svelte';
	import EventsRailSection from './events-rail-section.svelte';
	import BlogSection from './blog-section.svelte';
	import TestimonialsSection from './testimonials-section.svelte';
	import GroupsSection from './groups-section.svelte';
	import RichSection from './rich-section.svelte';
	import LeadersSection from './leaders-section.svelte';
	import FaqSection from './faq-section.svelte';
	import ContactSection from './contact-section.svelte';
	import FormSection from './form-section.svelte';

	/**
	 * A staff-only rendering of a page's blocks, for the admin editor's live
	 * preview. It reuses the same section components the public site uses —
	 * Strata's editor shows "a live miniature of every section," and this is
	 * the equivalent for Trailblazers — but it is its own small layout, not
	 * `home-blocks.svelte`: that component's `.tb-stripes` alternating
	 * background relies on every block being a single, direct child, and
	 * injecting a `data-section-id` wrapper for the hover/click sync here
	 * would have broken that on the public page. Never imported by
	 * `apps/web`.
	 */
	let {
		blocks,
		activeSectionId = null,
		onhoversection = () => {},
		onclicksection = () => {}
	}: {
		blocks: HomeSectionBlock[];
		activeSectionId?: number | null;
		onhoversection?: (id: number | null) => void;
		onclicksection?: (id: number | null) => void;
	} = $props();
</script>

<div class="tb-preview-stripes">
	{#each blocks as block (block.sectionId ?? `${block.kind}-${JSON.stringify(block.data).slice(0, 40)}`)}
		<div
			data-preview-section-id={block.sectionId}
			class="tb-preview-block {activeSectionId !== null && activeSectionId === block.sectionId
				? 'tb-preview-block-active'
				: ''} {block.draft ? 'tb-preview-block-draft' : ''}"
			role="button"
			tabindex="0"
			title="Click to edit this section"
			aria-label="Edit this {block.kind.toLowerCase().replaceAll('_', ' ')} section"
			onmouseenter={() => onhoversection(block.sectionId ?? null)}
			onmouseleave={() => onhoversection(null)}
			onclick={() => onclicksection(block.sectionId ?? null)}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onclicksection(block.sectionId ?? null);
				}
			}}
		>
			{#if block.draft}
				<span class="tb-preview-draft-flag">Draft — hidden from visitors</span>
			{/if}
			{#if block.kind === 'HERO'}
				<HeroSection data={block.data} nextEvent={null} serviceTimes={[]} />
			{:else if block.kind === 'EVENTS_RAIL'}
				<EventsRailSection data={block.data} />
			{:else if block.kind === 'BLOG'}
				<BlogSection data={block.data} />
			{:else if block.kind === 'TESTIMONIALS'}
				<TestimonialsSection data={block.data} />
			{:else if block.kind === 'GROUPS'}
				<GroupsSection data={block.data} />
			{:else if block.kind === 'SERVE'}
				<RichSection data={block.data} eyebrow="Serve" />
			{:else if block.kind === 'LEADERS'}
				<LeadersSection data={block.data} />
			{:else if block.kind === 'IM_NEW'}
				<RichSection data={block.data} eyebrow="I'm new" />
			{:else if block.kind === 'PARENTS'}
				<RichSection data={block.data} eyebrow="Parents" />
			{:else if block.kind === 'FAQ'}
				<FaqSection data={block.data} />
			{:else if block.kind === 'CONTACT'}
				<ContactSection data={block.data} />
			{:else if block.kind === 'FORM'}
				<FormSection data={block.data} />
			{/if}
		</div>
	{/each}
	{#if blocks.length === 0}
		<p class="tb-preview-empty">Nothing to preview yet — add a section to see it here.</p>
	{/if}
</div>

<style>
	.tb-preview-stripes {
		isolation: isolate;
	}
	.tb-preview-block {
		position: relative;
		outline: 2px solid transparent;
		outline-offset: -2px;
		transition: outline-color 0.15s ease;
		scroll-margin-top: 1rem;
	}
	.tb-preview-block-active {
		outline-color: var(--brand-primary);
	}
	.tb-preview-block-draft {
		opacity: 0.85;
	}
	.tb-preview-draft-flag {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		z-index: 10;
		background-color: var(--color-warning-bg);
		color: var(--color-warning-fg);
		border: 1px solid var(--color-warning-border);
		font-size: 0.65rem;
		font-weight: 600;
		padding: 0.15rem 0.6rem;
		border-radius: 999px;
	}
	.tb-preview-empty {
		padding: 3rem 1rem;
		text-align: center;
		color: var(--zinc-500);
		font-size: 0.875rem;
	}
</style>
