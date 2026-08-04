<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-[var(--zinc-900)]">System Audit Activity Log</h1>
		<p class="text-sm text-[var(--zinc-500)]">System audit trailing log tracking staff operations.</p>
	</div>

	<div class="overflow-hidden admin-card">
		<table class="admin-table">
			<thead>
				<tr>
					<th>Timestamp</th>
					<th>User / Staff</th>
					<th>Action</th>
					<th>Entity</th>
					<th>Details</th>
				</tr>
			</thead>
			<tbody>
				{#if data.auditLogs.length === 0}
					<tr>
						<td colspan="5" class="py-8 text-center text-sm text-[var(--zinc-500)]">No activity recorded yet.</td>
					</tr>
				{:else}
					{#each data.auditLogs as log}
						<tr class="text-sm">
							<td class="text-[var(--zinc-400)] font-mono text-xs">{new Date(log.createdAt).toLocaleString()}</td>
							<td class="font-semibold text-[var(--zinc-900)]">{log.userName}</td>
							<td>
								<span class="admin-badge admin-badge-neutral font-mono">{log.action}</span>
							</td>
							<td class="text-[var(--zinc-600)] font-mono text-xs">{log.entityType}</td>
							<td class="text-[var(--zinc-600)]">{log.details || '—'}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
