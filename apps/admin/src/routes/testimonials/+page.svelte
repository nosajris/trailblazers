<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showModal = $state(false);
	let editingItem = $state<any>(null);
	let searchQuery = $state('');

	let filteredTestimonials = $derived(
		data.testimonials.filter(
			(t) =>
				t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				t.content.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function openCreate() {
		editingItem = {
			id: '',
			name: '',
			role: '',
			content: '',
			rating: 5,
			isFeatured: false,
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
		const headers = ['ID', 'Author Name', 'Role', 'Content', 'Rating', 'Featured', 'Status'];
		const rows = data.testimonials.map((t) => [
			t.id,
			`"${(t.name || '').replace(/"/g, '""')}"`,
			`"${(t.role || '').replace(/"/g, '""')}"`,
			`"${(t.content || '').replace(/"/g, '""')}"`,
			t.rating,
			t.isFeatured ? 'YES' : 'NO',
			t.status
		]);

		const csvStr = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `testimonials_export_${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-[var(--zinc-900)]">Testimonials & Praise Reports Manager</h1>
			<p class="text-sm text-[var(--zinc-500)]">Manage member testimonies, impact reviews, and site quotes.</p>
		</div>
		<div class="flex items-center gap-3">
			<button onclick={downloadCsv} class="admin-btn-secondary">Export CSV</button>
			<button onclick={openCreate} class="admin-btn-primary">+ Add Testimonial</button>
		</div>
	</div>

	<div class="flex items-center gap-4">
		<input
			type="text"
			placeholder="Search testimonials by author or content..."
			bind:value={searchQuery}
			class="admin-input max-w-md"
		/>
	</div>

	<div class="overflow-hidden admin-card">
		<table class="admin-table">
			<thead>
				<tr>
					<th>Author Name & Role</th>
					<th>Testimonial Quote</th>
					<th>Rating</th>
					<th>Featured</th>
					<th>Status</th>
					<th class="text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#if filteredTestimonials.length === 0}
					<tr>
						<td colspan="6" class="py-8 text-center text-sm text-[var(--zinc-500)]">
							No testimonials found. Click "+ Add Testimonial" to add a praise report.
						</td>
					</tr>
				{:else}
					{#each filteredTestimonials as item}
						<tr>
							<td>
								<div class="font-medium text-[var(--zinc-900)]">{item.name}</div>
								{#if item.role}
									<div class="text-xs text-[var(--zinc-400)]">{item.role}</div>
								{/if}
							</td>
							<td class="text-sm text-[var(--zinc-600)] max-w-md line-clamp-2">{item.content}</td>
							<td class="text-sm text-amber-500 font-bold">{'★'.repeat(item.rating || 5)}</td>
							<td>
								{#if item.isFeatured}
									<span class="admin-badge admin-badge-warning">Featured</span>
								{:else}
									<span class="admin-badge admin-badge-neutral">Standard</span>
								{/if}
							</td>
							<td>
								{#if item.status === 'PUBLISHED'}
									<span class="admin-badge admin-badge-success">Published</span>
								{:else}
									<span class="admin-badge admin-badge-neutral">Draft</span>
								{/if}
							</td>
							<td class="text-right font-medium">
								<button onclick={() => openEdit(item)} class="mr-3 text-[var(--brand-primary)] hover:underline">Edit</button>
								<form action="?/deleteTestimonial" method="POST" class="inline">
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
				{editingItem?.id ? 'Edit Testimonial' : 'Add Testimonial'}
			</h2>
			<form action="?/saveTestimonial" method="POST" class="space-y-4">
				{#if editingItem?.id}
					<input type="hidden" name="id" value={editingItem.id} />
				{/if}

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="test-name" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Author Name</label>
						<input id="test-name" type="text" name="name" bind:value={editingItem.name} required class="admin-input" />
					</div>
					<div>
						<label for="test-role" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Role / Campus</label>
						<input id="test-role" type="text" name="role" bind:value={editingItem.role} placeholder="e.g. Student / Member" class="admin-input" />
					</div>
				</div>

				<div>
					<label for="test-content" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Testimonial Story</label>
					<textarea id="test-content" name="content" bind:value={editingItem.content} rows="4" required class="admin-input"></textarea>
				</div>

				<div class="grid grid-cols-3 gap-4">
					<div>
						<label for="test-rating" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Rating (1-5)</label>
						<input id="test-rating" type="number" min="1" max="5" name="rating" bind:value={editingItem.rating} class="admin-input" />
					</div>
					<div>
						<label for="test-status" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Status</label>
						<select id="test-status" name="status" bind:value={editingItem.status} class="admin-input">
							<option value="PUBLISHED">PUBLISHED</option>
							<option value="DRAFT">DRAFT</option>
						</select>
					</div>
					<div>
						<label for="test-sort" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Sort Order</label>
						<input id="test-sort" type="number" name="sortOrder" bind:value={editingItem.sortOrder} class="admin-input" />
					</div>
				</div>

				<div class="flex items-center space-x-2 pt-2">
					<input id="test-featured" type="checkbox" name="isFeatured" bind:checked={editingItem.isFeatured} class="h-4 w-4 rounded border-[var(--zinc-300)] text-[var(--brand-primary)]" />
					<label for="test-featured" class="text-sm text-[var(--zinc-700)] font-medium">Feature on Homepage</label>
				</div>

				<div class="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--zinc-200)]">
					<button type="button" onclick={closeModal} class="admin-btn-secondary">Cancel</button>
					<button type="submit" class="admin-btn-primary">Save Testimonial</button>
				</div>
			</form>
		</div>
	</div>
{/if}
