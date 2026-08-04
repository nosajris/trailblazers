<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showModal = $state(false);
	let editingGroup = $state<any>(null);
	let searchQuery = $state('');

	let filteredGroups = $derived(
		data.groups.filter(
			(g) =>
				g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				g.leader.toLowerCase().includes(searchQuery.toLowerCase()) ||
				g.type.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function openCreate() {
		editingGroup = {
			id: '',
			name: '',
			leader: '',
			dayTime: '',
			type: 'CAMPUS',
			imageUrl: '',
			description: '',
			status: 'PUBLISHED',
			sortOrder: 0
		};
		showModal = true;
	}

	function openEdit(group: any) {
		editingGroup = { ...group };
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingGroup = null;
	}

	function downloadCsv() {
		const headers = ['ID', 'Name', 'Leader', 'Schedule', 'Type', 'Status', 'Description'];
		const rows = data.groups.map((g) => [
			g.id,
			`"${(g.name || '').replace(/"/g, '""')}"`,
			`"${(g.leader || '').replace(/"/g, '""')}"`,
			`"${(g.dayTime || '').replace(/"/g, '""')}"`,
			g.type,
			g.status,
			`"${(g.description || '').replace(/"/g, '""')}"`
		]);

		const csvStr = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `groups_export_${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-[var(--zinc-900)]">Connect Groups & Campus Hubs Manager</h1>
			<p class="text-sm text-[var(--zinc-500)]">Manage small groups, student hubs, and leader contacts.</p>
		</div>
		<div class="flex items-center gap-3">
			<button onclick={downloadCsv} class="admin-btn-secondary">Export CSV</button>
			<button onclick={openCreate} class="admin-btn-primary">+ Add Group</button>
		</div>
	</div>

	<div class="flex items-center gap-4">
		<input
			type="text"
			placeholder="Search groups by name, leader, or type..."
			bind:value={searchQuery}
			class="admin-input max-w-md"
		/>
	</div>

	<div class="overflow-hidden admin-card">
		<table class="admin-table">
			<thead>
				<tr>
					<th>Group Name</th>
					<th>Leader</th>
					<th>Type</th>
					<th>Meeting Schedule</th>
					<th>Status</th>
					<th class="text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#if filteredGroups.length === 0}
					<tr>
						<td colspan="6" class="py-8 text-center text-sm text-[var(--zinc-500)]">
							No connect groups found. Click "+ Add Group" to create one.
						</td>
					</tr>
				{:else}
					{#each filteredGroups as group}
						<tr>
							<td class="font-medium text-[var(--zinc-900)]">
								<div>{group.name}</div>
								{#if group.description}
									<div class="text-xs text-[var(--zinc-400)] line-clamp-1">{group.description}</div>
								{/if}
							</td>
							<td class="text-sm text-[var(--zinc-600)]">{group.leader}</td>
							<td>
								<span class="admin-badge admin-badge-neutral">{group.type}</span>
							</td>
							<td class="text-sm text-[var(--zinc-600)]">{group.dayTime}</td>
							<td>
								{#if group.status === 'PUBLISHED'}
									<span class="admin-badge admin-badge-success">Published</span>
								{:else}
									<span class="admin-badge admin-badge-neutral">Draft</span>
								{/if}
							</td>
							<td class="text-right font-medium">
								<button onclick={() => openEdit(group)} class="mr-3 text-[var(--brand-primary)] hover:underline">Edit</button>
								<form action="?/deleteGroup" method="POST" class="inline">
									<input type="hidden" name="id" value={group.id} />
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
				{editingGroup?.id ? 'Edit Connect Group' : 'Add Connect Group'}
			</h2>
			<form action="?/saveGroup" method="POST" class="space-y-4">
				{#if editingGroup?.id}
					<input type="hidden" name="id" value={editingGroup.id} />
				{/if}

				<div>
					<label for="group-name" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Group Name</label>
					<input id="group-name" type="text" name="name" bind:value={editingGroup.name} required class="admin-input" />
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="group-leader" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Leader Name</label>
						<input id="group-leader" type="text" name="leader" bind:value={editingGroup.leader} required class="admin-input" />
					</div>
					<div>
						<label for="group-type" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Group Type</label>
						<select id="group-type" name="type" bind:value={editingGroup.type} class="admin-input">
							<option value="CAMPUS">CAMPUS</option>
							<option value="PRO">PRO</option>
							<option value="INTEREST">INTEREST</option>
							<option value="ONLINE">ONLINE</option>
						</select>
					</div>
				</div>

				<div>
					<label for="group-daytime" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Meeting Schedule (Day & Time)</label>
					<input id="group-daytime" type="text" name="dayTime" bind:value={editingGroup.dayTime} placeholder="e.g. Wednesdays @ 7:00 PM" required class="admin-input" />
				</div>

				<div>
					<label for="group-image" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Image URL (Optional)</label>
					<input id="group-image" type="text" name="imageUrl" bind:value={editingGroup.imageUrl} placeholder="https://..." class="admin-input" />
				</div>

				<div>
					<label for="group-desc" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Description</label>
					<textarea id="group-desc" name="description" bind:value={editingGroup.description} rows="3" class="admin-input"></textarea>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="group-status" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Status</label>
						<select id="group-status" name="status" bind:value={editingGroup.status} class="admin-input">
							<option value="PUBLISHED">PUBLISHED</option>
							<option value="DRAFT">DRAFT</option>
						</select>
					</div>
					<div>
						<label for="group-sort" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Sort Order</label>
						<input id="group-sort" type="number" name="sortOrder" bind:value={editingGroup.sortOrder} class="admin-input" />
					</div>
				</div>

				<div class="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--zinc-200)]">
					<button type="button" onclick={closeModal} class="admin-btn-secondary">Cancel</button>
					<button type="submit" class="admin-btn-primary">Save Group</button>
				</div>
			</form>
		</div>
	</div>
{/if}

