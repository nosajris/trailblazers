<script lang="ts">
	import { resolve } from '$app/paths';
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import SeoMeta from '@trailblazers/ui/site/seo-meta.svelte';
	import { container, sectionY } from '@trailblazers/ui/tb-layout';
	import { responsiveSrcset } from '@trailblazers/ui/site/responsive-images';

	/**
	 * Series index.
	 *
	 * This page used to list four hardcoded series with invented names and
	 * subtitles, all linking to /watch. Series are a real table that staff
	 * manage; these are those, and only the ones that actually hold messages.
	 */
	let { data } = $props();

	const series = $derived(data.series);
	const latest = $derived(data.latest);
</script>

<SeoMeta
	title="Messages — Trailblazers"
	description="Current series and past messages — watch, listen, and share."
	image="/images/sermon2.jpg"
/>

<SiteShell settings={data.settings}>
	<section class="relative hero-fill flex flex-col justify-center overflow-hidden bg-brand-dark py-16 text-white md:py-24">
		<div class="absolute inset-0 opacity-25">
			<img
				src="/images/sermon2.jpg"
				alt=""
				class="h-full w-full object-cover object-top"
				sizes="100vw"
				fetchpriority="high"
				loading="eager"
				decoding="async"
			/>
		</div>
		<div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/90 to-brand-dark/50"></div>
		<div class="{container} relative max-w-4xl">
			<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Messages</p>
			<h1 class="mt-4 font-sans text-4xl font-black tracking-tight md:text-6xl">Teaching that travels with you</h1>
			<p class="mt-6 max-w-2xl text-lg text-gray-200">
				Catch up on a series, rewatch a talk that hit home, or send one to a friend who needs hope today.
			</p>
			<div class="mt-10 flex flex-wrap gap-4">
				{#if latest}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- internal path built from the message slug -->
					<a
						class="inline-flex min-h-12 items-center rounded-full bg-brand-primary px-10 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg transition hover:brightness-105"
						href={latest.watchHref}>Watch the latest</a
					>
				{/if}
				<a
					class="inline-flex min-h-12 items-center rounded-full border border-white/35 px-10 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white/10"
					href={resolve('/watch')}>All messages</a
				>
			</div>
		</div>
	</section>

	<section id="series" class="bg-brand-light {sectionY}" aria-labelledby="series-title">
		<div class={container}>
			<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Series</p>
			<h2 id="series-title" class="mt-3 font-sans text-2xl font-black text-brand-dark md:text-4xl">
				Browse by series
			</h2>

			{#if series.length === 0}
				<p class="mt-6 max-w-2xl text-brand-dark/75">
					Messages are published one at a time for now —
					<a class="font-semibold text-brand-primary hover:underline" href={resolve('/watch')}>watch the latest</a>.
				</p>
			{:else}
				<p class="mt-3 max-w-xl text-brand-dark/70">
					Each series is built to be heard in order, but you can start anywhere.
				</p>
				<div class="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{#each series as item (item.id)}
						<a
							href={resolve('/messages/[slug]', { slug: item.slug })}
							class="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
						>
							<div class="aspect-[4/3] overflow-hidden bg-brand-dark">
								<img
									src={item.coverImageUrl ?? '/images/sermon1.jpg'}
									srcset={responsiveSrcset(item.coverImageUrl)}
									alt=""
									class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
									loading="lazy"
									sizes="(max-width: 640px) 100vw, 25vw"
								/>
							</div>
							<div class="flex flex-1 flex-col p-5">
								<p class="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">
									{item.messageCount}
									{item.messageCount === 1 ? 'message' : 'messages'}
								</p>
								<h3 class="mt-1 font-sans text-lg font-bold text-brand-dark group-hover:text-brand-primary">
									{item.title}
								</h3>
								{#if item.description}
									<p class="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-brand-dark/65">
										{item.description}
									</p>
								{/if}
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</section>
</SiteShell>
