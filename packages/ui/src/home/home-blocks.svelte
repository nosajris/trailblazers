<script lang="ts">
	import type { HomeSectionBlock, SermonCardVm, SiteExtras } from '@trailblazers/core';
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
	import LatestMessageSection from './latest-message-section.svelte';
	import WaysToAttendSection from './ways-to-attend-section.svelte';
	import GetInvolvedSection from './get-involved-section.svelte';
	import { pickNextEvent } from './next-event.js';

	/**
	 * `variant` decides whether the homepage-only sections are injected around
	 * the CMS blocks. Any other CMS page ('page') gets only its own sections,
	 * so an About page does not sprout a "find your place" row.
	 */
	let {
		blocks,
		latestSermon = null,
		extras = {},
		variant = 'home'
	}: {
		blocks: HomeSectionBlock[];
		latestSermon?: SermonCardVm | null;
		extras?: SiteExtras;
		variant?: 'home' | 'page';
	} = $props();

	const isHome = $derived(variant === 'home');

	const watchHref = $derived(extras.watchUrl?.trim() ? extras.watchUrl : '/watch');

	// The hero points at the soonest upcoming event from the events rail, when the page has one.
	const nextEvent = $derived.by(() => {
		const rail = blocks.find((b) => b.kind === 'EVENTS_RAIL');
		return rail && rail.kind === 'EVENTS_RAIL' ? pickNextEvent(rail.data.events, new Date()) : null;
	});
</script>

<div class="tb-stripes">
{#each blocks as block (`${block.kind}-${JSON.stringify(block.data).slice(0, 40)}`)}
	{#if block.kind === 'HERO'}
		<HeroSection data={block.data} {nextEvent} serviceTimes={isHome ? (extras.visitTimes ?? []) : []} />
		{#if isHome}
			<LatestMessageSection sermon={latestSermon} {watchHref} />
			<IntentTiles />
			<WaysToAttendSection campuses={extras.campuses ?? []} {watchHref} />
		{/if}
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

<!-- The homepage ends with a decision rather than another scroll. -->
{#if isHome}
	<GetInvolvedSection givingUrl={extras.givingUrl ?? ''} />
{/if}
</div>

<style>
	/*
	 * Alternating bands using palette colours only. Sections are brand-light by
	 * default; every even-numbered one switches to white. Dark sections (hero,
	 * testimonials) keep their own background.
	 */
	.tb-stripes > :global(section:nth-child(even):not(.bg-brand-dark)),
	.tb-stripes > :global(div:nth-child(even) > section:not(.bg-brand-dark)) {
		background-color: var(--color-bg-surface);
	}
</style>
