<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showModal = $state(false);
	let editingEvent = $state<any>(null);

	function openCreate() {
		editingEvent = {
			id: '',
			title: '',
			description: '',
			location: '',
			date: new Date().toISOString().slice(0, 16),
			type: 'MEETUP',
			isFeatured: false
		};
		showModal = true;
	}

	function openEdit(event: any) {
		const formattedDate = event.date ? new Date(event.date).toISOString().slice(0, 16) : '';
		editingEvent = { ...event, date: formattedDate };
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingEvent = null;
	}

	function downloadCsv() {
		const headers = ['ID', 'Title', 'Type', 'Date', 'Location', 'Featured'];
		const rows = data.events.map((e) => [
			e.id,
			`"${e.title.replace(/"/g, '""')}"`,
			e.type,
			`"${new Date(e.date).toISOString()}"`,
			`"${e.location.replace(/"/g, '""')}"`,
			e.isFeatured ? 'YES' : 'NO'
		]);

		const csvStr = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `events_export_${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-zinc-900">Events CMS Manager</h1>
			<p class="text-sm text-zinc-500">Manage national camps, workshops, and campus meetups.</p>
		</div>
		<div class="flex items-center gap-3">
			<button
				onclick={downloadCsv}
				class="rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
			>
				Export CSV
			</button>
			<button
				onclick={openCreate}
				class="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90"
			>
				+ Add Event
			</button>
		</div>
	</div>

	<div class="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
		<table class="min-w-full divide-y divide-zinc-200">
			<thead class="bg-zinc-50">
				<tr>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Title</th>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Type</th>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Date & Location</th>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Featured</th>
					<th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-zinc-200 bg-white">
				{#if data.events.length === 0}
					<tr>
						<td colspan="5" class="px-6 py-8 text-center text-sm text-zinc-500">No events found. Click "+ Add Event" to publish an upcoming gathering.</td>
					</tr>
				{:else}
					{#each data.events as event}
						<tr class="hover:bg-zinc-50/50">
							<td class="px-6 py-4">
								<div class="font-medium text-zinc-900">{event.title}</div>
								<div class="text-xs text-zinc-400 line-clamp-1">{event.description}</div>
							</td>
							<td class="px-6 py-4 text-sm text-zinc-600">
								<span class="inline-flex rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700">{event.type}</span>
							</td>
							<td class="px-6 py-4 text-sm text-zinc-600">
								<div>{new Date(event.date).toLocaleDateString()}</div>
								<div class="text-xs text-zinc-400">{event.location}</div>
							</td>
							<td class="px-6 py-4 text-sm">
								{#if event.isFeatured}
									<span class="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">Featured</span>
								{:else}
									<span class="text-xs text-zinc-400">Standard</span>
								{/if}
							</td>
							<td class="px-6 py-4 text-right text-sm font-medium">
								<button onclick={() => openEdit(event)} class="mr-3 text-brand-primary hover:underline">Edit</button>
								<form action="?/deleteEvent" method="POST" class="inline">
									<input type="hidden" name="id" value={event.id} />
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
		<div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
			<h2 class="text-xl font-bold text-zinc-900 mb-4">
				{editingEvent?.id ? 'Edit Event' : 'Add New Event'}
			</h2>
			<form action="?/saveEvent" method="POST" class="space-y-4">
				{#if editingEvent?.id}
					<input type="hidden" name="id" value={editingEvent.id} />
				{/if}

				<div>
					<label for="admin-event-title" class="block text-xs font-semibold text-zinc-700 uppercase mb-1">Event Title</label>
					<input id="admin-event-title" type="text" name="title" bind:value={editingEvent.title} required class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none" />
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="admin-event-type" class="block text-xs font-semibold text-zinc-700 uppercase mb-1">Event Type</label>
						<select id="admin-event-type" name="type" bind:value={editingEvent.type} class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none">
							<option value="CAMP">CAMP</option>
							<option value="WORKSHOP">WORKSHOP</option>
							<option value="MEETUP">MEETUP</option>
						</select>
					</div>
					<div>
						<label for="admin-event-date" class="block text-xs font-semibold text-zinc-700 uppercase mb-1">Date & Time</label>
						<input id="admin-event-date" type="datetime-local" name="date" bind:value={editingEvent.date} required class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none" />
					</div>
				</div>

				<div>
					<label for="admin-event-location" class="block text-xs font-semibold text-zinc-700 uppercase mb-1">Location / Venue</label>
					<input id="admin-event-location" type="text" name="location" bind:value={editingEvent.location} required class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none" />
				</div>

				<div>
					<label for="admin-event-desc" class="block text-xs font-semibold text-zinc-700 uppercase mb-1">Description</label>
					<textarea id="admin-event-desc" name="description" bind:value={editingEvent.description} rows="3" class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"></textarea>
				</div>

				<div class="flex items-center space-x-2 pt-2">
					<input id="admin-event-featured" type="checkbox" name="isFeatured" bind:checked={editingEvent.isFeatured} class="h-4 w-4 rounded border-zinc-300 text-brand-primary focus:ring-brand-primary" />
					<label for="admin-event-featured" class="text-sm text-zinc-700 font-medium">Feature this event on Homepage</label>
				</div>

				<div class="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-200">
					<button type="button" onclick={closeModal} class="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">Cancel</button>
					<button type="submit" class="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90">Save Event</button>
				</div>
			</form>
		</div>
	</div>
{/if}
