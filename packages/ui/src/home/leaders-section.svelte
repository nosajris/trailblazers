<script lang="ts">
	import type { HomeLeadersVm } from '@trailblazers/core';
	import { container, sectionY, headline, eyebrow } from '../tb-layout.js';
	import { responsiveSrcset } from '../site/responsive-images.js';

	let { data }: { data: HomeLeadersVm } = $props();
</script>

<section class="border-b border-neutral-200/80 bg-zinc-100 {sectionY}">
	<div class="{container}">
		<div class="max-w-3xl">
			<p class={eyebrow}>Leadership</p>
			<h2 class="mt-3 {headline}">
				{data.title ?? 'Leadership'}
			</h2>
		</div>
		<!-- Two across on phones: ten leaders in one column was a screen-and-a-half of scrolling per person. -->
		<div class="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-8 lg:grid-cols-3 lg:gap-12">
			{#each data.leaders as leader (leader.id)}
				<div
					class="flex flex-col items-center text-center sm:items-stretch md:text-left lg:items-center lg:text-center"
				>
					{#if leader.imageUrl}
						<div class="relative w-28 overflow-hidden rounded-full shadow-lg ring-4 ring-white sm:w-44">
							<img
								src={leader.imageUrl} srcset={responsiveSrcset(leader.imageUrl)} sizes="(max-width: 640px) 112px, 176px"
								alt=""
								class="aspect-square w-full object-cover"
								loading="lazy"
							/>
						</div>
					{:else}
						<div class="h-28 w-28 rounded-full bg-neutral-300 sm:h-44 sm:w-44"></div>
					{/if}
					<h3 class="mt-4 font-sans text-base font-bold text-brand-dark sm:mt-5 md:text-xl">{leader.name}</h3>
					<p class="mt-1 text-xs font-semibold text-brand-primary sm:text-sm">{leader.role}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
