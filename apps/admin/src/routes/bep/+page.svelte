<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showModal = $state(false);
	let editingProfile = $state<any>(null);
	let searchQuery = $state('');

	let filteredProfiles = $derived(
		data.profiles.filter(
			(p) =>
				p.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.description.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function openCreate() {
		editingProfile = {
			id: '',
			businessName: '',
			industry: '',
			description: '',
			websiteUrl: '',
			isVerified: true,
			status: 'PUBLISHED',
			sortOrder: 0
		};
		showModal = true;
	}

	function openEdit(profile: any) {
		editingProfile = { ...profile };
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingProfile = null;
	}

	function downloadCsv() {
		const headers = ['ID', 'Business Name', 'Industry', 'Website', 'Verified', 'Status'];
		const rows = data.profiles.map((p) => [
			p.id,
			`"${(p.businessName || '').replace(/"/g, '""')}"`,
			`"${(p.industry || '').replace(/"/g, '""')}"`,
			`"${(p.websiteUrl || '').replace(/"/g, '""')}"`,
			p.isVerified ? 'YES' : 'NO',
			p.status
		]);

		const csvStr = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `bep_business_export_${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-[var(--zinc-900)]">BEP Business & Entrepreneur Directory</h1>
			<p class="text-sm text-[var(--zinc-500)]">Manage verified kingdom business profiles and Believers Education Program listings.</p>
		</div>
		<div class="flex items-center gap-3">
			<button onclick={downloadCsv} class="admin-btn-secondary">Export CSV</button>
			<button onclick={openCreate} class="admin-btn-primary">+ Add Business Profile</button>
		</div>
	</div>

	<div class="flex items-center gap-4">
		<input
			type="text"
			placeholder="Search businesses by name, industry, or description..."
			bind:value={searchQuery}
			class="admin-input max-w-md"
		/>
	</div>

	<div class="overflow-hidden admin-card">
		<table class="admin-table">
			<thead>
				<tr>
					<th>Business Name</th>
					<th>Industry</th>
					<th>Website</th>
					<th>Verified</th>
					<th>Status</th>
					<th class="text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#if filteredProfiles.length === 0}
					<tr>
						<td colspan="6" class="py-8 text-center text-sm text-[var(--zinc-500)]">
							No BEP business profiles found. Click "+ Add Business Profile" to add one.
						</td>
					</tr>
				{:else}
					{#each filteredProfiles as profile}
						<tr>
							<td class="font-medium text-[var(--zinc-900)]">
								<div>{profile.businessName}</div>
								<div class="text-xs text-[var(--zinc-400)] line-clamp-1">{profile.description}</div>
							</td>
							<td>
								<span class="admin-badge admin-badge-neutral">{profile.industry}</span>
							</td>
							<td class="text-sm text-[var(--zinc-600)]">
								{#if profile.websiteUrl}
									<a href={profile.websiteUrl} target="_blank" class="text-[var(--brand-primary)] hover:underline truncate block max-w-xs">{profile.websiteUrl}</a>
								{:else}
									<span class="text-[var(--zinc-400)]">N/A</span>
								{/if}
							</td>
							<td>
								{#if profile.isVerified}
									<span class="admin-badge admin-badge-success">Verified ✓</span>
								{:else}
									<span class="admin-badge admin-badge-warning">Unverified</span>
								{/if}
							</td>
							<td>
								{#if profile.status === 'PUBLISHED'}
									<span class="admin-badge admin-badge-success">Published</span>
								{:else}
									<span class="admin-badge admin-badge-neutral">Draft</span>
								{/if}
							</td>
							<td class="text-right font-medium">
								<button onclick={() => openEdit(profile)} class="mr-3 text-[var(--brand-primary)] hover:underline">Edit</button>
								<form action="?/deleteBepProfile" method="POST" class="inline">
									<input type="hidden" name="id" value={profile.id} />
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
				{editingProfile?.id ? 'Edit BEP Business Profile' : 'Add BEP Business Profile'}
			</h2>
			<form action="?/saveBepProfile" method="POST" class="space-y-4">
				{#if editingProfile?.id}
					<input type="hidden" name="id" value={editingProfile.id} />
				{/if}

				<div>
					<label for="bep-name" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Business Name</label>
					<input id="bep-name" type="text" name="businessName" bind:value={editingProfile.businessName} required class="admin-input" />
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="bep-industry" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Industry / Category</label>
						<input id="bep-industry" type="text" name="industry" bind:value={editingProfile.industry} required placeholder="e.g. Technology, Design" class="admin-input" />
					</div>
					<div>
						<label for="bep-website" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Website URL</label>
						<input id="bep-website" type="text" name="websiteUrl" bind:value={editingProfile.websiteUrl} placeholder="https://..." class="admin-input" />
					</div>
				</div>

				<div>
					<label for="bep-desc" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Description & Services</label>
					<textarea id="bep-desc" name="description" bind:value={editingProfile.description} rows="3" required class="admin-input"></textarea>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="bep-status" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Status</label>
						<select id="bep-status" name="status" bind:value={editingProfile.status} class="admin-input">
							<option value="PUBLISHED">PUBLISHED</option>
							<option value="DRAFT">DRAFT</option>
						</select>
					</div>
					<div>
						<label for="bep-sort" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Sort Order</label>
						<input id="bep-sort" type="number" name="sortOrder" bind:value={editingProfile.sortOrder} class="admin-input" />
					</div>
				</div>

				<div class="flex items-center space-x-2 pt-2">
					<input id="bep-verified" type="checkbox" name="isVerified" bind:checked={editingProfile.isVerified} class="h-4 w-4 rounded border-[var(--zinc-300)] text-[var(--brand-primary)]" />
					<label for="bep-verified" class="text-sm text-[var(--zinc-700)] font-medium">Verified Kingdom Partner</label>
				</div>

				<div class="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--zinc-200)]">
					<button type="button" onclick={closeModal} class="admin-btn-secondary">Cancel</button>
					<button type="submit" class="admin-btn-primary">Save Profile</button>
				</div>
			</form>
		</div>
	</div>
{/if}
