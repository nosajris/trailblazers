<script lang="ts">
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import { container } from '@trailblazers/ui/tb-layout';

	let { data } = $props();
	const p = data.post;

	const fmt = (d: Date) =>
		new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(d));
</script>

<svelte:head>
	<title>{p.title} — Trailblazers Stories</title>
	<meta name="description" content={p.summary} />
</svelte:head>

<SiteShell settings={data.settings}>
	<article class="bg-white pb-20 pt-8 md:pb-28 md:pt-12">
		<div class="{container} max-w-3xl">
			<a
				class="text-sm font-semibold text-brand-primary hover:underline"
				href="/stories">← All stories</a
			>
			<p class="mt-6 text-sm text-brand-dark/50">{fmt(p.createdAt)}</p>
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
			{:else}
				<p class="text-brand-dark/70">Full article content is being prepared.</p>
			{/if}
		</div>
	</article>
</SiteShell>
