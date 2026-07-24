<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showModal = $state(false);
	let editingSermon = $state<any>(null);

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
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-zinc-900">Sermons & Media CMS Manager</h1>
			<p class="text-sm text-zinc-500">Manage video messages, live stream status, and downloadable study guides.</p>
		</div>
		<button
			onclick={openCreate}
			class="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90"
		>
			+ Add Sermon
		</button>
	</div>

	<div class="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
		<table class="min-w-full divide-y divide-zinc-200">
			<thead class="bg-zinc-50">
				<tr>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Title</th>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Speaker</th>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Scripture</th>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
					<th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-zinc-200 bg-white">
				{#if data.sermons.length === 0}
					<tr>
						<td colspan="5" class="px-6 py-8 text-center text-sm text-zinc-500">No sermons added yet. Click "+ Add Sermon" to create your first message.</td>
					</tr>
				{:else}
					{#each data.sermons as sermon}
						<tr class="hover:bg-zinc-50/50">
							<td class="px-6 py-4">
								<div class="font-medium text-zinc-900">{sermon.title}</div>
								<div class="text-xs text-zinc-400">{sermon.slug}</div>
							</td>
							<td class="px-6 py-4 text-sm text-zinc-600">{sermon.speaker}</td>
							<td class="px-6 py-4 text-sm text-zinc-600">{sermon.scripture || '—'}</td>
							<td class="px-6 py-4 text-sm">
								{#if sermon.isLiveNow}
									<span class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 animate-pulse">● LIVE NOW</span>
								{:else if sermon.isFeatured}
									<span class="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">Featured</span>
								{:else}
									<span class="text-xs text-zinc-400">Standard</span>
								{/if}
							</td>
							<td class="px-6 py-4 text-right text-sm font-medium">
								<button onclick={() => openEdit(sermon)} class="mr-3 text-brand-primary hover:underline">Edit</button>
								<form action="?/deleteSermon" method="POST" class="inline">
									<input type="hidden" name="id" value={sermon.id} />
									<button type="submit" class="text-red-600 hover:underline">Delete</button>
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
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
			<h2 class="text-xl font-bold text-zinc-900 mb-4">
				{editingSermon?.id ? 'Edit Sermon' : 'Add New Sermon'}
			</h2>
			<form action="?/saveSermon" method="POST" class="space-y-4">
				{#if editingSermon?.id}
					<input type="hidden" name="id" value={editingSermon.id} />
				{/if}

				<div>
					<label for="modal-sermon-title" class="block text-xs font-semibold text-zinc-700 uppercase mb-1">Sermon Title</label>
					<input id="modal-sermon-title" type="text" name="title" bind:value={editingSermon.title} required class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none" />
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="modal-sermon-speaker" class="block text-xs font-semibold text-zinc-700 uppercase mb-1">Speaker</label>
						<input id="modal-sermon-speaker" type="text" name="speaker" bind:value={editingSermon.speaker} class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none" />
					</div>
					<div>
						<label for="modal-sermon-scripture" class="block text-xs font-semibold text-zinc-700 uppercase mb-1">Scripture Reference</label>
						<input id="modal-sermon-scripture" type="text" name="scripture" bind:value={editingSermon.scripture} placeholder="e.g. John 3:16" class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none" />
					</div>
				</div>

				<div>
					<label for="modal-sermon-youtube" class="block text-xs font-semibold text-zinc-700 uppercase mb-1">YouTube Video ID</label>
					<input id="modal-sermon-youtube" type="text" name="youtubeId" bind:value={editingSermon.youtubeId} placeholder="e.g. dQw4w9WgXcQ" class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none" />
				</div>

				<div>
					<label for="modal-sermon-summary" class="block text-xs font-semibold text-zinc-700 uppercase mb-1">Summary / Description</label>
					<textarea id="modal-sermon-summary" name="summary" bind:value={editingSermon.summary} rows="2" class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"></textarea>
				</div>

				<div>
					<label for="modal-sermon-guide" class="block text-xs font-semibold text-zinc-700 uppercase mb-1">Small Group Discussion Guide / Questions</label>
					<textarea id="modal-sermon-guide" name="discussionGuide" bind:value={editingSermon.discussionGuide} rows="3" placeholder="1. What resonated with you from today's message?..." class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"></textarea>
				</div>

				<div class="flex items-center space-x-6 pt-2">
					<div class="flex items-center space-x-2">
						<input id="modal-sermon-featured" type="checkbox" name="isFeatured" bind:checked={editingSermon.isFeatured} class="h-4 w-4 rounded border-zinc-300 text-brand-primary focus:ring-brand-primary" />
						<label for="modal-sermon-featured" class="text-sm text-zinc-700 font-medium">Feature on Homepage</label>
					</div>

					<div class="flex items-center space-x-2">
						<input id="modal-sermon-live" type="checkbox" name="isLiveNow" bind:checked={editingSermon.isLiveNow} class="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500" />
						<label for="modal-sermon-live" class="text-sm font-bold text-red-600">LIVE NOW Broadcast</label>
					</div>
				</div>

				<div class="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-200">
					<button type="button" onclick={closeModal} class="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">Cancel</button>
					<button type="submit" class="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90">Save Sermon</button>
				</div>
			</form>
		</div>
	</div>
{/if}
