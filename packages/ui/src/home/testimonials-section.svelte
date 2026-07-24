<script lang="ts">
	import type { HomeTestimonialsVm } from '@trailblazers/core';
	import { container, sectionY, eyebrowGoldOnDark } from '../tb-layout.js';

	let { data }: { data: HomeTestimonialsVm } = $props();
</script>

<section class="border-b border-white/10 bg-brand-dark text-gray-200 {sectionY}">
	<div class="{container}">
		<div class="mx-auto max-w-3xl text-center">
			<p class={eyebrowGoldOnDark}>Stories</p>
			<h2 class="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
				{data.title ?? 'What people are saying'}
			</h2>
		</div>
		<div
			class="mt-14 grid gap-6 md:grid-cols-2 md:gap-8 lg:mt-16 lg:gap-10 max-md:flex max-md:snap-x max-md:snap-mandatory max-md:gap-4 max-md:overflow-x-auto max-md:pb-2 max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden"
		>
			{#each data.items as t (t.id)}
				<figure
					class="max-md:min-w-[min(22rem,calc(100vw-2.5rem))] max-md:shrink-0 max-md:snap-center rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm md:min-w-0 md:snap-none"
				>
					<blockquote
						class="text-lg leading-relaxed text-white/95 md:text-xl md:leading-relaxed"
					>
						“{t.content}”
					</blockquote>
					<figcaption class="mt-6 border-l-2 border-brand-primary pl-4 text-sm font-semibold text-white">
						{t.name}
						{#if t.role}
							<span class="mt-1 block font-normal text-gray-400">{t.role}</span>
						{/if}
					</figcaption>
				</figure>
			{/each}
		</div>
	</div>
</section>
