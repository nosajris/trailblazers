<script lang="ts">
	import { resolve } from '$app/paths';
	import type { CampusDetail } from '@trailblazers/core';
	import { container, eyebrow, headline } from '../tb-layout.js';

	/**
	 * Where and how to join: one card per campus, plus watching online.
	 *
	 * Only rendered when campuses are configured — with none, this would just
	 * repeat the "Find your place" tiles above it.
	 */
	let {
		campuses = [],
		watchHref = '/watch'
	}: { campuses?: CampusDetail[]; watchHref?: string } = $props();

	const watchIsExternal = $derived(/^https?:\/\//i.test(watchHref));
</script>

{#if campuses.length > 0}
	<section class="bg-brand-light py-12 md:py-16" aria-labelledby="ways-to-attend-title">
		<div class={container}>
			<div class="max-w-2xl">
				<p class={eyebrow}>Join us</p>
				<h2 id="ways-to-attend-title" class="mt-3 {headline}">In person or online</h2>
			</div>

			<ul class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
				{#each campuses as campus (campus.id)}
					<li>
						<a
							class="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-brand-primary hover:shadow-md"
							href={resolve('/campus/[id]', { id: campus.id })}
						>
							<p class="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">In person</p>
							<h3 class="mt-2 font-sans text-lg font-bold text-brand-dark">{campus.label}</h3>
							{#if campus.times && campus.times.length > 0}
								<ul class="mt-3 space-y-1 text-sm font-semibold text-brand-dark/80">
									{#each campus.times.slice(0, 3) as time, i (i)}
										<li>{time}</li>
									{/each}
								</ul>
							{/if}
							{#if campus.address}
								<p class="mt-3 flex-1 text-sm leading-relaxed text-brand-dark/70">{campus.address}</p>
							{:else}
								<span class="flex-1"></span>
							{/if}
							<span class="mt-5 text-sm font-bold text-brand-primary transition group-hover:translate-x-0.5"
								>Campus details →</span
							>
						</a>
					</li>
				{/each}

				<li>
					<div class="flex h-full flex-col rounded-2xl border border-neutral-200 bg-brand-dark p-6 text-white">
						<p class="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">From anywhere</p>
						<h3 class="mt-2 font-sans text-lg font-bold">Watch online</h3>
						<p class="mt-3 flex-1 text-sm leading-relaxed text-white/75">
							Join the live stream, or catch the message later in the week.
						</p>
						<!-- eslint-disable svelte/no-navigation-without-resolve -- watch URL comes from site settings and may be an absolute external address, which resolve() cannot take -->
						<a
							class="mt-5 inline-flex min-h-11 items-center self-start rounded-full bg-white px-6 text-xs font-bold uppercase tracking-[0.12em] text-brand-dark transition hover:bg-brand-gold"
							href={watchHref}
							target={watchIsExternal ? '_blank' : undefined}
							rel={watchIsExternal ? 'noopener noreferrer' : undefined}>Watch</a
						>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					</div>
				</li>
			</ul>
		</div>
	</section>
{/if}
