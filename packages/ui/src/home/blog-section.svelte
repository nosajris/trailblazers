<script lang="ts">
	import type { HomeBlogVm } from '@trailblazers/core';
	import { container, sectionY, headline, eyebrow, railRow, railItem } from '../tb-layout.js';

	let { data }: { data: HomeBlogVm } = $props();
</script>

<section class="border-b border-neutral-200/80 bg-[#f3f2ef] {sectionY}">
	<div class="{container}">
		<div class="max-w-3xl">
			<p class={eyebrow}>Stories</p>
			<h2 class="mt-3 {headline}">
				{data.title ?? 'Stories & updates'}
			</h2>
		</div>

		<div class="mt-12 {railRow}">
			{#each data.posts as post (post.id)}
				<a
					href="/stories/{post.id}"
					class="{railItem} flex flex-col overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
				>
					{#if post.imageUrl}
						<div class="aspect-[16/10] overflow-hidden bg-neutral-100">
							<img
								src={post.imageUrl}
								alt=""
								class="h-full w-full object-cover"
								loading="lazy"
								sizes="(max-width: 768px) 85vw, 33vw"
							/>
						</div>
					{/if}
					<div class="flex flex-1 flex-col p-6 md:p-7">
						{#if post.category}
							<p class="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">
								{post.category}
							</p>
						{/if}
						<h3 class="mt-2 font-sans text-lg font-bold leading-snug text-brand-dark md:text-xl">
							{post.title}
						</h3>
						<p class="mt-3 flex-1 text-sm leading-relaxed text-brand-dark/65 line-clamp-4 md:text-[15px]">
							{post.summary}
						</p>
						<span class="mt-4 text-xs font-bold uppercase tracking-wide text-brand-primary">Read story →</span>
					</div>
				</a>
			{/each}
		</div>
		<div class="mt-10 text-center">
			<a
				class="inline-flex rounded-full border border-brand-dark/15 px-8 py-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
				href="/stories">All stories</a
			>
		</div>
	</div>
</section>
