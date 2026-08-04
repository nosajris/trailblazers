<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');

	let filteredLogs = $derived(
		data.auditLogs.filter(
			(l) =>
				l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(l.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
				(l.details || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
				l.entityType.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function getActionBadgeClass(action: string) {
		const act = action.toUpperCase();
		if (act.includes('CREATE') || act.includes('ADD')) return 'admin-badge-success';
		if (act.includes('UPDATE') || act.includes('EDIT')) return 'admin-badge-warning';
		if (act.includes('DELETE') || act.includes('REMOVE')) return 'admin-badge-danger';
		return 'admin-badge-neutral';
	}

	function downloadCsv() {
		const headers = ['ID', 'Timestamp', 'User Name', 'User ID', 'Action', 'Entity Type', 'Entity ID', 'Details'];
		const rows = data.auditLogs.map((l) => [
			l.id,
			`"${new Date(l.createdAt).toISOString()}"`,
			`"${(l.userName || '').replace(/"/g, '""')}"`,
			l.userId || '',
			l.action,
			l.entityType,
			l.entityId || '',
			`"${(l.details || '').replace(/"/g, '""')}"`
		]);

		const csvStr = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `audit_logs_export_${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-[var(--zinc-900)]">System Audit Activity Log</h1>
			<p class="text-sm text-[var(--zinc-500)]">System audit trailing log tracking staff operations and administrative actions.</p>
		</div>
		<div>
			<button onclick={downloadCsv} class="admin-btn-secondary">Export Audit CSV</button>
		</div>
	</div>

	<div class="flex items-center gap-4">
		<input
			type="text"
			placeholder="Search audit logs by action, user, or details..."
			bind:value={searchQuery}
			class="admin-input max-w-md"
		/>
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
				{#if filteredLogs.length === 0}
					<tr>
						<td colspan="5" class="py-8 text-center text-sm text-[var(--zinc-500)]">No audit activity matching filter.</td>
					</tr>
				{:else}
					{#each filteredLogs as log}
						<tr class="text-sm">
							<td class="text-[var(--zinc-400)] font-mono text-xs">{new Date(log.createdAt).toLocaleString()}</td>
							<td class="font-semibold text-[var(--zinc-900)]">{log.userName || 'System'}</td>
							<td>
								<span class="admin-badge {getActionBadgeClass(log.action)} font-mono">{log.action}</span>
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

