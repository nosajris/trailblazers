<script lang="ts">
	import SeoMeta from '@trailblazers/ui/site/seo-meta.svelte';
	import { resolve } from '$app/paths';
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import { container, sectionY } from '@trailblazers/ui/tb-layout';
	import { whatsappChatUrl } from '@trailblazers/ui/site/share';

	let { data } = $props();

	const extras = $derived(data.settings.siteExtras);
	const methods = $derived(extras.givingMethods ?? []);
	const note = $derived(extras.givingNote);
	const chatHref = $derived(
		whatsappChatUrl(extras.whatsappNumber, 'Hello! I have a question about giving.')
	);
</script>

<SeoMeta
	title="Give — Trailblazers"
	description="Ways to give to Trailblazers, and what your giving pays for."
	image="/images/wallpaper06.jpg"
/>

<SiteShell settings={data.settings}>
	<section class="bg-brand-light py-16 md:py-24">
		<div class="{container} max-w-3xl">
			<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Give</p>
			<h1 class="mt-4 font-sans text-3xl font-black tracking-tight text-brand-dark md:text-5xl">
				Generosity fuels the mission
			</h1>
			<p class="mt-6 text-lg leading-relaxed text-brand-dark/75">
				{note ??
					'Giving pays for the camps, the rooms, the equipment and the people who make them happen — week in, week out.'}
			</p>
		</div>
	</section>

	{#if methods.length > 0}
		<section class="bg-brand-light pb-16 md:pb-20" aria-labelledby="ways-to-give-title">
			<div class="{container} max-w-3xl">
				<h2 id="ways-to-give-title" class="font-sans text-2xl font-black text-brand-dark md:text-3xl">
					Ways to give
				</h2>
				<ul class="mt-8 space-y-4">
					{#each methods as method, i (i)}
						<li class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
							<h3 class="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-primary">
								{method.label}
							</h3>
							<p class="mt-3 select-all break-words font-mono text-base font-semibold text-brand-dark md:text-lg">
								{method.detail}
							</p>
							{#if method.note}
								<p class="mt-2 text-sm leading-relaxed text-brand-dark/70">{method.note}</p>
							{/if}
						</li>
					{/each}
				</ul>
				<p class="mt-6 text-sm text-brand-dark/70">
					Giving in person on a Sunday works too — ask any host where to go.
				</p>
			</div>
		</section>
	{:else}
		<section class="bg-brand-light pb-16 md:pb-20">
			<div class="{container} max-w-3xl">
				<div class="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
					<h2 class="font-sans text-xl font-bold text-brand-dark">How to give today</h2>
					<p class="mt-3 leading-relaxed text-brand-dark/75">
						Give in person on a Sunday, or ask the team and we will walk you through it.
					</p>
					<div class="mt-7 flex flex-wrap gap-3">
						<a
							class="inline-flex min-h-12 items-center rounded-full bg-brand-primary px-8 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md transition hover:brightness-105"
							href={resolve('/contact')}>Ask the team</a
						>
						{#if chatHref}
							<!-- eslint-disable svelte/no-navigation-without-resolve -- external wa.me link built from the settings number -->
							<a
								class="inline-flex min-h-12 items-center rounded-full border border-brand-dark/15 bg-white px-8 text-xs font-bold uppercase tracking-[0.14em] text-brand-dark transition hover:border-brand-primary"
								href={chatHref}
								target="_blank"
								rel="noopener noreferrer">Ask on WhatsApp</a
							>
							<!-- eslint-enable svelte/no-navigation-without-resolve -->
						{/if}
					</div>
				</div>
			</div>
		</section>
	{/if}

	<section class="border-t border-brand-dark/[0.06] bg-white {sectionY}">
		<div class="{container} grid max-w-5xl gap-8 md:grid-cols-3">
			<div>
				<h2 class="font-sans text-lg font-bold text-brand-dark">Where it goes</h2>
				<p class="mt-3 text-sm leading-relaxed text-brand-dark/70">
					Camps and events, campus ministry, equipment, and the day-to-day cost of keeping the doors open.
				</p>
			</div>
			<div>
				<h2 class="font-sans text-lg font-bold text-brand-dark">Questions welcome</h2>
				<p class="mt-3 text-sm leading-relaxed text-brand-dark/70">
					If you want to know how a figure is spent, ask. We would rather answer than have you wonder.
				</p>
				<a class="mt-3 inline-flex text-sm font-bold text-brand-primary hover:underline" href={resolve('/contact')}
					>Contact the team →</a
				>
			</div>
			<div>
				<h2 class="font-sans text-lg font-bold text-brand-dark">Other ways to help</h2>
				<p class="mt-3 text-sm leading-relaxed text-brand-dark/70">
					Time counts too. Teams need hands long before they need money.
				</p>
				<a class="mt-3 inline-flex text-sm font-bold text-brand-primary hover:underline" href={resolve('/serve')}
					>Serve with us →</a
				>
			</div>
		</div>
	</section>
</SiteShell>
