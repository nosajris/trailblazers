<script lang="ts">
	import { resolve } from '$app/paths';
	import SeoMeta from '@trailblazers/ui/site/seo-meta.svelte';
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import { container, sectionY } from '@trailblazers/ui/tb-layout';

	let { data } = $props();

	let selectedVideoId = $state<string | null>(null);

	function openVideo(youtubeId: string | null | undefined) {
		if (youtubeId) {
			selectedVideoId = youtubeId;
		}
	}

	function closeVideo() {
		selectedVideoId = null;
	}
</script>

<SeoMeta
	title="Watch & Messages — PAOZ Trailblazers"
	description="Watch latest sermons, video messages, and series from PAOZ Trailblazers."
	image={data.featuredSermon?.thumbnailUrl ?? '/images/sermon1.jpg'}
/>

<SiteShell settings={data.settings}>
	<!-- Elevation-style Hero section -->
	<section class="relative hero-fill flex flex-col justify-center overflow-hidden border-b border-white/10 bg-brand-dark py-16 text-white md:py-24">
		<div class="absolute inset-0 opacity-30">
			<img
				src="/images/sermon1.jpg"
				alt="Sermons background"
				class="h-full w-full object-cover"
				fetchpriority="high"
				loading="eager"
				decoding="async"
			/>
		</div>
		<div class="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/95 to-brand-dark/80"></div>
		<div class="{container} relative max-w-4xl">
			<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Watch & Listen</p>
			<h1 class="mt-4 font-sans text-4xl font-black tracking-tight md:text-6xl">
				{data.featuredSermon?.title || 'Transformational Faith & Purpose'}
			</h1>
			<p class="mt-4 text-lg text-zinc-300 max-w-2xl">
				{data.featuredSermon?.summary || 'Explore powerful messages, practical teachings, and spiritual wisdom designed for young leaders.'}
			</p>
			{#if data.featuredSermon?.youtubeId}
				<div class="mt-8">
					<button
						onclick={() => openVideo(data.featuredSermon?.youtubeId)}
						class="inline-flex items-center gap-3 rounded-full bg-brand-primary px-8 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-xl transition hover:brightness-110"
					>
						<svg class="h-5 w-5 fill-current" viewBox="0 0 24 24">
							<path d="M8 5v14l11-7z" />
						</svg>
						Watch Featured Message
					</button>
				</div>
			{/if}
		</div>
	</section>

	<!-- Sermon Archive Grid -->
	<section class="bg-zinc-50 {sectionY}">
		<div class={container}>
			<div class="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div>
					<p class="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary">Message Archive</p>
					<h2 class="mt-2 text-3xl font-black text-zinc-900 tracking-tight">Recent Messages & Teachings</h2>
				</div>
			</div>

			{#if data.sermons.length === 0}
				<div class="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
					<p class="text-zinc-500">
						The first messages are on their way. In the meantime, come and hear one in person —
						<a class="font-semibold text-brand-primary hover:underline" href={resolve('/plan-a-visit')}
							>plan a visit</a
						>.
					</p>
				</div>
			{:else}
				<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.sermons as sermon (sermon.id)}
						<!-- eslint-disable svelte/no-navigation-without-resolve -- internal path built from the message slug -->
						<a
							href={sermon.watchHref}
							class="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
						>
							<div class="relative aspect-video overflow-hidden bg-zinc-900">
								<img
									src={sermon.thumbnailUrl || '/images/sermon2.jpg'}
									alt=""
									class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
									loading="lazy"
									sizes="(max-width: 1024px) 100vw, 33vw"
								/>
								<span
									class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100"
									aria-hidden="true"
								>
									<span class="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg">
										<svg class="ml-0.5 h-6 w-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
									</span>
								</span>
							</div>
							<div class="flex flex-1 flex-col p-6">
								<p class="text-xs font-semibold text-brand-primary">{sermon.speaker}</p>
								<h3 class="mt-2 text-xl font-bold leading-snug text-zinc-900">{sermon.title}</h3>
								{#if sermon.scripture}
									<p class="mt-1 text-xs font-medium text-zinc-500">{sermon.scripture}</p>
								{/if}
								{#if sermon.summary}
									<p class="mt-3 line-clamp-2 text-sm text-zinc-600">{sermon.summary}</p>
								{/if}
								<span class="mt-auto pt-6 text-xs font-bold uppercase tracking-wider text-brand-primary"
									>Open this message →</span
								>
							</div>
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<!-- Video Modal -->
	{#if selectedVideoId}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
			<div class="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl">
				<button
					onclick={closeVideo}
					class="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
					aria-label="Close modal"
				>
					✕
				</button>
				<div class="relative aspect-video">
					<iframe
						src="https://www.youtube-nocookie.com/embed/{selectedVideoId}?autoplay=1"
						class="h-full w-full"
						title="Sermon video player"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen
					></iframe>
				</div>
			</div>
		</div>
	{/if}
</SiteShell>
