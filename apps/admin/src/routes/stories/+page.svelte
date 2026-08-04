<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showModal = $state(false);
	let editingPost = $state<any>(null);
	let searchQuery = $state('');

	let filteredPosts = $derived(
		data.posts.filter(
			(p) =>
				p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(p.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
				(p.summary || '').toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function openCreate() {
		editingPost = {
			id: '',
			title: '',
			category: 'Life Testimony',
			summary: '',
			content: '',
			imageUrl: '',
			status: 'PUBLISHED'
		};
		showModal = true;
	}

	function openEdit(post: any) {
		editingPost = { ...post };
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingPost = null;
	}

	function downloadCsv() {
		const headers = ['ID', 'Title', 'Category', 'Summary', 'Status', 'Created Date'];
		const rows = data.posts.map((p) => [
			p.id,
			`"${(p.title || '').replace(/"/g, '""')}"`,
			`"${(p.category || '').replace(/"/g, '""')}"`,
			`"${(p.summary || '').replace(/"/g, '""')}"`,
			p.status,
			`"${new Date(p.createdAt).toISOString()}"`
		]);

		const csvStr = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `stories_export_${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-[var(--zinc-900)]">Transformation Stories & Articles Manager</h1>
			<p class="text-sm text-[var(--zinc-500)]">Draft, edit, and publish life testimonies and blog stories.</p>
		</div>
		<div class="flex items-center gap-3">
			<button onclick={downloadCsv} class="admin-btn-secondary">Export CSV</button>
			<button onclick={openCreate} class="admin-btn-primary">+ Add Story</button>
		</div>
	</div>

	<div class="flex items-center gap-4">
		<input
			type="text"
			placeholder="Search stories by title, category, or summary..."
			bind:value={searchQuery}
			class="admin-input max-w-md"
		/>
	</div>

	<div class="overflow-hidden admin-card">
		<table class="admin-table">
			<thead>
				<tr>
					<th>Title</th>
					<th>Category</th>
					<th>Summary</th>
					<th>Status</th>
					<th>Created Date</th>
					<th class="text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#if filteredPosts.length === 0}
					<tr>
						<td colspan="6" class="py-8 text-center text-sm text-[var(--zinc-500)]">
							No stories found. Click "+ Add Story" to create a new post.
						</td>
					</tr>
				{:else}
					{#each filteredPosts as post}
						<tr>
							<td class="font-medium text-[var(--zinc-900)]">{post.title}</td>
							<td>
								<span class="admin-badge admin-badge-neutral">{post.category || 'Story'}</span>
							</td>
							<td class="text-sm text-[var(--zinc-600)] line-clamp-1">{post.summary}</td>
							<td>
								{#if post.status === 'PUBLISHED'}
									<span class="admin-badge admin-badge-success">Published</span>
								{:else}
									<span class="admin-badge admin-badge-neutral">Draft</span>
								{/if}
							</td>
							<td class="text-sm text-[var(--zinc-400)]">{new Date(post.createdAt).toLocaleDateString()}</td>
							<td class="text-right font-medium">
								<button onclick={() => openEdit(post)} class="mr-3 text-[var(--brand-primary)] hover:underline">Edit</button>
								<form action="?/deletePost" method="POST" class="inline">
									<input type="hidden" name="id" value={post.id} />
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
		<div class="w-full max-w-2xl admin-card p-6 shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
			<h2 class="text-xl font-bold text-[var(--zinc-900)] mb-4">
				{editingPost?.id ? 'Edit Story / Article' : 'Add New Story / Article'}
			</h2>
			<form action="?/savePost" method="POST" class="space-y-4">
				{#if editingPost?.id}
					<input type="hidden" name="id" value={editingPost.id} />
				{/if}

				<div>
					<label for="story-title" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Title</label>
					<input id="story-title" type="text" name="title" bind:value={editingPost.title} required class="admin-input" />
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="story-category" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Category</label>
						<input id="story-category" type="text" name="category" bind:value={editingPost.category} placeholder="e.g. Life Testimony, Teaching" class="admin-input" />
					</div>
					<div>
						<label for="story-status" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Status</label>
						<select id="story-status" name="status" bind:value={editingPost.status} class="admin-input">
							<option value="PUBLISHED">PUBLISHED</option>
							<option value="DRAFT">DRAFT</option>
						</select>
					</div>
				</div>

				<div>
					<label for="story-image" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Featured Cover Image URL</label>
					<input id="story-image" type="text" name="imageUrl" bind:value={editingPost.imageUrl} placeholder="https://..." class="admin-input" />
				</div>

				<div>
					<label for="story-summary" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Short Summary</label>
					<textarea id="story-summary" name="summary" bind:value={editingPost.summary} rows="2" required class="admin-input"></textarea>
				</div>

				<div>
					<label for="story-content" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Full Article / Testimony Content</label>
					<textarea id="story-content" name="content" bind:value={editingPost.content} rows="6" class="admin-input"></textarea>
				</div>

				<div class="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--zinc-200)]">
					<button type="button" onclick={closeModal} class="admin-btn-secondary">Cancel</button>
					<button type="submit" class="admin-btn-primary">Save Story</button>
				</div>
			</form>
		</div>
	</div>
{/if}

