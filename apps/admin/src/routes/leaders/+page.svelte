<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showModal = $state(false);
	let editingLeader = $state<any>(null);
	let searchQuery = $state('');

	let filteredLeaders = $derived(
		data.leaders.filter(
			(l) =>
				l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				l.role.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function openCreate() {
		editingLeader = {
			id: '',
			name: '',
			role: '',
			imageUrl: '',
			status: 'PUBLISHED',
			order: 0
		};
		showModal = true;
	}

	function openEdit(leader: any) {
		editingLeader = { ...leader };
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingLeader = null;
	}

	function downloadCsv() {
		const headers = ['ID', 'Name', 'Role', 'Status', 'Display Order'];
		const rows = data.leaders.map((l) => [
			l.id,
			`"${(l.name || '').replace(/"/g, '""')}"`,
			`"${(l.role || '').replace(/"/g, '""')}"`,
			l.status,
			l.order
		]);

		const csvStr = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `leaders_export_${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-[var(--zinc-900)]">Ministry Leaders & Team Directory</h1>
			<p class="text-sm text-[var(--zinc-500)]">Manage pastoral leadership, campus directors, and ministry team profiles.</p>
		</div>
		<div class="flex items-center gap-3">
			<button onclick={downloadCsv} class="admin-btn-secondary">Export CSV</button>
			<button onclick={openCreate} class="admin-btn-primary">+ Add Leader</button>
		</div>
	</div>

	<div class="flex items-center gap-4">
		<input
			type="text"
			placeholder="Search leaders by name or role..."
			bind:value={searchQuery}
			class="admin-input max-w-md"
		/>
	</div>

	<div class="overflow-hidden admin-card">
		<table class="admin-table">
			<thead>
				<tr>
					<th>Leader</th>
					<th>Role / Ministry Title</th>
					<th>Status</th>
					<th>Order</th>
					<th class="text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#if filteredLeaders.length === 0}
					<tr>
						<td colspan="5" class="py-8 text-center text-sm text-[var(--zinc-500)]">
							No ministry leaders found. Click "+ Add Leader" to add a team member.
						</td>
					</tr>
				{:else}
					{#each filteredLeaders as leader}
						<tr>
							<td class="font-medium text-[var(--zinc-900)]">
								<div class="flex items-center gap-3">
									{#if leader.imageUrl}
										<img src={leader.imageUrl} alt={leader.name} class="h-9 w-9 rounded-full object-cover border border-[var(--zinc-200)]" />
									{:else}
										<div class="h-9 w-9 rounded-full bg-[var(--zinc-200)] text-[var(--zinc-700)] flex items-center justify-center font-bold text-xs">
											{leader.name?.[0] || 'L'}
										</div>
									{/if}
									<span>{leader.name}</span>
								</div>
							</td>
							<td class="text-sm text-[var(--zinc-600)]">{leader.role}</td>
							<td>
								{#if leader.status === 'PUBLISHED'}
									<span class="admin-badge admin-badge-success">Published</span>
								{:else}
									<span class="admin-badge admin-badge-neutral">Draft</span>
								{/if}
							</td>
							<td class="text-sm text-[var(--zinc-500)]">{leader.order}</td>
							<td class="text-right font-medium">
								<button onclick={() => openEdit(leader)} class="mr-3 text-[var(--brand-primary)] hover:underline">Edit</button>
								<form action="?/deleteLeader" method="POST" class="inline">
									<input type="hidden" name="id" value={leader.id} />
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
				{editingLeader?.id ? 'Edit Ministry Leader' : 'Add Ministry Leader'}
			</h2>
			<form action="?/saveLeader" method="POST" class="space-y-4">
				{#if editingLeader?.id}
					<input type="hidden" name="id" value={editingLeader.id} />
				{/if}

				<div>
					<label for="leader-name" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Full Name</label>
					<input id="leader-name" type="text" name="name" bind:value={editingLeader.name} required class="admin-input" />
				</div>

				<div>
					<label for="leader-role" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Role / Title</label>
					<input id="leader-role" type="text" name="role" bind:value={editingLeader.role} placeholder="e.g. Young Adults Pastor" required class="admin-input" />
				</div>

				<div>
					<label for="leader-image" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Avatar / Image URL</label>
					<input id="leader-image" type="text" name="imageUrl" bind:value={editingLeader.imageUrl} placeholder="https://..." class="admin-input" />
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="leader-status" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Status</label>
						<select id="leader-status" name="status" bind:value={editingLeader.status} class="admin-input">
							<option value="PUBLISHED">PUBLISHED</option>
							<option value="DRAFT">DRAFT</option>
						</select>
					</div>
					<div>
						<label for="leader-order" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Display Order</label>
						<input id="leader-order" type="number" name="order" bind:value={editingLeader.order} class="admin-input" />
					</div>
				</div>

				<div class="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--zinc-200)]">
					<button type="button" onclick={closeModal} class="admin-btn-secondary">Cancel</button>
					<button type="submit" class="admin-btn-primary">Save Leader</button>
				</div>
			</form>
		</div>
	</div>
{/if}
