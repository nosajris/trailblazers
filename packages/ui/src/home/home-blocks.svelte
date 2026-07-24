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

	let { blocks }: { blocks: HomeSectionBlock[] } = $props();
</script>

{#each blocks as block (`${block.kind}-${JSON.stringify(block.data).slice(0, 40)}`)}
	{#if block.kind === 'HERO'}
		<HeroSection data={block.data} />
	{:else if block.kind === 'EVENTS_RAIL'}
		<EventsRailSection data={block.data} />
	{:else if block.kind === 'BLOG'}
		<div id="blog">
			<BlogSection data={block.data} />
		</div>
	{:else if block.kind === 'TESTIMONIALS'}
		<TestimonialsSection data={block.data} />
	{:else if block.kind === 'GROUPS'}
		<div id="groups">
			<GroupsSection data={block.data} />
		</div>
	{:else if block.kind === 'SERVE'}
		<div id="serve">
			<RichSection data={block.data} eyebrow="Serve" />
		</div>
	{:else if block.kind === 'LEADERS'}
		<LeadersSection data={block.data} />
	{:else if block.kind === 'IM_NEW'}
		<RichSection data={block.data} eyebrow="I'm new" />
	{:else if block.kind === 'PARENTS'}
		<RichSection data={block.data} eyebrow="Parents" />
	{:else if block.kind === 'FAQ'}
		<div id="faq">
			<FaqSection data={block.data} />
		</div>
	{:else if block.kind === 'CONTACT'}
		<ContactSection data={block.data} />
	{:else if block.kind === 'CUSTOM'}
		<section class="border-b border-gray-200 bg-brand-light py-12">
			<div class="mx-auto max-w-7xl px-4">
				<pre class="overflow-x-auto rounded-xl bg-white p-4 text-xs text-gray-600">{JSON.stringify(
						block.data,
						null,
						2
					)}</pre>
			</div>
		</section>
	{/if}
{/each}
