<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-8">
	<!-- Page Header -->
	<div>
		<h1 class="text-2xl font-bold text-zinc-900">Dashboard Overview</h1>
		<p class="text-sm text-zinc-500">Welcome to the PAOZ Trailblazers Staff Management Platform.</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
			<div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Published Sermons</div>
			<div class="mt-2 text-3xl font-bold text-zinc-900">{data.stats.totalSermons}</div>
			<a href="/sermons" class="mt-3 inline-block text-xs font-semibold text-brand-primary hover:underline">Manage Sermons →</a>
		</div>

		<div class="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
			<div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Scheduled Events</div>
			<div class="mt-2 text-3xl font-bold text-zinc-900">{data.stats.totalEvents}</div>
			<a href="/events" class="mt-3 inline-block text-xs font-semibold text-brand-primary hover:underline">Manage Events →</a>
		</div>

		<div class="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
			<div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Connect Groups</div>
			<div class="mt-2 text-3xl font-bold text-zinc-900">{data.stats.totalGroups}</div>
			<a href="/groups" class="mt-3 inline-block text-xs font-semibold text-brand-primary hover:underline">Manage Groups →</a>
		</div>

		<div class="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
			<div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Pending Follow-up Tasks</div>
			<div class="mt-2 text-3xl font-bold text-amber-600">{data.stats.pendingTasks}</div>
			<a href="/submissions" class="mt-3 inline-block text-xs font-semibold text-brand-primary hover:underline">View Leads & Tasks →</a>
		</div>
	</div>

	<!-- Audit Activity Log Section -->
	<div class="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
		<div class="flex items-center justify-between mb-4">
			<div>
				<h2 class="text-lg font-bold text-zinc-900">Recent Audit Activity</h2>
				<p class="text-xs text-zinc-500">Real-time system logging adopted from kura architecture.</p>
			</div>
			<a href="/audit-logs" class="text-xs font-semibold text-brand-primary hover:underline">View All Logs</a>
		</div>

		{#if data.recentAuditLogs.length === 0}
			<p class="text-xs text-zinc-500 py-4 text-center">No activity recorded yet.</p>
		{:else}
			<div class="divide-y divide-zinc-100">
				{#each data.recentAuditLogs as log}
					<div class="py-3 flex items-center justify-between text-xs">
						<div class="flex items-center gap-3">
							<span class="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 font-mono font-semibold text-zinc-700">{log.action}</span>
							<span class="font-medium text-zinc-800">{log.details || log.entityType}</span>
						</div>
						<div class="text-zinc-400">
							{log.userName} • {new Date(log.createdAt).toLocaleTimeString()}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
