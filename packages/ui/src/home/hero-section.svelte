<script lang="ts">
	import { resolve } from '$app/paths';
	import type { HomeHeroVm } from '@trailblazers/core';
	import { container } from '../tb-layout.js';
	import { daysUntil } from './next-event.js';
	import { responsiveSrcset } from '../site/responsive-images.js';

	type HeroNextEvent = { id: number | string; title: string; date: Date | string };

	let { data, nextEvent = null }: { data: HomeHeroVm; nextEvent?: HeroNextEvent | null } = $props();

	function youtubeEmbedUrl(url: string): string | null {
		const trimmed = url.trim();
		if (!trimmed) return null;
		if (trimmed.includes('youtube-nocookie.com/embed/') || trimmed.includes('youtube.com/embed/')) {
			return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
		}
		try {
			const u = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
			const v = u.searchParams.get('v');
			if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
			if (u.hostname.replace('www.', '') === 'youtu.be') {
				const id = u.pathname.replace(/^\//, '').split('/')[0];
				if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
			}
		} catch {
			return null;
		}
		return null;
	}

	const embed = $derived(data.videoUrl ? youtubeEmbedUrl(data.videoUrl) : null);

	// A fixed zone keeps the server-rendered and browser-rendered text identical.
	const formatWhen = (d: Date | string) =>
		new Intl.DateTimeFormat('en-GB', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			hour: 'numeric',
			minute: '2-digit',
			timeZone: 'Africa/Harare'
		}).format(new Date(d));
</script>

<section class="relative min-h-[min(82svh,46rem)] overflow-hidden bg-brand-dark text-white">
	<div class="absolute inset-0">
		{#if embed}
			<!-- The video is desktop only: on mobile data a hidden lazy iframe never loads, so the photo carries the hero. -->
			<div class="absolute inset-0 hidden md:block" data-bg-video>
				<iframe
					class="pointer-events-none h-full w-full scale-[1.2] opacity-60"
					src={embed}
					title="Hero video"
					loading="lazy"
					referrerpolicy="strict-origin-when-cross-origin"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
				></iframe>
			</div>
			{#if data.imageUrl}
				<img
					src={data.imageUrl}
					srcset={responsiveSrcset(data.imageUrl)}
					alt=""
					class="h-full w-full object-cover opacity-60 md:hidden"
					sizes="100vw"
					fetchpriority="high"
					loading="eager"
					decoding="async"
				/>
			{/if}
		{:else if data.imageUrl}
			<img
				src={data.imageUrl}
					srcset={responsiveSrcset(data.imageUrl)}
				alt=""
				class="h-full w-full object-cover opacity-60"
				sizes="100vw"
				fetchpriority="high"
				loading="eager"
				decoding="async"
			/>
		{:else}
			<div class="h-full w-full bg-gradient-to-br from-brand-dark via-brand-dark to-brand-primary/35"></div>
		{/if}
		<!-- Light at the top so the photo reads, dark at the bottom where the text sits. -->
		<div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-transparent"></div>
	</div>

	<div class="{container} relative flex min-h-[min(82svh,46rem)] flex-col justify-end pb-10 pt-24 md:pb-16 lg:justify-center lg:pb-24 lg:pt-28">
		<div class="max-w-3xl">
			<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">
				Young adults &amp; students
			</p>

			<h1 class="mt-4 font-sans text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
				{data.title}
			</h1>
			{#if data.subtitle}
				<p class="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
					{data.subtitle}
				</p>
			{/if}

			<div class="mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:items-center">
				<!-- eslint-disable svelte/no-navigation-without-resolve -- these hrefs come from the CMS / site settings and may be absolute external URLs, which resolve() cannot take -->
				{#if data.primaryCta}
					<a
						class="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-primary px-8 text-center text-sm font-bold text-white transition hover:bg-brand-secondary"
						href={data.primaryCta.href}>{data.primaryCta.label}</a
					>
				{/if}
				{#if data.secondaryCta}
					<a
						class="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 px-8 text-center text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
						href={data.secondaryCta.href}>{data.secondaryCta.label}</a
					>
				{/if}
				<!-- eslint-enable svelte/no-navigation-without-resolve -- these hrefs come from the CMS / site settings and may be absolute external URLs, which resolve() cannot take -->
			</div>

			{#if nextEvent}
				<a
					href={resolve('/events/[id]', { id: String(nextEvent.id) })}
					class="mt-8 inline-flex max-w-full items-center gap-3 text-sm text-white/80 transition hover:text-white"
				>
					<span class="h-2 w-2 shrink-0 rounded-full bg-brand-gold" aria-hidden="true"></span>
					<span class="min-w-0">
						<span class="font-bold text-brand-gold">{daysUntil(nextEvent.date, new Date())}</span>
						<span aria-hidden="true"> · </span>
						<span>{formatWhen(nextEvent.date)}</span>
						<span aria-hidden="true"> · </span>
						<span class="font-semibold text-white">{nextEvent.title}</span>
						<span aria-hidden="true"> →</span>
					</span>
				</a>
			{/if}
		</div>
	</div>
</section>
