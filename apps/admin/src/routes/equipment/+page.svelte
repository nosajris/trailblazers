<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showModal = $state(false);
	let editingItem = $state<any>(null);
	let searchQuery = $state('');

	let filteredItems = $derived(
		data.equipmentList.filter(
			(e) =>
				e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(e.description || '').toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function openCreate() {
		editingItem = {
			id: '',
			name: '',
			description: '',
			status: 'AVAILABLE',
			dailyRate: 0,
			imageUrl: '',
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
		const headers = ['ID', 'Name', 'Status', 'Daily Rate', 'Description'];
		const rows = data.equipmentList.map((e) => [
			e.id,
			`"${(e.name || '').replace(/"/g, '""')}"`,
			e.status,
			e.dailyRate,
			`"${(e.description || '').replace(/"/g, '""')}"`
		]);

		const csvStr = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `equipment_export_${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-[var(--zinc-900)]">Ministry Equipment & Resource Inventory</h1>
			<p class="text-sm text-[var(--zinc-500)]">Track audio/visual gear, instruments, projectors, and venue equipment status.</p>
		</div>
		<div class="flex items-center gap-3">
			<button onclick={downloadCsv} class="admin-btn-secondary">Export CSV</button>
			<button onclick={openCreate} class="admin-btn-primary">+ Add Equipment Item</button>
		</div>
	</div>

	<div class="flex items-center gap-4">
		<input
			type="text"
			placeholder="Search equipment by name or description..."
			bind:value={searchQuery}
			class="admin-input max-w-md"
		/>
	</div>

	<div class="overflow-hidden admin-card">
		<table class="admin-table">
			<thead>
				<tr>
					<th>Equipment Name</th>
					<th>Status</th>
					<th>Daily Rate ($)</th>
					<th class="text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#if filteredItems.length === 0}
					<tr>
						<td colspan="4" class="py-8 text-center text-sm text-[var(--zinc-500)]">
							No equipment items registered. Click "+ Add Equipment Item" to list gear.
						</td>
					</tr>
				{:else}
					{#each filteredItems as item}
						<tr>
							<td class="font-medium text-[var(--zinc-900)]">
								<div>{item.name}</div>
								{#if item.description}
									<div class="text-xs text-[var(--zinc-400)] line-clamp-1">{item.description}</div>
								{/if}
							</td>
							<td>
								{#if item.status === 'AVAILABLE'}
									<span class="admin-badge admin-badge-success">Available</span>
								{:else if item.status === 'RENTED'}
									<span class="admin-badge admin-badge-warning">In Use / Rented</span>
								{:else}
									<span class="admin-badge admin-badge-neutral">Maintenance</span>
								{/if}
							</td>
							<td class="text-sm font-semibold text-[var(--zinc-700)]">${item.dailyRate}</td>
							<td class="text-right font-medium">
								<button onclick={() => openEdit(item)} class="mr-3 text-[var(--brand-primary)] hover:underline">Edit</button>
								<form action="?/deleteEquipment" method="POST" class="inline">
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
				{editingItem?.id ? 'Edit Equipment Item' : 'Add Equipment Item'}
			</h2>
			<form action="?/saveEquipment" method="POST" class="space-y-4">
				{#if editingItem?.id}
					<input type="hidden" name="id" value={editingItem.id} />
				{/if}

				<div>
					<label for="eq-name" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Item Name</label>
					<input id="eq-name" type="text" name="name" bind:value={editingItem.name} required class="admin-input" />
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="eq-status" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Availability Status</label>
						<select id="eq-status" name="status" bind:value={editingItem.status} class="admin-input">
							<option value="AVAILABLE">AVAILABLE</option>
							<option value="RENTED">RENTED / IN USE</option>
							<option value="MAINTENANCE">MAINTENANCE</option>
						</select>
					</div>
					<div>
						<label for="eq-rate" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Daily Rate ($)</label>
						<input id="eq-rate" type="number" name="dailyRate" bind:value={editingItem.dailyRate} required class="admin-input" />
					</div>
				</div>

				<div>
					<label for="eq-image" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Image URL</label>
					<input id="eq-image" type="text" name="imageUrl" bind:value={editingItem.imageUrl} placeholder="https://..." class="admin-input" />
				</div>

				<div>
					<label for="eq-desc" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Description & Condition</label>
					<textarea id="eq-desc" name="description" bind:value={editingItem.description} rows="3" class="admin-input"></textarea>
				</div>

				<div class="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--zinc-200)]">
					<button type="button" onclick={closeModal} class="admin-btn-secondary">Cancel</button>
					<button type="submit" class="admin-btn-primary">Save Item</button>
				</div>
			</form>
		</div>
	</div>
{/if}
