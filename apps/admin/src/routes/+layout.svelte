<script lang="ts">
	import '../app.css';
	let { children, data } = $props();
</script>

{#if data.minimalShell}
	{@render children()}
{:else}
	<div class="flex min-h-screen bg-zinc-50 font-sans text-zinc-900">
		<!-- Linear Acrylic Dark Sidebar -->
		<aside class="w-64 border-r border-white/10 bg-[#171616]/95 text-white backdrop-blur-2xl flex flex-col justify-between shadow-2xl">
			<div>
				<!-- Brand Header -->
				<div class="flex items-center gap-3 px-6 py-5 border-b border-white/10">
					<div class="h-9 w-9 rounded-xl bg-brand-primary flex items-center justify-center text-white font-black text-lg shadow-[0_0_20px_rgba(249,92,75,0.4)]">
						T
					</div>
					<div>
						<h1 class="font-black text-sm text-white leading-tight">PAOZ Trailblazers</h1>
						<p class="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Staff Admin CMS</p>
					</div>
				</div>

				<!-- Nav Links -->
				<nav class="p-4 space-y-1 text-sm font-medium">
					<a href="/" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-300 hover:bg-white/10 hover:text-white transition">
						<svg class="h-4 w-4 text-brand-primary fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
						Dashboard
					</a>
					<a href="/sermons" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-300 hover:bg-white/10 hover:text-white transition">
						<svg class="h-4 w-4 text-brand-primary fill-none stroke-current stroke-2" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
						Sermons & Media
					</a>
					<a href="/events" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-300 hover:bg-white/10 hover:text-white transition">
						<svg class="h-4 w-4 text-brand-primary fill-none stroke-current stroke-2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
						Events CMS
					</a>
					<a href="/groups" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-300 hover:bg-white/10 hover:text-white transition">
						<svg class="h-4 w-4 text-brand-primary fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
						Connect Groups
					</a>
					<a href="/stories" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-300 hover:bg-white/10 hover:text-white transition">
						<svg class="h-4 w-4 text-brand-primary fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
						Stories & Articles
					</a>
					<a href="/submissions" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-300 hover:bg-white/10 hover:text-white transition">
						<svg class="h-4 w-4 text-brand-primary fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
						Visitor & Serve Leads
					</a>
					<a href="/audit-logs" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-300 hover:bg-white/10 hover:text-white transition">
						<svg class="h-4 w-4 text-brand-primary fill-none stroke-current stroke-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 16 14"/></svg>
						Audit Activity Logs
					</a>
					<a href="/settings" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-300 hover:bg-white/10 hover:text-white transition">
						<svg class="h-4 w-4 text-brand-primary fill-none stroke-current stroke-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
						Site Settings
					</a>
				</nav>
			</div>

			<!-- User Profile Footer -->
			<div class="p-4 border-t border-white/10 bg-white/5">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="h-9 w-9 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/30 flex items-center justify-center font-black text-sm">
							{data.user?.fullName?.[0] || 'A'}
						</div>
						<div>
							<div class="text-xs font-bold text-white">{data.user?.fullName || 'Staff User'}</div>
							<div class="text-[11px] text-zinc-400">{data.user?.email || 'admin@paoz.org'}</div>
						</div>
					</div>
					<form method="POST" action="/logout">
						<button type="submit" class="text-xs text-red-400 font-bold hover:underline">Exit</button>
					</form>
				</div>
			</div>
		</aside>

		<!-- Main Workspace Area -->
		<div class="flex-1 flex flex-col min-w-0">
			<!-- Glass Header Bar -->
			<header class="h-16 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl px-8 flex items-center justify-between shadow-sm">
				<div class="text-xs font-bold uppercase tracking-wider text-zinc-500">
					PAOZ Trailblazers Platform Administration
				</div>
				<div class="flex items-center gap-4">
					<span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
						<span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
						System Operational
					</span>
				</div>
			</header>

			<!-- Page Body -->
			<main class="flex-1 p-8 overflow-y-auto">
				{@render children()}
			</main>
		</div>
	</div>
{/if}
