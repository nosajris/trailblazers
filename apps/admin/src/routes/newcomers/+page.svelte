<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showModal = $state(false);
	let editingItem = $state<any>(null);
	let searchQuery = $state('');

	let filteredItems = $derived(
		data.items.filter(
			(i) =>
				i.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(i.subheadline || '').toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function openCreate() {
		editingItem = {
			id: '',
			headline: '',
			subheadline: '',
			body: '',
			ctaLabel: 'Plan a Visit',
			ctaHref: '/plan-a-visit',
			imageUrl: '',
			status: 'PUBLISHED',
			sortOrder: 0
		};
		showModal = true;
	}

	function openEdit(item: any) {
		editingItem = { ...item };
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingItem = null;
	}

	function downloadCsv() {
		const headers = ['ID', 'Headline', 'Subheadline', 'CTA Label', 'Status', 'Sort Order'];
		const rows = data.items.map((i) => [
			i.id,
			`"${(i.headline || '').replace(/"/g, '""')}"`,
			`"${(i.subheadline || '').replace(/"/g, '""')}"`,
			`"${(i.ctaLabel || '').replace(/"/g, '""')}"`,
			i.status,
			i.sortOrder
		]);

		const csvStr = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `newcomers_export_${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-[var(--zinc-900)]">Newcomers & VIP Visit Portal Manager</h1>
			<p class="text-sm text-[var(--zinc-500)]">Manage first-time visitor welcome banners, VIP hosting info, and plan-a-visit steps.</p>
		</div>
		<div class="flex items-center gap-3">
			<button onclick={downloadCsv} class="admin-btn-secondary">Export CSV</button>
			<button onclick={openCreate} class="admin-btn-primary">+ Add Newcomer Content</button>
		</div>
	</div>

	<div class="flex items-center gap-4">
		<input
			type="text"
			placeholder="Search newcomer portal sections by headline or subheadline..."
			bind:value={searchQuery}
			class="admin-input max-w-md"
		/>
	</div>

	<div class="overflow-hidden admin-card">
		<table class="admin-table">
			<thead>
				<tr>
					<th>Headline</th>
					<th>Subheadline / Details</th>
					<th>CTA Action</th>
					<th>Status</th>
					<th>Order</th>
					<th class="text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#if filteredItems.length === 0}
					<tr>
						<td colspan="6" class="py-8 text-center text-sm text-[var(--zinc-500)]">
							No newcomer portal sections configured. Click "+ Add Newcomer Content" to create one.
						</td>
					</tr>
				{:else}
					{#each filteredItems as item}
						<tr>
							<td class="font-medium text-[var(--zinc-900)]">{item.headline}</td>
							<td class="text-sm text-[var(--zinc-600)] max-w-md line-clamp-1">{item.subheadline || item.body || 'N/A'}</td>
							<td class="text-sm font-semibold text-[var(--brand-primary)]">{item.ctaLabel || 'N/A'}</td>
							<td>
								{#if item.status === 'PUBLISHED'}
									<span class="admin-badge admin-badge-success">Published</span>
								{:else}
									<span class="admin-badge admin-badge-neutral">Draft</span>
								{/if}
							</td>
							<td class="text-sm text-[var(--zinc-500)]">{item.sortOrder}</td>
							<td class="text-right font-medium">
								<button onclick={() => openEdit(item)} class="mr-3 text-[var(--brand-primary)] hover:underline">Edit</button>
								<form action="?/deleteNewcomerContent" method="POST" class="inline">
									<input type="hidden" name="id" value={item.id} />
									<button type="submit" class="text-[var(--color-danger-fg)] hover:underline">Delete</button>
								</form>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>

{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
		<div class="w-full max-w-lg admin-card p-6 shadow-2xl bg-white">
			<h2 class="text-xl font-bold text-[var(--zinc-900)] mb-4">
				{editingItem?.id ? 'Edit Newcomer Section' : 'Add Newcomer Section'}
			</h2>
			<form action="?/saveNewcomerContent" method="POST" class="space-y-4">
				{#if editingItem?.id}
					<input type="hidden" name="id" value={editingItem.id} />
				{/if}

				<div>
					<label for="newcomer-headline" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Headline</label>
					<input id="newcomer-headline" type="text" name="headline" bind:value={editingItem.headline} required class="admin-input" />
				</div>

				<div>
					<label for="newcomer-subhead" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Subheadline</label>
					<input id="newcomer-subhead" type="text" name="subheadline" bind:value={editingItem.subheadline} class="admin-input" />
				</div>

				<div>
					<label for="newcomer-body" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Body Text / Instructions</label>
					<textarea id="newcomer-body" name="body" bind:value={editingItem.body} rows="3" class="admin-input"></textarea>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="newcomer-cta-label" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">CTA Label</label>
						<input id="newcomer-cta-label" type="text" name="ctaLabel" bind:value={editingItem.ctaLabel} placeholder="e.g. Plan a Visit" class="admin-input" />
					</div>
					<div>
						<label for="newcomer-cta-href" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">CTA Path / URL</label>
						<input id="newcomer-cta-href" type="text" name="ctaHref" bind:value={editingItem.ctaHref} placeholder="e.g. /plan-a-visit" class="admin-input" />
					</div>
				</div>

				<div>
					<label for="newcomer-image" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Image URL</label>
					<input id="newcomer-image" type="text" name="imageUrl" bind:value={editingItem.imageUrl} placeholder="https://..." class="admin-input" />
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="newcomer-status" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Status</label>
						<select id="newcomer-status" name="status" bind:value={editingItem.status} class="admin-input">
							<option value="PUBLISHED">PUBLISHED</option>
							<option value="DRAFT">DRAFT</option>
						</select>
					</div>
					<div>
						<label for="newcomer-sort" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Sort Order</label>
						<input id="newcomer-sort" type="number" name="sortOrder" bind:value={editingItem.sortOrder} class="admin-input" />
					</div>
				</div>

				<div class="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--zinc-200)]">
					<button type="button" onclick={closeModal} class="admin-btn-secondary">Cancel</button>
					<button type="submit" class="admin-btn-primary">Save Section</button>
				</div>
			</form>
		</div>
	</div>
{/if}
