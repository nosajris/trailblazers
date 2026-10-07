<script lang="ts">
	import { resolve } from '$app/paths';
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import SeoMeta from '@trailblazers/ui/site/seo-meta.svelte';
	import { container, sectionY } from '@trailblazers/ui/tb-layout';

	/**
	 * Locations and the Business Empowerment Programme.
	 *
	 * This page used to render four hardcoded hubs with invented street
	 * addresses, meeting times and host names, while the verified businesses and
	 * equipment it actually loads from the database were fetched and thrown
	 * away. Both halves are now real: locations come from campus settings, and
	 * the BEP listings come from the staff portal. Every section hides itself
	 * when it has nothing to show.
	 */
	let { data } = $props();

	const campuses = $derived(data.settings.siteExtras.campuses ?? []);
	const businesses = $derived(data.businesses);
	const gear = $derived(data.rentalGear);

	let industry = $state('ALL');
	const industries = $derived([...new Set(businesses.map((b) => b.industry))].sort());
	const shownBusinesses = $derived(
		industry === 'ALL' ? businesses : businesses.filter((b) => b.industry === industry)
	);

	const chip = (active: boolean) =>
		`min-h-11 rounded-full border px-4 text-xs font-bold uppercase tracking-wide transition ${
			active
				? 'border-brand-primary bg-brand-primary text-white'
				: 'border-brand-dark/15 bg-white text-brand-dark hover:border-brand-primary'
		}`;
</script>

<SeoMeta
	title="Locations & BEP Campus Hubs — PAOZ Trailblazers"
	description="Find a local PAOZ Trailblazers gathering, and the businesses and equipment in our Business Empowerment Programme."
	image="/images/image06.jpeg"
/>

