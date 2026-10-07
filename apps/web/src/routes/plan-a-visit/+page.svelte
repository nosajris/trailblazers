<script lang="ts">
	import SeoMeta from '@trailblazers/ui/site/seo-meta.svelte';
	import { resolve } from '$app/paths';
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import { container, sectionY } from '@trailblazers/ui/tb-layout';

	let { data, form } = $props();

	const times = $derived(data.settings.siteExtras.visitTimes ?? []);
	const address = $derived(data.settings.siteExtras.visitAddress);
	const notes = $derived(data.settings.siteExtras.visitNotes);
	// Checked again here as well as on save, because this value goes into an href.
	const mapUrl = $derived.by(() => {
		const url = data.settings.siteExtras.visitMapUrl?.trim();
		return url && /^https?:\/\//i.test(url) ? url : undefined;
	});
	const hasVisitDetails = $derived(times.length > 0 || !!address || !!notes || !!mapUrl);
</script>

<SeoMeta
	title="Plan a visit — Trailblazers"
	description="What to expect on your first visit — parking, atmosphere, and next steps."
	image="/images/slider04.jpeg"
/>

<SiteShell settings={data.settings}>
	<section class="relative min-h-[22rem] overflow-hidden bg-brand-dark py-20 text-white md:min-h-[26rem] md:py-28">
		<div class="absolute inset-0">
			<img
				src="/images/slider04.jpeg"
				alt=""
				class="h-full w-full object-cover opacity-40"
				sizes="100vw"
				fetchpriority="high"
				loading="eager"
				decoding="async"
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

	{#if hasVisitDetails}
		<section class="border-b border-neutral-200/80 bg-brand-light py-12 md:py-16" aria-labelledby="visit-details-title">
			<div class="{container} max-w-4xl">
				<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Before you come</p>
				<h2 id="visit-details-title" class="mt-3 font-sans text-2xl font-black text-brand-dark md:text-4xl">
					When and where
				</h2>
				<div class="mt-8 grid gap-8 md:grid-cols-2">
					{#if times.length > 0}
						<div>
							<h3 class="text-sm font-bold uppercase tracking-wide text-brand-dark/60">Gatherings</h3>
							<ul class="mt-3 space-y-2 text-base font-semibold text-brand-dark md:text-lg">
								{#each times as time, i (i)}
									<li>{time}</li>
								{/each}
							</ul>
						</div>
					{/if}
					{#if address || mapUrl}
						<div>
							<h3 class="text-sm font-bold uppercase tracking-wide text-brand-dark/60">Where</h3>
							{#if address}
								<p class="mt-3 text-base font-semibold text-brand-dark md:text-lg">{address}</p>
							{/if}
							{#if mapUrl}
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external map link from site settings, validated as http(s) -->
								<a
									class="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-brand-primary hover:underline"
									href={mapUrl}
									target="_blank"
									rel="noopener noreferrer">Open in maps →</a
								>
							{/if}
						</div>
					{/if}
				</div>
				{#if notes}
					<p class="mt-8 max-w-2xl whitespace-pre-line text-base leading-relaxed text-brand-dark/75">{notes}</p>
				{/if}
			</div>
		</section>
	{/if}

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

	<section id="register" class="border-t border-neutral-200/80 bg-white py-16 md:py-20">
		<div class="{container} max-w-xl">
			<h2 class="text-center font-sans text-2xl font-black text-brand-dark md:text-3xl">Let us look for you</h2>
			<p class="mt-4 text-center text-brand-dark/75">
				Tell us you are coming and a real person will say hello when you arrive.
			</p>

			{#if form?.success}
				<div
					class="mt-8 rounded-xl border border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-5 text-sm"
					role="status"
				>
					<p class="font-bold text-[var(--color-success-fg)]">Thank you — we have your details</p>
					<p class="mt-1 text-[var(--color-success-fg)]">Someone from the team will be in touch before your visit.</p>
				</div>
			{:else}
				{#if form?.error}
					<div
						class="mt-8 rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-3 text-sm font-semibold text-[var(--color-danger-fg)]"
						role="alert"
					>
						{form.error}
					</div>
				{/if}
				<form method="POST" action="?/registerVipVisit" class="mt-8 space-y-3">
					<!-- Decoy field for bots; see rate-limit.ts. -->
					<div class="hidden" aria-hidden="true">
						<label for="visit-website">Leave this field empty</label>
						<input id="visit-website" type="text" name="website" tabindex="-1" autocomplete="off" />
					</div>
					<label class="sr-only" for="visit-name">Your name</label>
					<input
						id="visit-name"
						name="fullName"
						required
						placeholder="Your name"
						autocomplete="name"
						class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
					/>
					<label class="sr-only" for="visit-email">Email address</label>
					<input
						id="visit-email"
						name="email"
						type="email"
						required
						placeholder="Email address"
						autocomplete="email"
						class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
					/>
					<label class="sr-only" for="visit-phone">Phone number (optional)</label>
					<input
						id="visit-phone"
						name="phone"
						type="tel"
						placeholder="Phone number (optional)"
						autocomplete="tel"
						class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
					/>
					<label class="block text-xs font-bold uppercase tracking-wide text-brand-dark/60" for="visit-date"
						>Day you plan to come (optional)</label
					>
					<input
						id="visit-date"
						name="preferredDate"
						type="date"
						class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
					/>
					<button
						type="submit"
						class="w-full rounded-full bg-brand-primary px-10 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md transition hover:brightness-105"
					>
						Let us know you are coming
					</button>
				</form>
			{/if}

			<p class="mt-8 text-center text-sm text-brand-dark/70">
				Prefer to write? <a class="font-semibold text-brand-primary hover:underline" href={resolve('/contact')}>Send a note</a>
				or <a class="font-semibold text-brand-primary hover:underline" href={resolve('/events')}>see events</a>.
			</p>
		</div>
	</section>
</SiteShell>
