<script lang="ts">
	import type { RichSectionVm } from '@trailblazers/core';
	import { container, sectionY, headline, eyebrow as eyebrowClass } from '../tb-layout.js';

	let {
		data,
		eyebrow: eyebrowLabel
	}: {
		data: RichSectionVm | null;
		eyebrow?: string;
	} = $props();
</script>

{#if data}
	<section class="border-b border-neutral-200/80 bg-[#f3f2ef] {sectionY}">
		<div class="{container}">
			<div
				class="grid items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-24"
			>
				<div class="order-2 lg:order-1">
					{#if eyebrowLabel}
						<p class={eyebrowClass}>{eyebrowLabel}</p>
					{/if}
					<h2 class="mt-3 {headline}">{data.headline}</h2>
					{#if data.subheadline}
						<p class="mt-4 text-lg font-medium text-brand-dark/75 md:text-xl">{data.subheadline}</p>
					{/if}
					{#if data.body}
						<p class="mt-5 max-w-xl text-base leading-relaxed text-brand-dark/70 md:text-lg">
							{data.body}
						</p>
					{/if}
					{#if data.ctaLabel && data.ctaHref}
						<a
							class="mt-8 inline-flex min-h-[3rem] items-center justify-center rounded-full bg-brand-primary px-10 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md transition hover:brightness-110"
							href={data.ctaHref}>{data.ctaLabel}</a
						>
					{/if}
				</div>
				<div class="order-1 lg:order-2">
					{#if data.imageUrl}
						<div class="overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
							<img src={data.imageUrl} alt="" class="aspect-[4/3] w-full object-cover md:aspect-[5/4]" loading="lazy" />
						</div>
					{:else}
						<div
							class="aspect-[4/3] w-full rounded-3xl bg-gradient-to-br from-brand-secondary/50 to-brand-primary/40 md:aspect-[5/4]"
						></div>
					{/if}
				</div>
			</div>
		</div>
	</section>
{/if}
