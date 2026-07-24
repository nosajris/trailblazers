<script lang="ts">
	import type { HomeEventsRailVm } from '@trailblazers/core';
	import { container, sectionY, headline, eyebrow, railRow, railItem } from '../tb-layout.js';

	let { data }: { data: HomeEventsRailVm } = $props();

	const formatDate = (d: Date) =>
		new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(
			new Date(d)
		);
</script>

<section class="border-b border-neutral-200/80 bg-white {sectionY}">
	<div class="{container}">
		<div class="flex flex-col justify-between gap-6 md:flex-row md:items-end">
			<div class="max-w-3xl">
				<p class={eyebrow}>Events</p>
				<h2 class="mt-3 {headline}">
					{data.title ?? 'Upcoming events'}
				</h2>
				<p class="mt-3 max-w-2xl text-base leading-relaxed text-brand-dark/70 md:text-lg">
					Join us for camps, nights, and workshops.
				</p>
			</div>
			<a
				class="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-brand-primary transition hover:gap-3"
				href="/events"
			>
				View all events
				<span aria-hidden="true">→</span>
			</a>
		</div>

		<div class="mt-12 {railRow}">
			{#each data.events as event (event.id)}
				<a
					href="/events/{event.id}"
					class="{railItem} card group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-brand-light shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
				>
					<div class="relative aspect-[16/10] overflow-hidden bg-neutral-200">
						{#if event.imageUrl}
							<img
								src={event.imageUrl}
								alt=""
								class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
								loading="lazy"
							/>
						{/if}
						<span
							class="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-dark shadow-sm"
							>{event.type}</span
						>
					</div>
					<div class="flex flex-1 flex-col p-5 md:p-6">
						<p class="text-xs font-bold uppercase tracking-wide text-brand-primary">{formatDate(event.date)}</p>
						<h3 class="mt-2 font-sans text-lg font-bold leading-snug text-brand-dark md:text-xl line-clamp-2">
							{event.title}
						</h3>
						<p class="mt-2 flex-1 text-sm leading-relaxed text-brand-dark/65 line-clamp-2 md:text-[15px]">
							{event.description}
						</p>
						<span
							class="mt-4 text-sm font-bold text-brand-primary transition group-hover:translate-x-0.5"
							>Details →</span
						>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>
