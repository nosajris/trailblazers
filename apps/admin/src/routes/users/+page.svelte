<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showModal = $state(false);
	let editingUser = $state<any>(null);
	let searchQuery = $state('');

	let filteredUsers = $derived(
		data.users.filter(
			(u) =>
				u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(u.role || '').toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function openCreate() {
		editingUser = {
			id: '',
			fullName: '',
			email: '',
			role: 'LEADER',
			avatarUrl: ''
		};
		showModal = true;
	}

	function openEdit(user: any) {
		editingUser = { ...user };
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingUser = null;
	}

	function downloadCsv() {
		const headers = ['ID', 'Full Name', 'Email', 'Role'];
		const rows = data.users.map((u) => [
			u.id,
			`"${(u.fullName || '').replace(/"/g, '""')}"`,
			`"${(u.email || '').replace(/"/g, '""')}"`,
			u.role
		]);

		const csvStr = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `staff_users_export_${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-[var(--zinc-900)]">Staff & User Accounts Management</h1>
			<p class="text-sm text-[var(--zinc-500)]">Manage platform administrators, staff, leaders, and user permissions.</p>
		</div>
		<div class="flex items-center gap-3">
			<button onclick={downloadCsv} class="admin-btn-secondary">Export CSV</button>
			<button onclick={openCreate} class="admin-btn-primary">+ Add Staff User</button>
		</div>
	</div>

	<div class="flex items-center gap-4">
		<input
			type="text"
			placeholder="Search users by name, email, or role..."
			bind:value={searchQuery}
			class="admin-input max-w-md"
		/>
	</div>

	<div class="overflow-hidden admin-card">
		<table class="admin-table">
			<thead>
				<tr>
					<th>User Account</th>
					<th>Role</th>
					<th class="text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#if filteredUsers.length === 0}
					<tr>
						<td colspan="3" class="py-8 text-center text-sm text-[var(--zinc-500)]">
							No users found. Click "+ Add Staff User" to create an account.
						</td>
					</tr>
				{:else}
					{#each filteredUsers as user}
						<tr>
							<td class="font-medium text-[var(--zinc-900)]">
								<div class="flex items-center gap-3">
									{#if user.avatarUrl}
										<img src={user.avatarUrl} alt={user.fullName} class="h-9 w-9 rounded-full object-cover border border-[var(--zinc-200)]" />
									{:else}
										<div class="h-9 w-9 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center font-bold text-xs">
											{user.fullName?.[0] || 'U'}
										</div>
									{/if}
									<div>
										<div>{user.fullName}</div>
										<div class="text-xs text-[var(--zinc-400)]">{user.email}</div>
									</div>
								</div>
							</td>
							<td>
								{#if user.role === 'ADMIN'}
									<span class="admin-badge admin-badge-warning">ADMIN</span>
								{:else if user.role === 'SECRETARY'}
									<span class="admin-badge admin-badge-success">SECRETARY</span>
								{:else if user.role === 'LEADER'}
									<span class="admin-badge admin-badge-neutral">LEADER</span>
								{:else}
									<span class="admin-badge admin-badge-neutral">MEMBER</span>
								{/if}
							</td>
							<td class="text-right font-medium">
								<button onclick={() => openEdit(user)} class="mr-3 text-[var(--brand-primary)] hover:underline">Edit</button>
								<form action="?/deleteUser" method="POST" class="inline">
									<input type="hidden" name="id" value={user.id} />
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
		<div class="w-full max-w-md admin-card p-6 shadow-2xl bg-white">
			<h2 class="text-xl font-bold text-[var(--zinc-900)] mb-4">
				{editingUser?.id ? 'Edit Staff User Account' : 'Add Staff User Account'}
			</h2>
			<form action="?/saveUser" method="POST" class="space-y-4">
				{#if editingUser?.id}
					<input type="hidden" name="id" value={editingUser.id} />
				{/if}

				<div>
					<label for="user-name" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Full Name</label>
					<input id="user-name" type="text" name="fullName" bind:value={editingUser.fullName} required class="admin-input" />
				</div>

				<div>
					<label for="user-email" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Email Address</label>
					<input id="user-email" type="email" name="email" bind:value={editingUser.email} required class="admin-input" />
				</div>

				<div>
					<label for="user-role" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Role / Access Level</label>
					<select id="user-role" name="role" bind:value={editingUser.role} class="admin-input">
						<option value="ADMIN">ADMIN (Full Access)</option>
						<option value="SECRETARY">SECRETARY (CMS & Submissions)</option>
						<option value="LEADER">LEADER (Group Leader)</option>
						<option value="MEMBER">MEMBER (Standard)</option>
					</select>
				</div>

				<div>
					<label for="user-avatar" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Avatar Image URL</label>
					<input id="user-avatar" type="text" name="avatarUrl" bind:value={editingUser.avatarUrl} placeholder="https://..." class="admin-input" />
				</div>

				<div class="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--zinc-200)]">
					<button type="button" onclick={closeModal} class="admin-btn-secondary">Cancel</button>
					<button type="submit" class="admin-btn-primary">Save Account</button>
				</div>
			</form>
		</div>
	</div>
{/if}
