<script lang="ts">
	import SeoMeta from '@trailblazers/ui/site/seo-meta.svelte';
	import { resolve } from '$app/paths';
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import { container, sectionY } from '@trailblazers/ui/tb-layout';
	import { responsiveSrcset } from '@trailblazers/ui/site/responsive-images';
	import { filterGroups, groupTypesPresent, GROUP_TYPE_LABELS } from '@trailblazers/ui/site/group-filter';

	let { data, form } = $props();

	/**
	 * Which group's join form is expanded.
	 *
	 * The form is inline per card rather than a separate page, so someone can
	 * act on the group they are reading about without losing their place.
	 */
	let openGroupId = $state<number | null>(null);

	let typeFilter = $state('ALL');
	let query = $state('');
	const types = $derived(groupTypesPresent(data.groups));
	const visible = $derived(filterGroups(data.groups, typeFilter, query));
	// A card the visitor is acting on (open form or just-submitted) is never filtered out from under them.
	const shown = $derived(
		visible.length === data.groups.length || openGroupId === null
			? visible
			: [...visible, ...data.groups.filter((x) => x.id === openGroupId && !visible.includes(x))]
	);
	const chip = (active: boolean) =>
		`min-h-11 rounded-full border px-4 text-xs font-bold uppercase tracking-wide transition ${
			active
				? 'border-brand-primary bg-brand-primary text-white'
				: 'border-brand-dark/15 bg-white text-brand-dark hover:border-brand-primary'
		}`;
</script>

<SeoMeta
	title="Groups — Trailblazers"
	description="Find a Trailblazers group — campus circles, creatives, and professionals meeting weekly."
	image="/images/wallpaper04.jpg"
/>

