<script lang="ts">
	import { resolve } from '$app/paths';
	import { container, eyebrow, headline, sectionY } from '../tb-layout.js';

	/**
	 * The last thing on the page is a decision, not another scroll.
	 *
	 * Three steps past attending: serve on a team, lead a group, or give. The
	 * giving link follows site settings so a church using an external platform
	 * does not send people to an empty page.
	 */
	let { givingUrl = '' }: { givingUrl?: string } = $props();

	const giveIsExternal = $derived(/^https?:\/\//i.test(givingUrl.trim()));
</script>

<section class="border-t border-brand-dark/[0.06] bg-brand-light {sectionY}" aria-labelledby="get-involved-title">
	<div class={container}>
		<div class="max-w-2xl">
			<p class={eyebrow}>Go further</p>
			<h2 id="get-involved-title" class="mt-3 {headline}">Build this with us</h2>
		</div>

		<div class="mt-8 grid gap-4 md:grid-cols-3 lg:gap-6">
			<a
				class="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-7 transition hover:-translate-y-0.5 hover:border-brand-primary hover:shadow-md"
				href={resolve('/serve')}
			>
				<h3 class="font-sans text-xl font-bold text-brand-dark">Serve on a team</h3>
				<p class="mt-3 flex-1 text-sm leading-relaxed text-brand-dark/70">
					Media, worship, hosting, logistics — there is a place for what you are good at.
				</p>
				<span class="mt-6 text-sm font-bold text-brand-primary transition group-hover:translate-x-0.5">Find a team →</span>
			</a>

			<a
				class="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-7 transition hover:-translate-y-0.5 hover:border-brand-primary hover:shadow-md"
				href={resolve('/groups')}
			>
				<h3 class="font-sans text-xl font-bold text-brand-dark">Lead a group</h3>
				<p class="mt-3 flex-1 text-sm leading-relaxed text-brand-dark/70">
					You do not need to be an expert. You need a room, a night, and a few people.
				</p>
				<span class="mt-6 text-sm font-bold text-brand-primary transition group-hover:translate-x-0.5">See the groups →</span>
			</a>

			{#if giveIsExternal}
				<!-- eslint-disable svelte/no-navigation-without-resolve -- external giving platform from site settings -->
				<a
					class="group flex flex-col rounded-2xl border border-brand-dark/10 bg-brand-dark p-7 text-white transition hover:-translate-y-0.5 hover:shadow-lg"
					href={givingUrl}
					target="_blank"
					rel="noopener noreferrer"
				>
					<h3 class="font-sans text-xl font-bold">Give</h3>
					<p class="mt-3 flex-1 text-sm leading-relaxed text-white/75">
						Generosity pays for the camps, the rooms and the people who make them happen.
					</p>
					<span class="mt-6 text-sm font-bold text-brand-gold transition group-hover:translate-x-0.5">Ways to give →</span>
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			{:else}
				<a
					class="group flex flex-col rounded-2xl border border-brand-dark/10 bg-brand-dark p-7 text-white transition hover:-translate-y-0.5 hover:shadow-lg"
					href={resolve('/give')}
				>
					<h3 class="font-sans text-xl font-bold">Give</h3>
					<p class="mt-3 flex-1 text-sm leading-relaxed text-white/75">
						Generosity pays for the camps, the rooms and the people who make them happen.
					</p>
					<span class="mt-6 text-sm font-bold text-brand-gold transition group-hover:translate-x-0.5">Ways to give →</span>
				</a>
			{/if}
		</div>
	</div>
</section>
