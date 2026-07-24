<script lang="ts">
	import type { HomeFaqVm } from '@trailblazers/core';
	import { container, sectionY, headline, eyebrow } from '../tb-layout.js';

	let { data }: { data: HomeFaqVm } = $props();
</script>

<section class="border-b border-neutral-200/80 bg-white {sectionY}">
	<div class="{container}">
		<div class="mx-auto max-w-3xl lg:mx-0">
			<p class={eyebrow}>FAQ</p>
			<h2 class="mt-3 {headline}">
				{data.title ?? 'Questions'}
			</h2>
		</div>
		<div class="mx-auto mt-10 max-w-3xl space-y-3 lg:mx-0">
			{#each data.items as item (item.id)}
				<details
					id={`faq-${item.id}`}
					name="faq"
					class="group rounded-2xl border border-neutral-200/90 bg-[#fafaf8] px-5 py-1 transition hover:border-brand-primary/25"
				>
					<summary
						class="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-sans text-base font-semibold text-brand-dark md:text-lg [&::-webkit-details-marker]:hidden"
						aria-controls={`faq-panel-${item.id}`}
					>
						<span>{item.question}</span>
						<span
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-brand-primary transition group-open:rotate-180"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</span>
					</summary>
					<div
						id={`faq-panel-${item.id}`}
						class="border-t border-neutral-200/80 pb-5 pt-4 text-sm leading-relaxed text-brand-dark/75 md:text-base"
						role="region"
					>
						{item.answer}
					</div>
				</details>
			{/each}
		</div>
	</div>
</section>
