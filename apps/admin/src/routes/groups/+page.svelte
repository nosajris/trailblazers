<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-[var(--zinc-900)]">Connect Groups & Campus Hubs Manager</h1>
			<p class="text-sm text-[var(--zinc-500)]">Manage small groups, student hubs, and leader contacts.</p>
		</div>
	</div>

	<div class="overflow-hidden admin-card">
		<table class="admin-table">
			<thead>
				<tr>
					<th>Group Name</th>
					<th>Leader</th>
					<th>Type</th>
					<th>Meeting Schedule</th>
				</tr>
			</thead>
			<tbody>
				{#if data.groups.length === 0}
					<tr>
						<td colspan="4" class="py-8 text-center text-sm text-[var(--zinc-500)]">No active connect groups listed yet.</td>
					</tr>
				{:else}
					{#each data.groups as group}
						<tr>
							<td class="font-medium text-[var(--zinc-900)]">{group.name}</td>
							<td class="text-sm text-[var(--zinc-600)]">{group.leader}</td>
							<td>
								<span class="admin-badge admin-badge-neutral">{group.type}</span>
							</td>
							<td class="text-sm text-[var(--zinc-600)]">{group.dayTime}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
