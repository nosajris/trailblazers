<script lang="ts">
	import SeoMeta from '@trailblazers/ui/site/seo-meta.svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import { whatsappShareUrl } from '@trailblazers/ui/site/share';
	import { container } from '@trailblazers/ui/tb-layout';

	let { data } = $props();

	// Reused across [id] changes, so this has to stay reactive.
	const p = $derived(data.post);

	const fmt = (d: Date) =>
		new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(d));

	/** Rough but honest: 200 words a minute, rounded up, minimum one. */
	const readingMinutes = $derived(
		Math.max(1, Math.ceil(`${p.summary ?? ''} ${p.content ?? ''}`.trim().split(/\s+/).length / 200))
	);

	const shareHref = $derived(whatsappShareUrl(`${p.title}\n${page.url.href}`));

	const articleJsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: p.title,
		description: p.summary,
		datePublished: new Date(p.createdAt).toISOString(),
		...(p.imageUrl ? { image: p.imageUrl } : {}),
		author: { '@type': 'Organization', name: 'PAOZ Trailblazers' },
		publisher: { '@type': 'Organization', name: 'PAOZ Trailblazers' }
	});
</script>

<SeoMeta
	title={`${p.title} — Trailblazers Stories`}
	description={p.summary}
	image={p.imageUrl ?? '/images/slider01.jpeg'}
	type="article"
	publishedTime={new Date(p.createdAt).toISOString()}
	jsonLd={articleJsonLd}
/>

<SiteShell settings={data.settings}>
	<article class="bg-white pb-20 pt-8 md:pb-28 md:pt-12">
		<div class="{container} max-w-3xl">
			<a
				class="text-sm font-semibold text-brand-primary hover:underline"
				href={resolve('/stories')}>← All stories</a
			>
			<p class="mt-6 text-sm text-brand-dark/70">
				{fmt(p.createdAt)}<span aria-hidden="true"> · </span>{readingMinutes} min read
			</p>
			{#if p.category}
				<p class="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary">{p.category}</p>
			{/if}
			<h1 class="mt-4 font-sans text-3xl font-black leading-tight text-brand-dark md:text-5xl">{p.title}</h1>
			<p class="mt-6 text-lg leading-relaxed text-brand-dark/75">{p.summary}</p>
		</div>

		{#if p.imageUrl}
			<div class="mx-auto mt-12 max-w-5xl px-4 sm:px-6">
				<div class="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/[0.06]">
					<img
						src={p.imageUrl}
						alt=""
						class="aspect-[21/9] w-full object-cover md:aspect-[2.4/1]"
						sizes="(max-width: 1024px) 100vw, 80vw"
					/>
				</div>
			</div>
		{/if}

		<div class="{container} prose prose-lg mt-12 max-w-3xl text-brand-dark prose-headings:font-sans prose-headings:font-bold prose-a:text-brand-primary">
			{#if p.content}
				<p class="whitespace-pre-line text-lg leading-relaxed text-brand-dark/90">{p.content}</p>
			{/if}
		</div>

		<div class="{container} mt-12 max-w-3xl border-t border-neutral-200/80 pt-6">
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external wa.me share link -->
			<a
				class="text-sm font-semibold text-brand-primary hover:underline"
				href={shareHref}
				target="_blank"
				rel="noopener noreferrer">Share this on WhatsApp</a
			>
		</div>

		{#if data.more.length > 0}
			<section class="{container} mt-16 max-w-5xl" aria-labelledby="more-stories-title">
				<h2 id="more-stories-title" class="font-sans text-xl font-bold text-brand-dark">Read next</h2>
				<ul class="mt-6 grid gap-6 md:grid-cols-3">
					{#each data.more as item (item.id)}
						<li>
							<a
								class="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-brand-light/60 p-5 transition hover:-translate-y-0.5 hover:border-brand-primary hover:shadow-md"
								href={resolve('/stories/[id]', { id: String(item.id) })}
							>
								{#if item.category}
									<span class="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary"
										>{item.category}</span
									>
								{/if}
								<span class="mt-2 font-sans text-base font-bold leading-snug text-brand-dark group-hover:text-brand-primary"
									>{item.title}</span
								>
								{#if item.summary}
									<span class="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-brand-dark/70"
										>{item.summary}</span
									>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	</article>
</SiteShell>
