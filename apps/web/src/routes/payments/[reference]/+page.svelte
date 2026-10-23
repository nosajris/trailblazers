<script lang="ts">
	import SeoMeta from '@trailblazers/ui/site/seo-meta.svelte';
	import { resolve } from '$app/paths';
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';

	let { data } = $props();

	const amount = $derived(`${data.currency} ${(data.amount / 100).toFixed(2)}`);

	const copy = $derived.by(() => {
		const COPY = {
			PAID: {
				title:
					data.purpose === 'EVENT_REGISTRATION'
						? 'Payment received — you have a seat'
						: 'Thank you for your gift',
				body:
					data.purpose === 'EVENT_REGISTRATION'
						? `Your payment of ${amount} went through and your registration is confirmed. We have emailed you a confirmation.`
						: `Your gift of ${amount} has been received. Thank you for your generosity — we have emailed you a confirmation.`
			},
			PENDING: {
				title: 'Still waiting on this payment',
				body: 'If you approved a prompt on your phone, this can take a minute or two to confirm. Reload this page to check again — nothing has been charged twice.'
			},
			FAILED: {
				title: 'That payment did not go through',
				body: 'Nothing was charged. Please go back and try again, or choose a different payment method.'
			},
			CANCELLED: {
				title: 'Payment cancelled',
				body: 'This payment was cancelled before it completed. Nothing was charged. You can start again any time.'
			}
		} as const;

		return COPY[data.status as keyof typeof COPY] ?? COPY.PENDING;
	});
</script>

<SeoMeta title="Payment status — Trailblazers" description="Check the status of a payment." noindex />

<SiteShell settings={data.settings}>
	<section class="border-b border-neutral-200/80 bg-brand-light py-20 md:py-28">
		<div class="mx-auto max-w-2xl px-4 text-center md:px-6">
			<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">
				{data.purpose === 'EVENT_REGISTRATION' ? 'Event payment' : 'Online giving'}
			</p>
			<h1 class="mt-4 font-sans text-3xl font-black tracking-tight text-brand-dark md:text-4xl">
				{copy.title}
			</h1>
			<p class="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-brand-dark/75">
				{copy.body}
			</p>

			{#if data.status === 'PENDING'}
				<form method="GET" class="mt-4">
					<button
						type="submit"
						class="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-dark/15 bg-white px-8 text-xs font-bold uppercase tracking-[0.14em] text-brand-dark transition hover:border-brand-primary"
					>
						Check again
					</button>
				</form>
			{/if}

			<div class="mt-10 flex flex-wrap justify-center gap-4">
				{#if data.event}
					<a
						class="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-primary px-10 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg transition hover:brightness-105"
						href={resolve('/events/[id]', { id: String(data.event.id) })}
					>
						Back to the event
					</a>
				{:else}
					<a
						class="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-primary px-10 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg transition hover:brightness-105"
						href={resolve('/give')}
					>
						Back to Give
					</a>
				{/if}
				<a
					class="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-dark/15 bg-white px-10 text-xs font-bold uppercase tracking-[0.14em] text-brand-dark transition hover:border-brand-primary"
					href={resolve('/contact')}
				>
					Contact the office
				</a>
			</div>
		</div>
	</section>
</SiteShell>