<SiteShell settings={data.settings}>
	<section class="relative overflow-hidden bg-brand-dark py-20 text-white md:py-28">
		<div class="absolute inset-0">
			<img
				src="/images/image06.jpeg"
				alt=""
				class="h-full w-full object-cover opacity-25"
				sizes="100vw"
				fetchpriority="high"
				loading="eager"
				decoding="async"
			/>
			<div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/90 to-brand-dark/50"></div>
		</div>
		<div class="{container} relative max-w-4xl">
			<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Locations &amp; hubs</p>
			<h1 class="mt-4 font-sans text-4xl font-black tracking-tight md:text-6xl">Find a gathering near you</h1>
			<p class="mt-6 max-w-2xl text-lg leading-relaxed text-gray-200">
				On campus, in the city, or online — and when you are building something, the Business
				Empowerment Programme is how this community backs it.
			</p>
		</div>
	</section>

	<section class="bg-brand-light {sectionY}" aria-labelledby="hubs-title">
		<div class={container}>
			<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Gathering hubs</p>
			<h2 id="hubs-title" class="mt-3 font-sans text-2xl font-black text-brand-dark md:text-4xl">
				Where we meet
			</h2>

			{#if campuses.length === 0}
				<p class="mt-6 max-w-2xl text-brand-dark/75">
					Ask us where the nearest gathering is and we will point you to it —
					<a class="font-semibold text-brand-primary hover:underline" href={resolve('/contact')}>send a note</a> or
					<a class="font-semibold text-brand-primary hover:underline" href={resolve('/plan-a-visit')}>plan a visit</a>.
				</p>
			{:else}
				<div class="mt-8 grid gap-6 md:grid-cols-2">
					{#each campuses as campus (campus.id)}
						<div class="flex flex-col rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm">
							<h3 class="font-sans text-xl font-bold text-brand-dark">{campus.label}</h3>
							{#if campus.times && campus.times.length > 0}
								<ul class="mt-4 space-y-1 text-sm font-semibold text-brand-dark/80">
									{#each campus.times as time, i (i)}
										<li>{time}</li>
									{/each}
								</ul>
							{/if}
							{#if campus.address}
								<p class="mt-3 flex-1 text-sm leading-relaxed text-brand-dark/70">{campus.address}</p>
							{:else}
								<span class="flex-1"></span>
							{/if}
							<div class="mt-7 flex flex-wrap items-center gap-4 border-t border-neutral-200/80 pt-5">
								<a
									class="text-xs font-bold uppercase tracking-wider text-brand-primary hover:underline"
									href={resolve('/campus/[id]', { id: campus.id })}>Campus details →</a
								>
								{#if campus.mapUrl}
									<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external map link from site settings, validated as http(s) on save -->
									<a
										class="text-xs font-bold uppercase tracking-wider text-brand-dark/70 hover:text-brand-primary"
										href={campus.mapUrl}
										target="_blank"
										rel="noopener noreferrer">Get directions</a
									>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	{#if businesses.length > 0}
		<section class="border-t border-brand-dark/[0.06] bg-white {sectionY}" aria-labelledby="bep-title">
			<div class={container}>
				<div class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
					<div>
						<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">
							Business Empowerment Programme
						</p>
						<h2 id="bep-title" class="mt-3 font-sans text-2xl font-black text-brand-dark md:text-4xl">
							Businesses in this community
						</h2>
						<p class="mt-3 max-w-2xl text-brand-dark/70">
							Every listing here is verified by the team. Hire them, buy from them, build with them.
						</p>
					</div>
					{#if industries.length > 1}
						<div class="flex flex-wrap gap-2" role="group" aria-label="Filter businesses by industry">
							<button type="button" class={chip(industry === 'ALL')} aria-pressed={industry === 'ALL'} onclick={() => (industry = 'ALL')}>All</button>
							{#each industries as name (name)}
								<button type="button" class={chip(industry === name)} aria-pressed={industry === name} onclick={() => (industry = name)}>{name}</button>
							{/each}
						</div>
					{/if}
				</div>

				<ul class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each shownBusinesses as business (business.id)}
						<li class="flex flex-col rounded-2xl border border-neutral-200 bg-brand-light/60 p-6">
							<p class="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">{business.industry}</p>
							<h3 class="mt-2 font-sans text-lg font-bold text-brand-dark">{business.businessName}</h3>
							<p class="mt-3 flex-1 text-sm leading-relaxed text-brand-dark/70">{business.description}</p>
							{#if business.websiteUrl}
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- business website supplied by its owner -->
								<a
									class="mt-5 inline-flex min-h-11 items-center text-sm font-bold text-brand-primary hover:underline"
									href={business.websiteUrl}
									target="_blank"
									rel="noopener noreferrer external">Visit website →</a
								>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		</section>
	{/if}

	{#if gear.length > 0}
		<section class="border-t border-brand-dark/[0.06] bg-brand-light {sectionY}" aria-labelledby="gear-title">
			<div class={container}>
				<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Equipment</p>
				<h2 id="gear-title" class="mt-3 font-sans text-2xl font-black text-brand-dark md:text-4xl">
					Available to hire
				</h2>
				<p class="mt-3 max-w-2xl text-brand-dark/70">
					Sound, media and event gear members can book. Ask the team to reserve a date.
				</p>

				<ul class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each gear as item (item.id)}
						<li class="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
							{#if item.imageUrl}
								<div class="aspect-[16/10] overflow-hidden bg-neutral-100">
									<img
										src={item.imageUrl}
										alt=""
										class="h-full w-full object-cover"
										loading="lazy"
										sizes="(max-width: 1024px) 100vw, 33vw"
									/>
								</div>
							{/if}
							<div class="flex flex-1 flex-col p-6">
								<h3 class="font-sans text-lg font-bold text-brand-dark">{item.name}</h3>
								{#if item.description}
									<p class="mt-2 flex-1 text-sm leading-relaxed text-brand-dark/70">{item.description}</p>
								{/if}
								<p class="mt-4 text-sm font-bold text-brand-dark">${item.dailyRate} per day</p>
							</div>
						</li>
					{/each}
				</ul>
				<a
					class="mt-10 inline-flex min-h-12 items-center rounded-full bg-brand-primary px-8 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md transition hover:brightness-105"
					href={resolve('/contact')}>Ask about hiring</a
				>
			</div>
		</section>
	{/if}
</SiteShell>
