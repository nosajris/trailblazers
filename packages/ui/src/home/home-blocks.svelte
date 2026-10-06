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
	import IntentTiles from './intent-tiles.svelte';
	import { pickNextEvent } from './next-event.js';

	let { blocks }: { blocks: HomeSectionBlock[] } = $props();

	// The hero points at the soonest upcoming event from the events rail, when the page has one.
	const nextEvent = $derived.by(() => {
		const rail = blocks.find((b) => b.kind === 'EVENTS_RAIL');
		return rail && rail.kind === 'EVENTS_RAIL' ? pickNextEvent(rail.data.events, new Date()) : null;
	});
</script>

{#each blocks as block (`${block.kind}-${JSON.stringify(block.data).slice(0, 40)}`)}
	{#if block.kind === 'HERO'}
		<HeroSection data={block.data} {nextEvent} />
		<IntentTiles />
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
	{/if}
	<!-- CUSTOM blocks have no public design yet. They used to dump their raw JSON onto the page, so they render nothing. -->
{/each}
