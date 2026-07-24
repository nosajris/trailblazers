<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-zinc-900">Connect Groups & Campus Hubs Manager</h1>
			<p class="text-sm text-zinc-500">Manage small groups, student hubs, and leader contacts.</p>
		</div>
	</div>

	<div class="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
		<table class="min-w-full divide-y divide-zinc-200">
			<thead class="bg-zinc-50">
				<tr>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Group Name</th>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Leader</th>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Type</th>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Meeting Schedule</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-zinc-200 bg-white">
				{#if data.groups.length === 0}
					<tr>
						<td colspan="4" class="px-6 py-8 text-center text-sm text-zinc-500">No active connect groups listed yet.</td>
					</tr>
				{:else}
					{#each data.groups as group}
						<tr class="hover:bg-zinc-50/50">
							<td class="px-6 py-4 font-medium text-zinc-900">{group.name}</td>
							<td class="px-6 py-4 text-sm text-zinc-600">{group.leader}</td>
							<td class="px-6 py-4 text-sm text-zinc-600">
								<span class="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700">{group.type}</span>
							</td>
							<td class="px-6 py-4 text-sm text-zinc-600">{group.dayTime}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
