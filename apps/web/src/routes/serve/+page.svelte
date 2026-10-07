<script lang="ts">
	import SeoMeta from '@trailblazers/ui/site/seo-meta.svelte';
	import { resolve } from '$app/paths';
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import RichSection from '@trailblazers/ui/home/rich-section.svelte';
	import { container, sectionY } from '@trailblazers/ui/tb-layout';

	let { data } = $props();
</script>

<SeoMeta
	title="Serve — Trailblazers"
	description="Volunteer with Trailblazers — hospitality, production, groups, and more ways to build the church."
	image="/images/wallpaper01.jpg"
/>

<SiteShell settings={data.settings}>
	<section class="relative hero-fill flex flex-col justify-center overflow-hidden bg-brand-dark py-16 text-white md:py-24">
		<div class="absolute inset-0 opacity-25">
			<img
				src="/images/wallpaper01.jpg"
				alt=""
				class="h-full w-full object-cover"
				sizes="100vw"
				fetchpriority="high"
				loading="eager"
				decoding="async"
			/>
		</div>
		<div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/90 to-brand-dark/50"></div>
		<div class="{container} relative max-w-4xl">
			<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Serve</p>
			<h1 class="mt-4 font-sans text-4xl font-black tracking-tight md:text-6xl">Your seat was never meant to be passive</h1>
			<p class="mt-6 max-w-2xl text-lg text-gray-200">
				From greeting guests to running production, serving is how we become family — and how Sunday becomes home
				for someone else.
			</p>
		</div>
	</section>

	{#if data.section}
		<RichSection data={data.section} eyebrow="Teams" />
	{:else}
		<section class="bg-white {sectionY}">
			<div class="{container} max-w-3xl text-center">
				<h2 class="font-sans text-2xl font-black text-brand-dark">Tell us what you are good at</h2>
				<p class="mt-4 text-brand-dark/75">
					Media, worship, hosting, logistics, driving, admin — if you can do it, there is a team that
					needs it. Send a note and we will put you with the right people.
				</p>
				<a
					class="mt-8 inline-flex min-h-12 items-center rounded-full bg-brand-primary px-10 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md transition hover:brightness-105"
					href={resolve('/contact')}>Start the conversation</a
				>
			</div>
		</section>
	{/if}

	<section class="border-t border-neutral-200/80 bg-[#f3f2ef] py-16 md:py-20">
		<div class="{container} grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
			<div class="overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/[0.04]">
				<img
					src="/images/slider05.jpeg"
					alt=""
					class="aspect-[4/3] w-full object-cover"
					loading="lazy"
					sizes="(max-width: 1024px) 100vw, 50vw"
				/>
			</div>
			<div>
				<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Next step</p>
				<h2 class="mt-3 font-sans text-2xl font-black text-brand-dark md:text-3xl">Tell us how you want to jump in</h2>
				<p class="mt-4 text-brand-dark/75">
					We will match your gifts and schedule with a team that fits — no awkward pressure, just a clear path.
				</p>
				<a
					class="mt-8 inline-flex rounded-full bg-brand-primary px-10 py-4 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md transition hover:brightness-105"
					href={resolve('/contact?topic=serve')}>Start the conversation</a
				>
			</div>
		</div>
	</section>
</SiteShell>
