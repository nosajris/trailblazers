<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-zinc-900">System Audit Activity Log</h1>
		<p class="text-sm text-zinc-500">System audit trailing log adopted from kura architecture tracking staff operations.</p>
	</div>

	<div class="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
		<table class="min-w-full divide-y divide-zinc-200">
			<thead class="bg-zinc-50">
				<tr>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Timestamp</th>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">User / Staff</th>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Action</th>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Entity</th>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Details</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-zinc-200 bg-white">
				{#if data.auditLogs.length === 0}
					<tr>
						<td colspan="5" class="px-6 py-8 text-center text-sm text-zinc-500">No activity recorded yet.</td>
					</tr>
				{:else}
					{#each data.auditLogs as log}
						<tr class="hover:bg-zinc-50/50 text-sm">
							<td class="px-6 py-4 text-zinc-400 font-mono text-xs">{new Date(log.createdAt).toLocaleString()}</td>
							<td class="px-6 py-4 font-semibold text-zinc-900">{log.userName}</td>
							<td class="px-6 py-4">
								<span class="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs font-semibold text-zinc-700">{log.action}</span>
							</td>
							<td class="px-6 py-4 text-zinc-600 font-mono text-xs">{log.entityType}</td>
							<td class="px-6 py-4 text-zinc-600">{log.details || '—'}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
