<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	function getActionBadgeClass(action: string) {
		const act = action.toUpperCase();
		if (act.includes('CREATE') || act.includes('ADD')) return 'admin-badge-success';
		if (act.includes('UPDATE') || act.includes('EDIT')) return 'admin-badge-warning';
		if (act.includes('DELETE') || act.includes('REMOVE')) return 'admin-badge-danger';
		return 'admin-badge-neutral';
	}
</script>

<div class="space-y-8">
	<!-- Page Header & Quick Actions Bar -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight text-zinc-900">Dashboard Overview</h1>
			<p class="text-sm text-zinc-500">Welcome to the PAOZ Trailblazers Staff Management Platform.</p>
		</div>

		<div class="dashboard-quick-actions flex flex-wrap items-center gap-2.5">
			<a href="/sermons" class="admin-btn-primary text-xs py-2 px-3">
				<svg class="mr-1.5 h-3.5 w-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
				+ New Sermon
			</a>
			<a href="/events" class="admin-btn-secondary text-xs py-2 px-3">
				<svg class="mr-1.5 h-3.5 w-3.5 text-brand-primary fill-none stroke-current stroke-2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
				+ New Event
			</a>
			<a href="/submissions" class="admin-btn-secondary text-xs py-2 px-3">
				<svg class="mr-1.5 h-3.5 w-3.5 text-zinc-600 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
				View Leads
			</a>
		</div>
	</div>

	<!-- Interactive KPI Stats Grid -->
	<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
		<!-- Stat Card 1: Sermons -->
		<div class="stat-card admin-card admin-card-hover p-5 relative overflow-hidden group bg-white border border-zinc-200 rounded-xl shadow-sm">
			<div class="flex items-center justify-between">
				<div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Published Sermons</div>
				<div class="h-8 w-8 rounded-lg bg-[var(--brand-primary-muted,rgba(249,92,75,0.15))] text-brand-primary flex items-center justify-center">
					<svg class="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
				</div>
			</div>
			<div class="mt-3 flex items-baseline gap-2">
				<span class="text-3xl font-bold text-zinc-900">{data.stats.totalSermons}</span>
				<span class="text-xs text-zinc-400 font-medium">media items</span>
			</div>
			<div class="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
				<a href="/sermons" class="font-semibold text-brand-primary hover:underline flex items-center gap-1">
					Manage Sermons
					<svg class="h-3 w-3 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				</a>
			</div>
		</div>

		<!-- Stat Card 2: Events -->
		<div class="stat-card admin-card admin-card-hover p-5 relative overflow-hidden group bg-white border border-zinc-200 rounded-xl shadow-sm">
			<div class="flex items-center justify-between">
				<div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Scheduled Events</div>
				<div class="h-8 w-8 rounded-lg bg-[var(--brand-primary-muted,rgba(249,92,75,0.15))] text-brand-primary flex items-center justify-center">
					<svg class="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
				</div>
			</div>
			<div class="mt-3 flex items-baseline gap-2">
				<span class="text-3xl font-bold text-zinc-900">{data.stats.totalEvents}</span>
				<span class="text-xs text-zinc-400 font-medium">upcoming</span>
			</div>
			<div class="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
				<a href="/events" class="font-semibold text-brand-primary hover:underline flex items-center gap-1">
					Manage Events
					<svg class="h-3 w-3 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				</a>
			</div>
		</div>

		<!-- Stat Card 3: Groups -->
		<div class="stat-card admin-card admin-card-hover p-5 relative overflow-hidden group bg-white border border-zinc-200 rounded-xl shadow-sm">
			<div class="flex items-center justify-between">
				<div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Connect Groups</div>
				<div class="h-8 w-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
					<svg class="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
				</div>
			</div>
			<div class="mt-3 flex items-baseline gap-2">
				<span class="text-3xl font-bold text-zinc-900">{data.stats.totalGroups}</span>
				<span class="text-xs text-zinc-400 font-medium">active hubs</span>
			</div>
			<div class="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
				<a href="/groups" class="font-semibold text-brand-primary hover:underline flex items-center gap-1">
					Manage Groups
					<svg class="h-3 w-3 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				</a>
			</div>
		</div>

		<!-- Stat Card 4: Tasks -->
		<div class="stat-card admin-card admin-card-hover p-5 relative overflow-hidden group bg-white border border-zinc-200 rounded-xl shadow-sm">
			<div class="flex items-center justify-between">
				<div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Pending Follow-up Tasks</div>
				<div class="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
					<svg class="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
				</div>
			</div>
			<div class="mt-3 flex items-baseline gap-2">
				<span class="text-3xl font-bold text-amber-700">{data.stats.pendingTasks}</span>
				{#if data.stats.pendingTasks > 0}
					<span class="admin-badge admin-badge-warning text-[10px]">Action Needed</span>
				{:else}
					<span class="admin-badge admin-badge-success text-[10px]">All Clear</span>
				{/if}
			</div>
			<div class="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
				<a href="/submissions" class="font-semibold text-brand-primary hover:underline flex items-center gap-1">
					View Leads & Tasks
					<svg class="h-3 w-3 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				</a>
			</div>
		</div>
	</div>

	<!-- Main Content Section: Audit Logs + System Summary -->
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- Audit Activity Feed (2 Cols) -->
		<div class="admin-card p-6 lg:col-span-2 bg-white border border-zinc-200 rounded-xl shadow-sm">
			<div class="flex items-center justify-between mb-6 pb-3 border-b border-zinc-100">
				<div>
					<h2 class="text-base font-bold text-zinc-900">Recent Audit Activity</h2>
					<p class="text-xs text-zinc-500">Real-time system logging tracking staff operations.</p>
				</div>
				<a href="/audit-logs" class="admin-btn-secondary text-xs py-1.5 px-3">
					View All Logs →
				</a>
			</div>

			{#if data.recentAuditLogs.length === 0}
				<div class="py-12 text-center text-xs text-zinc-500">
					No activity recorded yet.
				</div>
			{:else}
				<div class="divide-y divide-zinc-100">
					{#each data.recentAuditLogs as log}
						<div class="py-3.5 flex items-center justify-between text-xs group hover:bg-zinc-50 px-2 rounded-lg transition">
							<div class="flex items-center gap-3">
								<div class="h-7 w-7 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold text-[11px] border border-zinc-200">
									{log.userName?.[0] || 'S'}
								</div>
								<div>
									<div class="flex items-center gap-2">
										<span class="admin-badge {getActionBadgeClass(log.action)} font-mono text-[10px] uppercase">
											{log.action}
										</span>
										<span class="font-semibold text-zinc-800">{log.details || log.entityType}</span>
									</div>
									<div class="text-[11px] text-zinc-400 mt-0.5">
										Performed by <span class="font-medium text-zinc-600">{log.userName}</span>
									</div>
								</div>
							</div>
							<div class="text-[11px] font-mono text-zinc-400 text-right">
								{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- System Status & Quick Links Panel (1 Col) -->
		<div class="space-y-6">
			<div class="admin-card p-6 bg-white border border-zinc-200 rounded-xl shadow-sm">
				<h3 class="text-sm font-bold text-zinc-900 mb-3 pb-2 border-b border-zinc-100">System Operations</h3>
				<div class="space-y-3 text-xs">
					<div class="flex items-center justify-between py-1.5">
						<span class="text-zinc-600">Database Status</span>
						<span class="admin-badge admin-badge-success text-[11px]">Connected ✓</span>
					</div>
					<div class="flex items-center justify-between py-1.5">
						<span class="text-zinc-600">Media Storage</span>
						<span class="admin-badge admin-badge-neutral text-[11px]">Operational</span>
					</div>
					<div class="flex items-center justify-between py-1.5">
						<span class="text-zinc-600">Audit Logger</span>
						<span class="admin-badge admin-badge-neutral text-[11px]">Active</span>
					</div>
				</div>
			</div>

			<div class="admin-card p-6 bg-gradient-to-br from-white to-zinc-50 border border-zinc-200 rounded-xl shadow-sm">
				<h3 class="text-sm font-bold text-zinc-900 mb-2">Need Help?</h3>
				<p class="text-xs text-zinc-500 leading-relaxed mb-4">
					Access site branding settings or update homepage banners directly from settings.
				</p>
				<a href="/settings" class="admin-btn-secondary w-full text-xs text-center justify-center">
					Open Site Settings
				</a>
			</div>
		</div>
	</div>
</div>
