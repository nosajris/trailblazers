<script lang="ts">
	import { resolve } from '$app/paths';
	import { container, eyebrow, headline } from '../tb-layout.js';

	type Tile = { title: string; line: string; href: string; icon: 'star' | 'users' | 'heart' | 'play' };

	const tiles: Tile[] = [
		{ title: "I'm new", line: 'See what a first visit looks like.', href: resolve('/plan-a-visit'), icon: 'star' },
		{ title: 'Join a group', line: 'Campus, creatives, professionals.', href: resolve('/groups'), icon: 'users' },
		{ title: 'Serve', line: 'Find a team and build with us.', href: resolve('/serve'), icon: 'heart' },
		{ title: 'Watch', line: 'Messages and live, from anywhere.', href: resolve('/watch'), icon: 'play' }
	];
</script>

<section class="bg-brand-light py-12 md:py-16" aria-labelledby="intent-tiles-title">
	<div class={container}>
		<div class="max-w-2xl">
			<p class={eyebrow}>Start here</p>
			<h2 id="intent-tiles-title" class="mt-3 {headline}">Find your place</h2>
		</div>

		<ul class="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
			{#each tiles as tile (tile.title)}
				<li>
					<a
						href={tile.href}
						class="group flex h-full min-h-[10rem] flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-primary hover:shadow-md md:p-6"
					>
						<span
							class="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary"
							aria-hidden="true"
						>
							<svg class="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
								{#if tile.icon === 'star'}
									<path d="M12 3l2.5 6 6.5.5-5 4.3 1.6 6.4L12 16.8 6.4 20.2 8 13.8 3 9.5l6.5-.5z" />
								{:else if tile.icon === 'users'}
									<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
									<circle cx="9" cy="7" r="4" />
									<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
									<path d="M16 3.13a4 4 0 0 1 0 7.75" />
								{:else if tile.icon === 'heart'}
									<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
								{:else}
									<circle cx="12" cy="12" r="10" />
									<path d="M10 8l6 4-6 4z" />
								{/if}
							</svg>
						</span>
						<span class="mt-4 font-sans text-lg font-bold text-brand-dark">{tile.title}</span>
						<span class="mt-1 flex-1 text-sm leading-relaxed text-brand-dark/70">{tile.line}</span>
						<span
							class="mt-4 text-sm font-bold text-brand-primary transition group-hover:translate-x-0.5"
							aria-hidden="true">→</span
						>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>
