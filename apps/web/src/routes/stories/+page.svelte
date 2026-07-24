<script lang="ts">
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import { container, sectionY } from '@trailblazers/ui/tb-layout';

	let { data } = $props();

	const fmt = (d: Date) =>
		new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d));
</script>

<svelte:head>
	<title>Stories — Trailblazers</title>
	<meta name="description" content="Articles, recaps, and leadership insights from the Trailblazers community." />
</svelte:head>

<SiteShell settings={data.settings}>
	<section class="relative overflow-hidden bg-brand-dark py-16 text-white md:py-24">
		<div class="absolute inset-0 opacity-30">
			<img src="/images/slider01.jpeg" alt="" class="h-full w-full object-cover" sizes="100vw" />
		</div>
		<div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/85 to-brand-dark/40"></div>
		<div class="{container} relative max-w-4xl">
			<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Stories</p>
			<h1 class="mt-4 font-sans text-4xl font-black tracking-tight md:text-6xl">What God is doing here</h1>
			<p class="mt-6 max-w-2xl text-lg text-gray-200">
				Weekend recaps, leadership thoughts, and honest reflections — written for young adults on the move.
			</p>
		</div>
	</section>

	<section class="bg-brand-light {sectionY}">
		<div class="{container}">
			{#if data.posts.length === 0}
				<p class="text-center text-brand-dark/70">Stories are on the way. Check back soon.</p>
			{:else}
				<div class="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
					{#each data.posts as post (post.id)}
						<a
							href="/stories/{post.id}"
							class="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm ring-1 ring-black/[0.03] transition hover:-translate-y-1 hover:shadow-xl"
						>
							{#if post.imageUrl}
								<div class="aspect-[16/10] overflow-hidden bg-neutral-100">
									<img
										src={post.imageUrl}
										alt=""
										class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
										loading="lazy"
										sizes="(max-width: 768px) 100vw, 33vw"
									/>
								</div>
							{/if}
							<div class="flex flex-1 flex-col p-6 md:p-7">
								<p class="text-xs text-brand-dark/50">{fmt(post.createdAt)}</p>
								{#if post.category}
									<p class="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">
										{post.category}
									</p>
								{/if}
								<h2 class="mt-2 font-sans text-xl font-bold leading-snug text-brand-dark group-hover:text-brand-primary md:text-2xl">
									{post.title}
								</h2>
								<p class="mt-3 flex-1 text-sm leading-relaxed text-brand-dark/70 line-clamp-4">{post.summary}</p>
								<span class="mt-5 text-xs font-bold uppercase tracking-wide text-brand-primary">Read more →</span>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</section>
</SiteShell>
