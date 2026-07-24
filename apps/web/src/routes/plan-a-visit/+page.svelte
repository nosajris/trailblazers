<script lang="ts">
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import { container, sectionY } from '@trailblazers/ui/tb-layout';

	let { data } = $props();
</script>

<svelte:head>
	<title>Plan a visit — Trailblazers</title>
	<meta
		name="description"
		content="What to expect on your first visit — parking, atmosphere, and next steps."
	/>
</svelte:head>

<SiteShell settings={data.settings}>
	<section class="relative min-h-[22rem] overflow-hidden bg-brand-dark py-20 text-white md:min-h-[26rem] md:py-28">
		<div class="absolute inset-0">
			<img
				src="/images/slider04.jpeg"
				alt=""
				class="h-full w-full object-cover opacity-40"
				sizes="100vw"
			/>
			<div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/85 to-brand-dark/40"></div>
		</div>
		<div class="{container} relative max-w-4xl">
			<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">First time?</p>
			<h1 class="mt-4 font-sans text-4xl font-black tracking-tight md:text-6xl">Plan your visit</h1>
			<p class="mt-6 max-w-2xl text-lg leading-relaxed text-gray-200">
				We know walking into a new room can feel like a lot. Here is a simple path from parking lot to community —
				no awkward surprises.
			</p>
		</div>
	</section>

	<section class="bg-white {sectionY}">
		<div class="{container} grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
			<div class="order-2 lg:order-1">
				<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">The experience</p>
				<h2 class="mt-3 font-sans text-2xl font-black text-brand-dark md:text-4xl">What Sunday feels like</h2>
				<p class="mt-4 text-brand-dark/75 md:text-lg">
					Music that lifts your eyes, teaching that meets you where you are, and people who will notice if you do not
					show up next week — in the best way.
				</p>
				<ul class="mt-8 space-y-4 text-sm text-brand-dark/80 md:text-base">
					<li class="flex gap-3">
						<span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-primary"></span>
						Clear signage and friendly hosts — you will not wander lost.
					</li>
					<li class="flex gap-3">
						<span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-primary"></span>
						A predictable rhythm so your nervous system can relax.
					</li>
					<li class="flex gap-3">
						<span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-primary"></span>
						A simple next step if you want to go deeper than one Sunday.
					</li>
				</ul>
			</div>
			<div class="order-1 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/[0.06] lg:order-2">
				<img
					src="/images/presiding.jpg"
					alt=""
					class="aspect-[4/5] w-full object-cover object-top lg:aspect-auto lg:min-h-[32rem]"
					loading="lazy"
					sizes="(max-width: 1024px) 100vw, 45vw"
				/>
			</div>
		</div>
	</section>

	<section class="bg-brand-light {sectionY}">
		<div class="{container}">
			<div class="grid gap-8 md:grid-cols-3">
				<div class="rounded-3xl border border-neutral-200/90 bg-white p-8 shadow-sm ring-1 ring-black/[0.03]">
					<p class="text-sm font-black text-brand-primary">01</p>
					<h2 class="mt-2 font-sans text-xl font-bold text-brand-dark">Arrive</h2>
					<p class="mt-3 text-sm leading-relaxed text-brand-dark/75">
						Grab a seat anywhere — the front is not reserved for insiders. Come as you are.
					</p>
				</div>
				<div class="rounded-3xl border border-neutral-200/90 bg-white p-8 shadow-sm ring-1 ring-black/[0.03]">
					<p class="text-sm font-black text-brand-primary">02</p>
					<h2 class="mt-2 font-sans text-xl font-bold text-brand-dark">Experience</h2>
					<p class="mt-3 text-sm leading-relaxed text-brand-dark/75">
						Expect honest teaching, space to process, and people who remember what a first Sunday felt like.
					</p>
				</div>
				<div class="rounded-3xl border border-neutral-200/90 bg-white p-8 shadow-sm ring-1 ring-black/[0.03]">
					<p class="text-sm font-black text-brand-primary">03</p>
					<h2 class="mt-2 font-sans text-xl font-bold text-brand-dark">Connect</h2>
					<p class="mt-3 text-sm leading-relaxed text-brand-dark/75">
						Tell us you came — we will point you toward groups, serving, and the next right step.
					</p>
				</div>
			</div>
		</div>
	</section>

	<section class="border-t border-neutral-200/80 bg-white py-16 md:py-20">
		<div class="{container} max-w-2xl text-center">
			<h2 class="font-sans text-2xl font-black text-brand-dark md:text-3xl">Ready?</h2>
			<p class="mt-4 text-brand-dark/75">Send a quick note and we will look for you — or jump to upcoming events.</p>
			<div class="mt-10 flex flex-wrap justify-center gap-4">
				<a
					class="inline-flex rounded-full bg-brand-primary px-10 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md transition hover:brightness-105"
					href="/contact">Let us know you are coming</a
				>
				<a
					class="inline-flex rounded-full border border-brand-dark/15 px-10 py-4 text-xs font-bold uppercase tracking-[0.14em] text-brand-dark transition hover:border-brand-primary"
					href="/events">See events</a
				>
			</div>
		</div>
	</section>
</SiteShell>
