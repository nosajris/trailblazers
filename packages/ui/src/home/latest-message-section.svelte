<script lang="ts">
	import { resolve } from '$app/paths';
	import type { SermonCardVm } from '@trailblazers/core';
	import { container, eyebrow, headline } from '../tb-layout.js';
	import { responsiveSrcset } from '../site/responsive-images.js';

	/**
	 * The newest message, directly under the hero.
	 *
	 * A returning member's first question is "what did I miss?", and the answer
	 * was three clicks away behind the Watch menu. Renders nothing when no
	 * message is published.
	 */
	let { sermon, watchHref = '/watch' }: { sermon: SermonCardVm | null; watchHref?: string } = $props();

	const isExternal = $derived(/^https?:\/\//i.test(watchHref));

	const published = $derived(
		sermon?.publishedAt
			? new Intl.DateTimeFormat('en-GB', {
					day: 'numeric',
					month: 'long',
					year: 'numeric',
					timeZone: 'Africa/Harare'
				}).format(new Date(sermon.publishedAt))
			: null
	);

	const poster = $derived(sermon?.thumbnailUrl ?? '/images/sermon1.jpg');
</script>

{#if sermon}
	<section class="bg-brand-light pb-12 pt-12 md:pb-16 md:pt-16" aria-labelledby="latest-message-title">
		<div class={container}>
			<div
				class="grid gap-8 overflow-hidden rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04] md:grid-cols-5 md:gap-10 md:p-6 lg:items-center"
			>
				<div class="relative overflow-hidden rounded-2xl bg-brand-dark md:col-span-3">
					<img
						src={poster}
						srcset={responsiveSrcset(poster)}
						alt=""
						class="aspect-video w-full object-cover opacity-90"
						loading="lazy"
						decoding="async"
						sizes="(max-width: 768px) 100vw, 55vw"
					/>
					<span
						class="pointer-events-none absolute inset-0 flex items-center justify-center"
						aria-hidden="true"
					>
						<span
							class="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-brand-primary shadow-lg backdrop-blur"
						>
							<svg class="ml-1 h-7 w-7 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
						</span>
					</span>
					{#if sermon.isLiveNow}
						<span
							class="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-brand-primary px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white"
						>
							<span class="h-2 w-2 rounded-full bg-white"></span>
							Live now
						</span>
					{/if}
				</div>

				<div class="md:col-span-2">
					<p class={eyebrow}>{sermon.isLiveNow ? 'On air' : 'Latest message'}</p>
					<h2 id="latest-message-title" class="mt-3 {headline}">{sermon.title}</h2>
					<p class="mt-3 text-sm font-semibold text-brand-dark/70">
						{sermon.speaker}{#if published}<span class="text-brand-dark/40"> · </span>{published}{/if}
					</p>
					{#if sermon.summary}
						<p class="mt-4 line-clamp-4 text-base leading-relaxed text-brand-dark/75">{sermon.summary}</p>
					{/if}
					<div class="mt-7 flex flex-wrap items-center gap-3">
						<!-- eslint-disable svelte/no-navigation-without-resolve -- watch URL comes from site settings and may be an absolute external address, which resolve() cannot take -->
						<a
							class="inline-flex min-h-12 items-center rounded-full bg-brand-primary px-8 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md transition hover:brightness-105"
							href={watchHref}
							target={isExternal ? '_blank' : undefined}
							rel={isExternal ? 'noopener noreferrer' : undefined}>Watch now</a
						>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
						<a
							class="inline-flex min-h-12 items-center text-sm font-bold text-brand-primary hover:underline"
							href={resolve('/messages')}>All messages →</a
						>
					</div>
				</div>
			</div>
		</div>
	</section>
{/if}
