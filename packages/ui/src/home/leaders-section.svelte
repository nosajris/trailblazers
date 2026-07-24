<script lang="ts">
	import type { HomeLeadersVm } from '@trailblazers/core';
	import { container, sectionY, headline, eyebrow } from '../tb-layout.js';

	let { data }: { data: HomeLeadersVm } = $props();
</script>

<section class="border-b border-neutral-200/80 bg-[#f3f2ef] {sectionY}">
	<div class="{container}">
		<div class="max-w-3xl">
			<p class={eyebrow}>Leadership</p>
			<h2 class="mt-3 {headline}">
				{data.title ?? 'Leadership'}
			</h2>
		</div>
		<div class="mt-12 grid gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-12">
			{#each data.leaders as leader (leader.id)}
				<div
					class="flex flex-col items-center text-center sm:items-stretch md:text-left lg:items-center lg:text-center"
				>
					{#if leader.imageUrl}
						<div class="relative w-40 overflow-hidden rounded-full shadow-lg ring-4 ring-white sm:w-44">
							<img
								src={leader.imageUrl}
								alt=""
								class="aspect-square w-full object-cover"
								loading="lazy"
							/>
						</div>
					{:else}
						<div class="h-40 w-40 rounded-full bg-neutral-300 sm:h-44 sm:w-44"></div>
					{/if}
					<h3 class="mt-5 font-sans text-lg font-bold text-brand-dark md:text-xl">{leader.name}</h3>
					<p class="mt-1 text-sm font-semibold text-brand-primary">{leader.role}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
