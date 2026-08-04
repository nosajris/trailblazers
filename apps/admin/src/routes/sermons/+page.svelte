<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showModal = $state(false);
	let showSeriesModal = $state(false);
	let editingSermon = $state<any>(null);
	let newSeries = $state({ title: '', description: '', coverImageUrl: '' });

	function openCreate() {
		editingSermon = {
			id: '',
			title: '',
			speaker: 'Pastor / Speaker',
			videoUrl: '',
			youtubeId: '',
			audioUrl: '',
			scripture: '',
			summary: '',
			notes: '',
			discussionGuide: '',
			notesUrl: '',
			isFeatured: false,
			isLiveNow: false
		};
		showModal = true;
	}

	function openEdit(sermon: any) {
		editingSermon = { ...sermon };
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingSermon = null;
	}

	function openSeriesModal() {
		newSeries = { title: '', description: '', coverImageUrl: '' };
		showSeriesModal = true;
	}

	function closeSeriesModal() {
		showSeriesModal = false;
	}

	function downloadCsv() {
		const headers = ['ID', 'Title', 'Speaker', 'Scripture', 'Featured', 'Live Now', 'YouTube ID'];
		const rows = data.sermons.map((s) => [
			s.id,
			`"${(s.title || '').replace(/"/g, '""')}"`,
			`"${(s.speaker || '').replace(/"/g, '""')}"`,
			`"${(s.scripture || '').replace(/"/g, '""')}"`,
			s.isFeatured ? 'YES' : 'NO',
			s.isLiveNow ? 'YES' : 'NO',
			s.youtubeId || ''
		]);

		const csvStr = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `sermons_export_${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-[var(--zinc-900)]">Sermons & Media CMS Manager</h1>
			<p class="text-sm text-[var(--zinc-500)]">Manage video messages, sermon series, live stream status, and study guides.</p>
		</div>
		<div class="flex items-center gap-3">
			<button onclick={downloadCsv} class="admin-btn-secondary">Export CSV</button>
			<button onclick={openSeriesModal} class="admin-btn-secondary">+ Add Series</button>
			<button onclick={openCreate} class="admin-btn-primary">+ Add Sermon</button>
		</div>
	</div>

	<!-- Sermon Series Section -->
	<div class="admin-card p-6">
		<h2 class="text-lg font-bold text-[var(--zinc-900)] mb-4">Teaching Series & Playlists</h2>
		{#if data.series.length === 0}
			<p class="text-sm text-[var(--zinc-500)] py-4 text-center">No sermon series created yet.</p>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				{#each data.series as item}
					<div class="p-4 rounded-xl border border-[var(--zinc-200)] bg-[var(--zinc-50)] flex items-center justify-between">
						<div>
							<div class="font-bold text-sm text-[var(--zinc-900)]">{item.title}</div>
							{#if item.description}
								<div class="text-xs text-[var(--zinc-500)] line-clamp-1">{item.description}</div>
							{/if}
						</div>
						<form action="?/deleteSeries" method="POST">
							<input type="hidden" name="id" value={item.id} />
							<button type="submit" class="text-[var(--color-danger-fg)] text-xs hover:underline">Delete</button>
						</form>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Sermons Table -->
	<div class="overflow-hidden admin-card">
		<table class="admin-table">
			<thead>
				<tr>
					<th>Title</th>
					<th>Speaker</th>
					<th>Scripture</th>
					<th>Status</th>
					<th class="text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#if data.sermons.length === 0}
					<tr>
						<td colspan="5" class="py-8 text-center text-sm text-[var(--zinc-500)]">No sermons added yet. Click "+ Add Sermon" to create your first message.</td>
					</tr>
				{:else}
					{#each data.sermons as sermon}
						<tr>
							<td>
								<div class="font-medium text-[var(--zinc-900)]">{sermon.title}</div>
								<div class="text-xs text-[var(--zinc-400)]">{sermon.slug}</div>
							</td>
							<td class="text-sm text-[var(--zinc-600)]">{sermon.speaker}</td>
							<td class="text-sm text-[var(--zinc-600)]">{sermon.scripture || '—'}</td>
							<td>
								{#if sermon.isLiveNow}
									<span class="admin-badge admin-badge-danger animate-pulse">● LIVE NOW</span>
								{:else if sermon.isFeatured}
									<span class="admin-badge admin-badge-warning">Featured</span>
								{:else}
									<span class="admin-badge admin-badge-neutral">Standard</span>
								{/if}
							</td>
							<td class="text-right font-medium">
								<button onclick={() => openEdit(sermon)} class="mr-3 text-[var(--brand-primary)] hover:underline">Edit</button>
								<form action="?/deleteSermon" method="POST" class="inline">
									<input type="hidden" name="id" value={sermon.id} />
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
		<div class="w-full max-w-lg max-h-[90vh] overflow-y-auto admin-card p-6 shadow-2xl bg-white">
			<h2 class="text-xl font-bold text-[var(--zinc-900)] mb-4">
				{editingSermon?.id ? 'Edit Sermon' : 'Add New Sermon'}
			</h2>
			<form action="?/saveSermon" method="POST" class="space-y-4">
				{#if editingSermon?.id}
					<input type="hidden" name="id" value={editingSermon.id} />
				{/if}

				<div>
					<label for="modal-sermon-title" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Sermon Title</label>
					<input id="modal-sermon-title" type="text" name="title" bind:value={editingSermon.title} required class="admin-input" />
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="modal-sermon-speaker" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Speaker</label>
						<input id="modal-sermon-speaker" type="text" name="speaker" bind:value={editingSermon.speaker} class="admin-input" />
					</div>
					<div>
						<label for="modal-sermon-scripture" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Scripture Reference</label>
						<input id="modal-sermon-scripture" type="text" name="scripture" bind:value={editingSermon.scripture} placeholder="e.g. John 3:16" class="admin-input" />
					</div>
				</div>

				<div>
					<label for="modal-sermon-youtube" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">YouTube Video ID</label>
					<input id="modal-sermon-youtube" type="text" name="youtubeId" bind:value={editingSermon.youtubeId} placeholder="e.g. dQw4w9WgXcQ" class="admin-input" />
				</div>

				<div>
					<label for="modal-sermon-summary" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Summary / Description</label>
					<textarea id="modal-sermon-summary" name="summary" bind:value={editingSermon.summary} rows="2" class="admin-input"></textarea>
				</div>

				<div>
					<label for="modal-sermon-guide" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Small Group Discussion Guide / Questions</label>
					<textarea id="modal-sermon-guide" name="discussionGuide" bind:value={editingSermon.discussionGuide} rows="3" placeholder="1. What resonated with you from today's message?..." class="admin-input"></textarea>
				</div>

				<div class="flex items-center space-x-6 pt-2">
					<div class="flex items-center space-x-2">
						<input id="modal-sermon-featured" type="checkbox" name="isFeatured" bind:checked={editingSermon.isFeatured} class="h-4 w-4 rounded border-[var(--zinc-300)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]" />
						<label for="modal-sermon-featured" class="text-sm text-[var(--zinc-700)] font-medium">Feature on Homepage</label>
					</div>

					<div class="flex items-center space-x-2">
						<input id="modal-sermon-live" type="checkbox" name="isLiveNow" bind:checked={editingSermon.isLiveNow} class="h-4 w-4 rounded border-[var(--zinc-300)] text-[var(--color-danger-fg)] focus:ring-[var(--color-danger-fg)]" />
						<label for="modal-sermon-live" class="text-sm font-bold text-[var(--color-danger-fg)]">LIVE NOW Broadcast</label>
					</div>
				</div>

				<div class="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--zinc-200)]">
					<button type="button" onclick={closeModal} class="admin-btn-secondary">Cancel</button>
					<button type="submit" class="admin-btn-primary">Save Sermon</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if showSeriesModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
		<div class="w-full max-w-md admin-card p-6 shadow-2xl bg-white">
			<h2 class="text-xl font-bold text-[var(--zinc-900)] mb-4">Add Teaching Series</h2>
			<form action="?/createSeries" method="POST" class="space-y-4">
				<div>
					<label for="series-title" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Series Title</label>
					<input id="series-title" type="text" name="title" bind:value={newSeries.title} required class="admin-input" />
				</div>

				<div>
					<label for="series-desc" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Description</label>
					<textarea id="series-desc" name="description" bind:value={newSeries.description} rows="3" class="admin-input"></textarea>
				</div>

				<div>
					<label for="series-cover" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Cover Image URL</label>
					<input id="series-cover" type="text" name="coverImageUrl" bind:value={newSeries.coverImageUrl} placeholder="https://..." class="admin-input" />
				</div>

				<div class="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--zinc-200)]">
					<button type="button" onclick={closeSeriesModal} class="admin-btn-secondary">Cancel</button>
					<button type="submit" class="admin-btn-primary">Save Series</button>
				</div>
			</form>
		</div>
	</div>
{/if}

