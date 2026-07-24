<script lang="ts">
	import type { HomeGroupsVm } from '@trailblazers/core';
	import { container, sectionY, headline, eyebrow, railRow, railItem } from '../tb-layout.js';

	let { data }: { data: HomeGroupsVm } = $props();
</script>

<section class="border-b border-neutral-200/80 bg-white {sectionY}">
	<div class="{container}">
		<div class="max-w-3xl">
			<p class={eyebrow}>Community</p>
			<h2 class="mt-3 {headline}">
				{data.title ?? 'Connect in community'}
			</h2>
			<p class="mt-3 max-w-2xl text-base leading-relaxed text-brand-dark/70 md:text-lg">
				Find a group that fits your season — campus, creatives, and more.
			</p>
		</div>

		<div class="mt-12 {railRow}">
			{#each data.groups as g (g.id)}
				<a
					href="/groups#group-{g.id}"
					class="{railItem} flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-brand-light p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:p-7"
				>
					{#if g.imageUrl}
						<div class="aspect-[16/10] overflow-hidden rounded-xl bg-neutral-200">
							<img
								src={g.imageUrl}
								alt=""
								class="h-full w-full object-cover"
								loading="lazy"
								sizes="(max-width: 768px) 85vw, 33vw"
							/>
						</div>
					{/if}
					<p class="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">{g.type}</p>
					<h3 class="mt-2 font-sans text-lg font-bold text-brand-dark md:text-xl">{g.name}</h3>
					<p class="mt-2 text-sm font-medium text-brand-dark/70">{g.dayTime} · Led by {g.leader}</p>
					{#if g.description}
						<p class="mt-3 text-sm leading-relaxed text-brand-dark/65 line-clamp-4">{g.description}</p>
					{/if}
					<span class="mt-4 text-xs font-bold uppercase tracking-wide text-brand-primary">View on groups →</span>
				</a>
			{/each}
		</div>
		<div class="mt-10 text-center">
			<a
				class="inline-flex rounded-full bg-brand-primary px-8 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md transition hover:brightness-105"
				href="/groups">Find a group</a
			>
		</div>
	</div>
</section>
