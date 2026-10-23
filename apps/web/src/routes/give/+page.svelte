<script lang="ts">
	import SeoMeta from '@trailblazers/ui/site/seo-meta.svelte';
	import { resolve } from '$app/paths';
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import { container, sectionY } from '@trailblazers/ui/tb-layout';
	import { whatsappChatUrl } from '@trailblazers/ui/site/share';

	let { data, form } = $props();

	const extras = $derived(data.settings.siteExtras);
	const methods = $derived(extras.givingMethods ?? []);
	const note = $derived(extras.givingNote);
	const chatHref = $derived(
		whatsappChatUrl(extras.whatsappNumber, 'Hello! I have a question about giving.')
	);

	let selectedMethod = $state<'ECOCASH' | 'ONEMONEY' | 'INNBUCKS' | 'CARD' | 'OTHER'>('ECOCASH');
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

	{#if data.paymentsAvailable}
		<section class="bg-white pb-16 md:pb-20" aria-labelledby="give-online-title">
			<div class="{container} max-w-3xl">
				<div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
					<h2 id="give-online-title" class="font-sans text-2xl font-black text-brand-dark md:text-3xl">
						Give online now
					</h2>
					<p class="mt-2 text-sm leading-relaxed text-brand-dark/70">
						EcoCash, OneMoney, InnBucks or card — paid securely through Paynow or Pesepay.
					</p>

					{#if form?.error}
						<div
							class="mt-6 rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-3 text-sm font-semibold text-[var(--color-danger-fg)]"
						>
							{form.error}
						</div>
					{/if}

					<form method="POST" action="?/giveOnline" class="mt-6 space-y-4">
						<!-- Decoy field for bots; see form-guard.ts. -->
						<div class="hidden" aria-hidden="true">
							<label for="give-website">Leave this field empty</label>
							<input id="give-website" type="text" name="website" tabindex="-1" autocomplete="off" />
						</div>
						<input type="hidden" name="_ft" value={data.formToken} />

						<div class="grid gap-4 md:grid-cols-2">
							<div>
								<label class="sr-only" for="give-amount">Amount (USD)</label>
								<div class="relative">
									<span class="absolute inset-y-0 left-4 flex items-center text-brand-dark/50">$</span>
									<input
										id="give-amount"
										name="amount"
										type="number"
										min="1"
										step="0.01"
										required
										placeholder="Amount"
										class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 pl-8 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
									/>
								</div>
							</div>
							<div>
								<label class="sr-only" for="give-method">Payment method</label>
								<select
									id="give-method"
									name="method"
									bind:value={selectedMethod}
									class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
								>
									<option value="ECOCASH">EcoCash</option>
									<option value="ONEMONEY">OneMoney</option>
									<option value="INNBUCKS">InnBucks</option>
									<option value="CARD">Card</option>
								</select>
							</div>
						</div>

						<label class="sr-only" for="give-name">Your name</label>
						<input
							id="give-name"
							name="fullName"
							required
							placeholder="Your name"
							autocomplete="name"
							class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
						/>

						<div class="grid gap-4 md:grid-cols-2">
							<div>
								<label class="sr-only" for="give-email">Email address</label>
								<input
									id="give-email"
									name="email"
									type="email"
									required
									placeholder="Email address"
									autocomplete="email"
									class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
								/>
							</div>
							<div>
								<label class="sr-only" for="give-phone">
									{selectedMethod === 'ECOCASH' || selectedMethod === 'ONEMONEY' || selectedMethod === 'INNBUCKS'
										? 'Mobile money number'
										: 'Phone number (optional)'}
								</label>
								<input
									id="give-phone"
									name="phone"
									type="tel"
									required={selectedMethod !== 'CARD'}
									placeholder={selectedMethod === 'CARD' ? 'Phone number (optional)' : 'Mobile money number'}
									autocomplete="tel"
									class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
								/>
							</div>
						</div>

						<button
							type="submit"
							class="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand-primary px-8 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md transition hover:brightness-105 md:w-auto"
						>
							Give now
						</button>
						<p class="text-xs text-brand-dark/60">
							An EcoCash or OneMoney gift sends a payment prompt straight to your phone.
						</p>
					</form>
				</div>
			</div>
		</section>
	{/if}

	{#if methods.length > 0}
		<section class="bg-brand-light pb-16 md:pb-20" aria-labelledby="ways-to-give-title">
			<div class="{container} max-w-3xl">
				<h2 id="ways-to-give-title" class="font-sans text-2xl font-black text-brand-dark md:text-3xl">
					Other ways to give
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
	{:else if !data.paymentsAvailable}
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
