<script lang="ts">
	import SeoMeta from '@trailblazers/ui/site/seo-meta.svelte';
	import { resolve } from '$app/paths';
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import { container, sectionY } from '@trailblazers/ui/tb-layout';
	import { whatsappChatUrl } from '@trailblazers/ui/site/share';

	let { data } = $props();

	const campus = $derived(data.campus);
	const extras = $derived(data.settings.siteExtras);
	const chatHref = $derived(
		whatsappChatUrl(extras.whatsappNumber, `Hello! I would like to visit the ${campus.label} campus.`)
	);
</script>

<SeoMeta
	title={`${campus.label} — Trailblazers`}
	description={`Service times, address and directions for the ${campus.label} campus.`}
	image="/images/wallpaper03.jpg"
/>

<SiteShell settings={data.settings}>
	<section class="relative hero-fill flex flex-col justify-center overflow-hidden bg-brand-dark py-16 text-white md:py-24">
		<div class="absolute inset-0">
			<img
				src="/images/wallpaper03.jpg"
				alt=""
				class="h-full w-full object-cover opacity-30"
				sizes="100vw"
				fetchpriority="high"
				loading="eager"
				decoding="async"
			/>
			<div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/85 to-brand-dark/50"></div>
		</div>
		<div class="{container} relative max-w-4xl">
			<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Campus</p>
			<h1 class="mt-4 font-sans text-4xl font-black tracking-tight md:text-6xl">{campus.label}</h1>
			{#if campus.times && campus.times.length > 0}
				<p class="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-lg font-semibold text-white/90">
					{#each campus.times as time, i (i)}
						{#if i > 0}<span class="text-white/40" aria-hidden="true">·</span>{/if}
						<span>{time}</span>
					{/each}
				</p>
			{/if}
		</div>
	</section>

	<section class="bg-brand-light {sectionY}">
		<div class="{container} grid max-w-5xl gap-10 lg:grid-cols-3">
			<div class="lg:col-span-2">
				<h2 class="font-sans text-2xl font-black text-brand-dark md:text-3xl">Getting here</h2>
				{#if campus.address}
					<p class="mt-4 text-lg leading-relaxed text-brand-dark/80">{campus.address}</p>
				{:else}
					<p class="mt-4 text-lg leading-relaxed text-brand-dark/80">
						Ask us for directions and we will meet you at the door.
					</p>
				{/if}

				<div class="mt-8 flex flex-wrap gap-3">
					{#if campus.mapUrl}
						<!-- eslint-disable svelte/no-navigation-without-resolve -- external map link from site settings, validated as http(s) on save -->
						<a
							class="inline-flex min-h-12 items-center rounded-full bg-brand-primary px-8 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md transition hover:brightness-105"
							href={campus.mapUrl}
							target="_blank"
							rel="noopener noreferrer">Open in maps</a
						>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{/if}
					<a
						class="inline-flex min-h-12 items-center rounded-full border border-brand-dark/15 bg-white px-8 text-xs font-bold uppercase tracking-[0.14em] text-brand-dark transition hover:border-brand-primary"
						href={resolve('/plan-a-visit')}>Plan your visit</a
					>
					{#if chatHref}
						<!-- eslint-disable svelte/no-navigation-without-resolve -- external wa.me link built from the settings number -->
						<a
							class="inline-flex min-h-12 items-center rounded-full border border-brand-dark/15 bg-white px-8 text-xs font-bold uppercase tracking-[0.14em] text-brand-dark transition hover:border-brand-primary"
							href={chatHref}
							target="_blank"
							rel="noopener noreferrer">Ask on WhatsApp</a
						>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{/if}
				</div>
			</div>

			<aside class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
				<h2 class="font-sans text-lg font-bold text-brand-dark">First time here?</h2>
				<p class="mt-3 text-sm leading-relaxed text-brand-dark/70">
					Come as you are, arrive a few minutes early, and look for a host at the door — they are expecting you.
				</p>
				<ul class="mt-6 space-y-3 text-sm font-semibold">
					<li>
						<a class="text-brand-primary hover:underline" href={resolve('/plan-a-visit')}>What a first visit looks like →</a>
					</li>
					<li><a class="text-brand-primary hover:underline" href={resolve('/events')}>What is coming up →</a></li>
					<li><a class="text-brand-primary hover:underline" href={resolve('/groups')}>Find a group near you →</a></li>
				</ul>
			</aside>
		</div>
	</section>

	{#if (extras.campuses ?? []).length > 1}
		<section class="border-t border-brand-dark/[0.06] bg-brand-light pb-16 md:pb-20">
			<div class="{container} max-w-5xl">
				<h2 class="font-sans text-xl font-bold text-brand-dark">Other campuses</h2>
				<ul class="mt-6 flex flex-wrap gap-3">
					{#each (extras.campuses ?? []).filter((c) => c.id !== campus.id) as other (other.id)}
						<li>
							<a
								class="inline-flex min-h-11 items-center rounded-full border border-neutral-200 bg-white px-5 text-sm font-semibold text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
								href={resolve('/campus/[id]', { id: other.id })}>{other.label}</a
							>
						</li>
					{/each}
				</ul>
			</div>
		</section>
	{/if}
</SiteShell>
