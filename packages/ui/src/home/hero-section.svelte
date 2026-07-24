<script lang="ts">
	import type { HomeHeroVm } from '@trailblazers/core';
	import { container } from '../tb-layout.js';

	let { data }: { data: HomeHeroVm } = $props();

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
</script>

<section class="relative min-h-[min(88vh,54rem)] overflow-hidden bg-brand-dark text-white">
	<div class="absolute inset-0">
		{#if embed}
			<div class="absolute inset-0 scale-105">
				<iframe
					class="pointer-events-none h-full w-full scale-[1.2] opacity-45 saturate-[1.05]"
					src={embed}
					title="Hero video"
					loading="lazy"
					referrerpolicy="strict-origin-when-cross-origin"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
				></iframe>
			</div>
		{:else if data.imageUrl}
			<img
				src={data.imageUrl}
				alt=""
				class="h-full w-full scale-105 object-cover opacity-[0.38] saturate-[1.05]"
				sizes="100vw"
				fetchpriority="high"
				loading="eager"
				decoding="async"
			/>
		{:else}
			<div class="h-full w-full bg-gradient-to-br from-brand-dark via-[#171616] to-brand-primary/35"></div>
		{/if}
		<div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-brand-dark/30"></div>
		<div
			class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,92,75,0.18),_transparent_55%)]"
		></div>
	</div>

	<div
		class="{container} relative flex min-h-[min(88vh,54rem)] flex-col justify-center py-20 sm:py-24 md:py-28 lg:py-32"
	>
		<div class="grid gap-12 lg:grid-cols-12 lg:items-center">
			<div class="lg:col-span-8">
				<!-- Acrylic Eyebrow Badge -->
				<div class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md shadow-lg mb-6">
					<span class="h-2 w-2 rounded-full bg-brand-gold animate-pulse"></span>
					<span class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Young Adults & Student Ecosystem</span>
				</div>

				<h1
					class="font-sans text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-md"
				>
					{data.title}
				</h1>
				{#if data.subtitle}
					<p class="mt-6 max-w-2xl text-base leading-relaxed text-gray-200 sm:text-lg md:text-xl">
						{data.subtitle}
					</p>
				{/if}
				<div class="mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
					{#if data.primaryCta}
						<a
							class="inline-flex min-h-[3.25rem] flex-1 items-center justify-center rounded-full bg-brand-primary px-8 text-center text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_8px_30px_rgba(249,92,75,0.45)] transition hover:bg-brand-secondary hover:shadow-[0_12px_40px_rgba(249,92,75,0.55)] sm:flex-none sm:px-10"
							href={data.primaryCta.href}>{data.primaryCta.label}</a
						>
					{/if}
					{#if data.secondaryCta}
						<a
							class="inline-flex min-h-[3.25rem] flex-1 items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 text-center text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md transition hover:bg-white/20 hover:border-white/50 sm:flex-none sm:px-10 shadow-lg"
							href={data.secondaryCta.href}>{data.secondaryCta.label}</a
						>
					{/if}
				</div>
			</div>

			<!-- Acrylic Floating Stats Card Overlay -->
			<div class="hidden lg:block lg:col-span-4">
				<div class="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl space-y-6">
					<div class="flex items-center gap-4">
						<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
							<svg class="h-6 w-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
						</div>
						<div>
							<div class="text-2xl font-black text-white">5,000+</div>
							<div class="text-xs font-semibold text-gray-300">Active Young Adults</div>
						</div>
					</div>

					<div class="h-px w-full bg-white/10"></div>

					<div class="flex items-center gap-4">
						<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-brand-gold border border-amber-500/30">
							<svg class="h-6 w-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
						</div>
						<div>
							<div class="text-2xl font-black text-white">12+ Hubs</div>
							<div class="text-xs font-semibold text-gray-300">University & City Hubs</div>
						</div>
					</div>

					<div class="h-px w-full bg-white/10"></div>

					<a href="/plan-a-visit" class="block w-full text-center rounded-xl bg-white/15 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/25 transition border border-white/20">
						Join Next Gathering →
					</a>
				</div>
			</div>
		</div>
	</div>
</section>
