<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showModal = $state(false);
	let editingPage = $state<any>(null);
	let searchQuery = $state('');

	let filteredPages = $derived(
		data.pages.filter(
			(p) =>
				p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.slug.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function openCreate() {
		editingPage = {
			id: '',
			title: '',
			slug: '',
			status: 'PUBLISHED'
		};
		showModal = true;
	}

	function openEdit(page: any) {
		editingPage = { ...page };
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingPage = null;
	}

	function downloadCsv() {
		const headers = ['ID', 'Page Title', 'Slug Path', 'Status'];
		const rows = data.pages.map((p) => [
			p.id,
			`"${(p.title || '').replace(/"/g, '""')}"`,
			`"${(p.slug || '').replace(/"/g, '""')}"`,
			p.status
		]);

		const csvStr = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `pages_export_${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-[var(--zinc-900)]">Dynamic Landing Pages Manager</h1>
			<p class="text-sm text-[var(--zinc-500)]">Configure CMS pages, route slugs, and dynamic section blocks.</p>
		</div>
		<div class="flex items-center gap-3">
			<button onclick={downloadCsv} class="admin-btn-secondary">Export CSV</button>
			<button onclick={openCreate} class="admin-btn-primary">+ Add Page</button>
		</div>
	</div>

	<div class="flex items-center gap-4">
		<input
			type="text"
			placeholder="Search pages by title or slug..."
			bind:value={searchQuery}
			class="admin-input max-w-md"
		/>
	</div>

	<div class="overflow-hidden admin-card">
		<table class="admin-table">
			<thead>
				<tr>
					<th>Page Title</th>
					<th>URL Path Slug</th>
					<th>Status</th>
					<th class="text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#if filteredPages.length === 0}
					<tr>
						<td colspan="4" class="py-8 text-center text-sm text-[var(--zinc-500)]">
							No dynamic pages configured. Click "+ Add Page" to create a landing page.
						</td>
					</tr>
				{:else}
					{#each filteredPages as item}
						<tr>
							<td class="font-medium text-[var(--zinc-900)]">{item.title}</td>
							<td class="text-sm font-mono text-[var(--brand-primary)]">/{item.slug}</td>
							<td>
								{#if item.status === 'PUBLISHED'}
									<span class="admin-badge admin-badge-success">Published</span>
								{:else}
									<span class="admin-badge admin-badge-neutral">Draft</span>
								{/if}
							</td>
							<td class="text-right font-medium">
								<button onclick={() => openEdit(item)} class="mr-3 text-[var(--brand-primary)] hover:underline">Edit</button>
								<form action="?/deletePage" method="POST" class="inline">
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
		<div class="w-full max-w-md admin-card p-6 shadow-2xl bg-white">
			<h2 class="text-xl font-bold text-[var(--zinc-900)] mb-4">
				{editingPage?.id ? 'Edit Dynamic Page' : 'Add Dynamic Page'}
			</h2>
			<form action="?/savePage" method="POST" class="space-y-4">
				{#if editingPage?.id}
					<input type="hidden" name="id" value={editingPage.id} />
				{/if}

				<div>
					<label for="page-title" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Page Title</label>
					<input id="page-title" type="text" name="title" bind:value={editingPage.title} required class="admin-input" />
				</div>

				<div>
					<label for="page-slug" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">URL Slug (e.g. home, connect)</label>
					<input id="page-slug" type="text" name="slug" bind:value={editingPage.slug} required placeholder="home" class="admin-input" />
				</div>

				<div>
					<label for="page-status" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Status</label>
					<select id="page-status" name="status" bind:value={editingPage.status} class="admin-input">
						<option value="PUBLISHED">PUBLISHED</option>
						<option value="DRAFT">DRAFT</option>
					</select>
				</div>

				<div class="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--zinc-200)]">
					<button type="button" onclick={closeModal} class="admin-btn-secondary">Cancel</button>
					<button type="submit" class="admin-btn-primary">Save Page</button>
				</div>
			</form>
		</div>
	</div>
{/if}