<SiteShell settings={data.settings}>
	<section class="relative hero-fill flex flex-col justify-center overflow-hidden bg-brand-dark py-20 text-white md:py-28">
		<div class="absolute inset-0">
			<img
				src="/images/wallpaper04.jpg"
				alt=""
				class="h-full w-full object-cover opacity-35"
				sizes="100vw"
				fetchpriority="high"
				loading="eager"
				decoding="async"
			/>
			<div class="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/90 to-brand-dark/70"></div>
		</div>
		<div class="{container} relative max-w-4xl">
			<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Community</p>
			<h1 class="mt-4 font-sans text-4xl font-black tracking-tight md:text-6xl">Life is better connected</h1>
			<p class="mt-6 max-w-2xl text-lg leading-relaxed text-gray-200">
				Groups are where friends become family — honest conversation, shared meals, and faith that fits real life.
			</p>
			<a
				class="mt-10 inline-flex rounded-full bg-brand-primary px-10 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg transition hover:brightness-105"
				href={resolve('/contact')}
			>
				Find my group
			</a>
		</div>
	</section>

	<section class="border-b border-neutral-200/80 bg-white {sectionY}">
		<div class="{container}">
			<div class="mx-auto max-w-3xl text-center">
				<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">How it works</p>
				<h2 class="mt-3 font-sans text-2xl font-black text-brand-dark md:text-4xl">Three rhythms, one table</h2>
				<p class="mt-4 text-brand-dark/75 md:text-lg">
					We gather in smaller circles during the week so Sunday feels like a reunion — not a first date.
				</p>
			</div>
			<div class="mt-14 grid gap-8 md:grid-cols-3">
				<div class="rounded-2xl border border-neutral-200/90 bg-brand-light/60 p-8 text-center">
					<p class="text-sm font-black text-brand-primary">01</p>
					<h3 class="mt-2 font-sans text-lg font-bold text-brand-dark">Show up</h3>
					<p class="mt-3 text-sm text-brand-dark/70">Same night, same people — consistency builds trust.</p>
				</div>
				<div class="rounded-2xl border border-neutral-200/90 bg-brand-light/60 p-8 text-center">
					<p class="text-sm font-black text-brand-primary">02</p>
					<h3 class="mt-2 font-sans text-lg font-bold text-brand-dark">Open up</h3>
					<p class="mt-3 text-sm text-brand-dark/70">Real questions, real prayer — no performance needed.</p>
				</div>
				<div class="rounded-2xl border border-neutral-200/90 bg-brand-light/60 p-8 text-center">
					<p class="text-sm font-black text-brand-primary">03</p>
					<h3 class="mt-2 font-sans text-lg font-bold text-brand-dark">Grow out</h3>
					<p class="mt-3 text-sm text-brand-dark/70">What you learn in the room, you carry into your week.</p>
				</div>
			</div>
		</div>
	</section>

	<section id="directory" class="bg-[#f3f2ef] {sectionY}">
		<div class="{container}">
			<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Open groups</p>
			<h2 class="mt-3 font-sans text-2xl font-black text-brand-dark md:text-4xl">Find your people</h2>
			<p class="mt-4 max-w-2xl text-brand-dark/75">
				Browse what is currently open — tap a card to reach out and we will help you take the next step.
			</p>

			{#if data.groups.length > 3}
				<div class="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div class="flex flex-wrap gap-2" role="group" aria-label="Filter groups by type">
						<button type="button" class={chip(typeFilter === 'ALL')} aria-pressed={typeFilter === 'ALL'} onclick={() => (typeFilter = 'ALL')}>All</button>
						{#each types as t (t)}
							<button type="button" class={chip(typeFilter === t)} aria-pressed={typeFilter === t} onclick={() => (typeFilter = t)}>
								{GROUP_TYPE_LABELS[t] ?? t}
							</button>
						{/each}
					</div>
					<div class="md:w-72">
						<label class="sr-only" for="group-search">Search groups</label>
						<input
							id="group-search"
							type="search"
							bind:value={query}
							placeholder="Search by name, leader or day"
							class="min-h-11 w-full rounded-full border border-neutral-200 bg-white px-5 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
						/>
					</div>
				</div>
				<p class="mt-4 text-sm text-brand-dark/60" role="status" aria-live="polite">
					Showing {shown.length} of {data.groups.length} groups
				</p>
			{/if}

			{#if shown.length === 0}
				<div class="mt-8 rounded-2xl border border-neutral-200 bg-white p-8 text-center">
					<p class="font-bold text-brand-dark">No groups match that.</p>
					<p class="mt-2 text-sm text-brand-dark/70">
						<button
							type="button"
							class="font-semibold text-brand-primary hover:underline"
							onclick={() => {
								typeFilter = 'ALL';
								query = '';
							}}>Clear filters</button
						>
						or <a class="font-semibold text-brand-primary hover:underline" href={resolve('/contact')}>ask us to help you find one</a>.
					</p>
				</div>
			{/if}

			<div class="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each shown as g (g.id)}
					<article
						id="group-{g.id}"
						class="scroll-mt-28 overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm ring-1 ring-black/[0.03] transition hover:-translate-y-0.5 hover:shadow-lg"
					>
						{#if g.imageUrl}
							<div class="aspect-[16/10] overflow-hidden bg-neutral-100">
								<img
									src={g.imageUrl}
									srcset={responsiveSrcset(g.imageUrl)}
									alt=""
									class="h-full w-full object-cover"
									loading="lazy"
									sizes="(max-width: 1024px) 100vw, 33vw"
								/>
							</div>
						{/if}
						<div class="p-6 md:p-8">
							<p class="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">{GROUP_TYPE_LABELS[g.type] ?? g.type}</p>
							<h3 class="mt-2 font-sans text-xl font-bold text-brand-dark">{g.name}</h3>
							<p class="mt-2 text-sm font-medium text-brand-dark/70">{g.dayTime} · Led by {g.leader}</p>
							{#if g.description}
								<p class="mt-4 text-sm leading-relaxed text-brand-dark/70">{g.description}</p>
							{/if}
							{#if g.whatsappUrl && /^https:\/\/(chat\.whatsapp\.com|wa\.me)\//.test(g.whatsappUrl)}
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external WhatsApp link, host-checked on save and here -->
								<a
									class="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-brand-primary hover:underline"
									href={g.whatsappUrl}
									target="_blank"
									rel="noopener noreferrer">Join the WhatsApp group →</a
								>
							{/if}
							{#if form?.success && form.groupName === g.name}
								<div class="mt-6 rounded-xl border border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-4 text-sm">
									<p class="font-bold text-[var(--color-success-fg)]">Thank you — we have your details</p>
									<p class="mt-1 text-[var(--color-success-fg)]">
										The group leader will be in touch about joining {g.name}.
									</p>
								</div>
							{:else if openGroupId === g.id}
								<form method="POST" action="?/joinGroup" class="mt-6 space-y-3">
									<input type="hidden" name="groupId" value={g.id} />
									<div class="hidden" aria-hidden="true">
										<label for="join-website-{g.id}">Leave this field empty</label>
										<input id="join-website-{g.id}" type="text" name="website" tabindex="-1" autocomplete="off" />
									</div>
									{#if form?.error}
										<p class="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-2 text-xs font-semibold text-[var(--color-danger-fg)]">
											{form.error}
										</p>
									{/if}
									<label class="sr-only" for="join-name-{g.id}">Your name</label>
									<input
										id="join-name-{g.id}"
										name="fullName"
										required
										placeholder="Your name"
										autocomplete="name"
										class="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
									/>
									<label class="sr-only" for="join-email-{g.id}">Email address</label>
									<input
										id="join-email-{g.id}"
										name="email"
										type="email"
										required
										placeholder="Email address"
										autocomplete="email"
										class="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
									/>
									<label class="sr-only" for="join-message-{g.id}">Anything you would like the leader to know</label>
									<textarea
										id="join-message-{g.id}"
										name="message"
										rows="2"
										placeholder="Anything you would like the leader to know (optional)"
										class="w-full resize-y rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
									></textarea>
									<div class="flex items-center gap-3">
										<button
											type="submit"
											class="rounded-full bg-brand-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition hover:brightness-105"
										>
											Send
										</button>
										<button
											type="button"
											class="text-xs font-semibold text-brand-dark/60 hover:text-brand-dark"
											onclick={() => (openGroupId = null)}
										>
											Cancel
										</button>
									</div>
								</form>
							{:else}
								<button
									type="button"
									class="mt-6 inline-flex rounded-full border border-brand-dark/15 px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
									onclick={() => (openGroupId = g.id)}
								>
									I'd like to join
								</button>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>
</SiteShell>
