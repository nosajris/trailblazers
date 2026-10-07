<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import SeoMeta from '@trailblazers/ui/site/seo-meta.svelte';
	import { container } from '@trailblazers/ui/tb-layout';
	import { whatsappShareUrl } from '@trailblazers/ui/site/share';

	let { data } = $props();

	// Reused when only the [slug] changes, so this has to stay reactive.
	const message = $derived(data.message);

	const published = $derived(
		message.publishedAt
			? new Intl.DateTimeFormat('en-GB', {
					day: 'numeric',
					month: 'long',
					year: 'numeric',
					timeZone: 'Africa/Harare'
				}).format(new Date(message.publishedAt))
			: null
	);

	/** Loaded on demand: a visitor who came to read the notes should not pay for the player. */
	let playing = $state(false);

	const shareHref = $derived(
		whatsappShareUrl(`${message.title} — ${message.speaker}\n${page.url.href}`)
	);

	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'VideoObject',
		name: message.title,
		description: message.summary ?? `${message.title}, a message from ${message.speaker}.`,
		...(message.thumbnailUrl ? { thumbnailUrl: message.thumbnailUrl } : {}),
		...(message.publishedAt ? { uploadDate: new Date(message.publishedAt).toISOString() } : {}),
		...(message.youtubeId ? { embedUrl: `https://www.youtube-nocookie.com/embed/${message.youtubeId}` } : {}),
		publisher: { '@type': 'Organization', name: 'PAOZ Trailblazers' }
	});
</script>

<SeoMeta
	title={`${message.title} — Trailblazers`}
	description={message.summary ?? `${message.title}, a message from ${message.speaker}.`}
	image={message.thumbnailUrl ?? '/images/sermon1.jpg'}
	type="article"
	publishedTime={message.publishedAt ? new Date(message.publishedAt).toISOString() : undefined}
	{jsonLd}
/>

<SiteShell settings={data.settings}>
	<article class="bg-brand-light pb-20">
		<header class="bg-brand-dark pb-10 pt-12 text-white md:pb-14 md:pt-16">
			<div class="{container} max-w-4xl">
				{#if message.series}
					<a
						class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold hover:underline"
						href={resolve('/messages/[slug]', { slug: message.series.slug })}>{message.series.title}</a
					>
				{:else}
					<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Message</p>
				{/if}
				<h1 class="mt-4 font-sans text-3xl font-black leading-tight tracking-tight md:text-5xl">
					{message.title}
				</h1>
				<p class="mt-4 text-sm font-semibold text-white/80">
					{message.speaker}{#if published}<span class="text-white/40"> · </span>{published}{/if}
				</p>
				{#if message.scripture}
					<p class="mt-2 text-sm font-semibold text-brand-gold">{message.scripture}</p>
				{/if}
			</div>
		</header>

		<div class="{container} max-w-4xl">
			<div class="-mt-6 overflow-hidden rounded-2xl bg-brand-dark shadow-xl md:-mt-8">
				{#if message.youtubeId && playing}
					<iframe
						class="aspect-video w-full"
						src={`https://www.youtube-nocookie.com/embed/${message.youtubeId}?autoplay=1`}
						title={message.title}
						referrerpolicy="strict-origin-when-cross-origin"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen
					></iframe>
				{:else}
					<div class="relative aspect-video">
						<img
							src={message.thumbnailUrl ?? '/images/sermon1.jpg'}
							alt=""
							class="h-full w-full object-cover opacity-80"
							loading="lazy"
							decoding="async"
							sizes="(max-width: 1024px) 100vw, 60vw"
						/>
						{#if message.youtubeId}
							<button
								type="button"
								class="absolute inset-0 flex items-center justify-center"
								onclick={() => (playing = true)}
							>
								<span class="sr-only">Play this message</span>
								<span
									class="flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary text-white shadow-2xl transition hover:brightness-110"
									aria-hidden="true"
								>
									<svg class="ml-1 h-9 w-9 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
								</span>
							</button>
						{/if}
					</div>
				{/if}
			</div>

			{#if message.summary}
				<p class="mt-10 text-lg leading-relaxed text-brand-dark/80">{message.summary}</p>
			{/if}

			<div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-neutral-200/80 py-4">
				<!-- eslint-disable svelte/no-navigation-without-resolve -- external wa.me share link -->
				<a
					class="text-sm font-semibold text-brand-primary hover:underline"
					href={shareHref}
					target="_blank"
					rel="noopener noreferrer">Share on WhatsApp</a
				>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
				{#if message.notesUrl}
					<!-- eslint-disable svelte/no-navigation-without-resolve -- notes file supplied by staff, may be hosted elsewhere -->
					<a
						class="text-sm font-semibold text-brand-primary hover:underline"
						href={message.notesUrl}
						target="_blank"
						rel="noopener noreferrer">Download the notes</a
					>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				{/if}
				{#if message.audioUrl}
					<!-- eslint-disable svelte/no-navigation-without-resolve -- audio file supplied by staff, may be hosted elsewhere -->
					<a
						class="text-sm font-semibold text-brand-primary hover:underline"
						href={message.audioUrl}
						target="_blank"
						rel="noopener noreferrer">Listen to the audio</a
					>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				{/if}
			</div>

			{#if message.notes}
				<section class="mt-12" aria-labelledby="message-notes-title">
					<h2 id="message-notes-title" class="font-sans text-2xl font-black text-brand-dark">Message notes</h2>
					<p class="mt-5 whitespace-pre-line text-base leading-relaxed text-brand-dark/80 md:text-lg">
						{message.notes}
					</p>
				</section>
			{/if}

			{#if message.discussionGuide}
				<!--
					Why this is on the public page: the guide is written for group
					leaders, and until now it was stored per message and readable
					only inside the staff portal.
				-->
				<section
					class="mt-12 rounded-2xl border border-brand-primary/20 bg-white p-7 md:p-9"
					aria-labelledby="discussion-guide-title"
				>
					<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">For your group</p>
					<h2 id="discussion-guide-title" class="mt-3 font-sans text-2xl font-black text-brand-dark">
						Discussion guide
					</h2>
					<p class="mt-5 whitespace-pre-line text-base leading-relaxed text-brand-dark/80">
						{message.discussionGuide}
					</p>
					<a class="mt-7 inline-flex text-sm font-bold text-brand-primary hover:underline" href={resolve('/groups')}
						>Find a group to work through it with →</a
					>
				</section>
			{/if}

			<div class="mt-14 flex flex-wrap gap-4">
				{#if message.series}
					<a
						class="inline-flex min-h-12 items-center rounded-full bg-brand-primary px-8 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md transition hover:brightness-105"
						href={resolve('/messages/[slug]', { slug: message.series.slug })}>More in this series</a
					>
				{/if}
				<a
					class="inline-flex min-h-12 items-center rounded-full border border-brand-dark/15 bg-white px-8 text-xs font-bold uppercase tracking-[0.14em] text-brand-dark transition hover:border-brand-primary"
					href={resolve('/watch')}>All messages</a
				>
			</div>
		</div>
	</article>
</SiteShell>
