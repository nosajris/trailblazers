<script lang="ts">
	import SeoMeta from '@trailblazers/ui/site/seo-meta.svelte';
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import { container, sectionY } from '@trailblazers/ui/tb-layout';
	import { resolve } from '$app/paths';
	import type { SiteSettingsBundle, PublicUserVm } from '@trailblazers/core';

	type Payment = {
		reference: string;
		purpose: string;
		amount: number;
		currency: string;
		status: string;
		createdAt: string | Date;
	};
	type Registration = {
		registrationId: number;
		status: string;
		createdAt: string | Date;
		eventId: number;
		eventTitle: string;
		eventDate: string | Date;
		eventLocation: string | null;
	};

	let {
		data
	}: {
		data: {
			settings: SiteSettingsBundle;
			user: PublicUserVm;
			payments: Payment[];
			registrations: Registration[];
		};
	} = $props();

	function money(cents: number, currency = 'USD') {
		return `${currency} ${(cents / 100).toFixed(2)}`;
	}

	function statusClass(status: string) {
		if (status === 'PAID' || status === 'CONFIRMED') return 'bg-emerald-50 text-emerald-700';
		if (status === 'PENDING') return 'bg-amber-50 text-amber-700';
		if (status === 'FAILED' || status === 'CANCELLED') return 'bg-red-50 text-red-700';
		return 'bg-neutral-100 text-neutral-600';
	}
</script>

<SeoMeta title="My account — Trailblazers" description="Your giving and event registration history." noindex />

<SiteShell settings={data.settings}>
	<section class="bg-brand-light {sectionY}">
		<div class="{container} max-w-4xl">
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div>
					<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Account</p>
					<h1 class="mt-2 font-sans text-2xl font-black text-brand-dark md:text-3xl">
						Welcome back, {data.user.fullName.split(' ')[0]}
					</h1>
					<p class="mt-1 text-sm text-brand-dark/60">{data.user.email}</p>
				</div>
				<form method="POST" action={resolve('/account/logout')}>
					<button
						type="submit"
						class="rounded-full border border-neutral-300 px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-brand-dark transition hover:bg-white"
					>
						Sign out
					</button>
				</form>
			</div>

			<div class="mt-12">
				<h2 class="font-sans text-xl font-black text-brand-dark">Event registrations</h2>
				<div class="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-neutral-200 text-left text-xs font-bold uppercase tracking-wide text-brand-dark/50">
								<th class="px-5 py-3">Event</th>
								<th class="px-5 py-3">Date</th>
								<th class="px-5 py-3">Status</th>
							</tr>
						</thead>
						<tbody>
							{#each data.registrations as reg (reg.registrationId)}
								<tr class="border-b border-neutral-100 last:border-0">
									<td class="px-5 py-3.5 font-semibold text-brand-dark">
										<a href={resolve(`/events/${reg.eventId}`)} class="hover:text-brand-primary hover:underline"
											>{reg.eventTitle}</a
										>
										{#if reg.eventLocation}
											<div class="text-xs font-normal text-brand-dark/50">{reg.eventLocation}</div>
										{/if}
									</td>
									<td class="px-5 py-3.5 text-brand-dark/70">
										{new Date(reg.eventDate).toLocaleDateString()}
									</td>
									<td class="px-5 py-3.5">
										<span class="rounded-full px-3 py-1 text-xs font-bold {statusClass(reg.status)}">{reg.status}</span>
									</td>
								</tr>
							{:else}
								<tr><td colspan="3" class="px-5 py-8 text-center text-brand-dark/50">No registrations yet.</td></tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<div class="mt-12">
				<h2 class="font-sans text-xl font-black text-brand-dark">Giving history</h2>
				<div class="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-neutral-200 text-left text-xs font-bold uppercase tracking-wide text-brand-dark/50">
								<th class="px-5 py-3">Reference</th>
								<th class="px-5 py-3">Purpose</th>
								<th class="px-5 py-3">Amount</th>
								<th class="px-5 py-3">Status</th>
								<th class="px-5 py-3">Date</th>
							</tr>
						</thead>
						<tbody>
							{#each data.payments as payment (payment.reference)}
								<tr class="border-b border-neutral-100 last:border-0">
									<td class="px-5 py-3.5 font-mono text-xs text-brand-dark/70">{payment.reference}</td>
									<td class="px-5 py-3.5 text-brand-dark/70">
										{payment.purpose === 'GIVING' ? 'Giving' : 'Event registration'}
									</td>
									<td class="px-5 py-3.5 font-semibold text-brand-dark">{money(payment.amount, payment.currency)}</td>
									<td class="px-5 py-3.5">
										<span class="rounded-full px-3 py-1 text-xs font-bold {statusClass(payment.status)}"
											>{payment.status}</span
										>
									</td>
									<td class="px-5 py-3.5 text-brand-dark/60">
										{new Date(payment.createdAt).toLocaleDateString()}
									</td>
								</tr>
							{:else}
								<tr><td colspan="5" class="px-5 py-8 text-center text-brand-dark/50">No gifts yet.</td></tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</section>
</SiteShell>
