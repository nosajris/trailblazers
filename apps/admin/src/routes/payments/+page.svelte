<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { toast } from '@trailblazers/ui/components/toast-store.svelte.js';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let noteModalFor = $state<string | null>(null);
	let noteValue = $state('');

	function money(cents: number, currency = 'USD') {
		return `${currency} ${(cents / 100).toFixed(2)}`;
	}

	function statusBadgeClass(status: string) {
		if (status === 'PAID') return 'admin-badge-success';
		if (status === 'PENDING') return 'admin-badge-warning';
		if (status === 'FAILED') return 'admin-badge-danger';
		return 'admin-badge-neutral';
	}

	function openNoteModal(reference: string) {
		noteModalFor = reference;
		noteValue = '';
	}

	function closeNoteModal() {
		noteModalFor = null;
		noteValue = '';
	}

	function downloadCsv() {
		const headers = ['Reference', 'Purpose', 'Provider', 'Method', 'Amount', 'Currency', 'Status', 'Payer', 'Email', 'Created'];
		const rows = data.payments.map((p) => [
			p.reference,
			p.purpose,
			p.provider,
			p.method ?? '',
			(p.amount / 100).toFixed(2),
			p.currency,
			p.status,
			`"${(p.payerName || '').replace(/"/g, '""')}"`,
			p.payerEmail,
			new Date(p.createdAt).toISOString()
		]);
		const csvStr = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `payments_export_${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-[var(--zinc-900)]">Giving & Payments</h1>
			<p class="text-sm text-[var(--zinc-500)]">
				Every online gift and paid event registration — Paynow, Pesepay, or marked paid by staff.
			</p>
		</div>
		<button onclick={downloadCsv} class="admin-btn-secondary">Export CSV</button>
	</div>

	{#if form?.error}
		<div class="admin-card border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-3 text-sm font-semibold text-[var(--color-danger-fg)]">
			{form.error}
		</div>
	{/if}

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<div class="admin-card p-4 text-center">
			<div class="text-xs font-semibold uppercase text-[var(--zinc-500)] mb-1">Total paid (all time)</div>
			<div class="text-2xl font-bold text-[var(--zinc-900)]">{money(data.counts.paidTotalCents)}</div>
		</div>
		<div class="admin-card p-4 text-center">
			<div class="text-xs font-semibold uppercase text-[var(--zinc-500)] mb-1">Pending</div>
			<div class="text-2xl font-bold text-amber-600">{data.counts.pending}</div>
		</div>
		<div class="admin-card p-4 text-center">
			<div class="text-xs font-semibold uppercase text-[var(--zinc-500)] mb-1">Failed</div>
			<div class="text-2xl font-bold text-rose-600">{data.counts.failed}</div>
		</div>
	</div>

	<div class="admin-card overflow-x-auto">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-[var(--zinc-200)] text-left text-xs font-semibold uppercase text-[var(--zinc-500)]">
					<th class="px-4 py-3">Reference</th>
					<th class="px-4 py-3">Purpose</th>
					<th class="px-4 py-3">Payer</th>
					<th class="px-4 py-3">Amount</th>
					<th class="px-4 py-3">Method</th>
					<th class="px-4 py-3">Provider</th>
					<th class="px-4 py-3">Status</th>
					<th class="px-4 py-3">Created</th>
					<th class="px-4 py-3"></th>
				</tr>
			</thead>
			<tbody>
				{#each data.payments as payment (payment.reference)}
					<tr class="border-b border-[var(--zinc-100)]">
						<td class="px-4 py-3 font-mono text-xs">{payment.reference}</td>
						<td class="px-4 py-3">{payment.purpose === 'GIVING' ? 'Giving' : 'Event registration'}</td>
						<td class="px-4 py-3">
							<div class="font-medium text-[var(--zinc-900)]">{payment.payerName}</div>
							<div class="text-xs text-[var(--zinc-500)]">{payment.payerEmail}</div>
						</td>
						<td class="px-4 py-3 font-semibold">{money(payment.amount, payment.currency)}</td>
						<td class="px-4 py-3">{payment.method ?? '—'}</td>
						<td class="px-4 py-3">{payment.provider}</td>
						<td class="px-4 py-3">
							<span class="admin-badge {statusBadgeClass(payment.status)}">{payment.status}</span>
						</td>
						<td class="px-4 py-3 text-xs text-[var(--zinc-500)]">{new Date(payment.createdAt).toLocaleDateString()}</td>
						<td class="px-4 py-3 text-right">
							{#if payment.status === 'PENDING' || payment.status === 'FAILED'}
								<button onclick={() => openNoteModal(payment.reference)} class="admin-btn-secondary text-xs py-1.5 px-3">
									Mark paid
								</button>
							{/if}
						</td>
					</tr>
				{:else}
					<tr><td colspan="9" class="px-4 py-8 text-center text-[var(--zinc-500)]">No payments yet.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if data.pagination.totalPages > 1}
		<div class="flex items-center justify-between">
			<p class="text-sm text-[var(--zinc-500)]">
				Page {data.pagination.page} of {data.pagination.totalPages}
				<span class="text-[var(--zinc-400)]">({data.pagination.total} payments)</span>
			</p>
			<div class="flex gap-2">
				{#if data.pagination.hasPrevious}
					<a class="admin-btn-secondary" href={resolve(`/payments?page=${data.pagination.page - 1}`)} rel="prev">Previous</a>
				{/if}
				{#if data.pagination.hasNext}
					<a class="admin-btn-secondary" href={resolve(`/payments?page=${data.pagination.page + 1}`)} rel="next">Next</a>
				{/if}
			</div>
		</div>
	{/if}
</div>

{#if noteModalFor}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
		<div class="admin-card w-full max-w-md p-6">
			<h2 class="text-lg font-bold text-[var(--zinc-900)]">Mark payment paid</h2>
			<p class="mt-1 text-sm text-[var(--zinc-500)]">
				For a payment taken outside Paynow/Pesepay — cash, a bank transfer, a swipe the gateway never confirmed.
				Reference: <span class="font-mono">{noteModalFor}</span>
			</p>
			<form
				method="POST"
				action="?/markPaid"
				use:enhance={() => {
					const reference = noteModalFor;
					return async ({ result, update }) => {
						await update();
						if (result.type === 'success') {
							toast.success(`Marked ${reference} paid.`);
							closeNoteModal();
						} else if (result.type === 'failure') {
							toast.error((result.data as { error?: string } | undefined)?.error ?? 'Could not mark that payment paid.');
						}
					};
				}}
				class="mt-4 space-y-3"
			>
				<input type="hidden" name="reference" value={noteModalFor} />
				<label class="block text-xs font-semibold uppercase text-[var(--zinc-500)]" for="payment-note">
					How was this paid? (required — kept on the audit log)
				</label>
				<textarea
					id="payment-note"
					name="note"
					bind:value={noteValue}
					required
					rows="3"
					class="admin-input w-full"
					placeholder="e.g. Cash received at the office, 23 Oct — handed to J. Moyo"
				></textarea>
				<div class="flex justify-end gap-2 pt-2">
					<button type="button" onclick={closeNoteModal} class="admin-btn-secondary">Cancel</button>
					<button type="submit" class="admin-btn-primary">Confirm paid</button>
				</div>
			</form>
		</div>
	</div>
{/if}
