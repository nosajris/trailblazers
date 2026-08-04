<script lang="ts">
	import { page } from '$app/stores';
	import '../app.css';

	let { children, data } = $props();

	function isActive(href: string) {
		if (href === '/') {
			return $page.url.pathname === '/';
		}
		return $page.url.pathname.startsWith(href);
	}
</script>

{#if data.minimalShell}
	{@render children()}
{:else}
	<div class="flex min-h-screen bg-zinc-50 font-sans text-zinc-900">
		<!-- Linear Acrylic Dark Sidebar -->
		<aside class="w-64 border-r border-white/10 bg-zinc-900 text-white backdrop-blur-2xl flex flex-col justify-between shadow-2xl">
			<div>
				<!-- Brand Header -->
				<div class="flex items-center gap-3 px-6 py-5 border-b border-white/10">
					<div class="h-9 w-9 rounded-xl bg-[var(--brand-primary,#f95c4b)] flex items-center justify-center text-white font-black text-lg shadow-[0_0_20px_rgba(249,92,75,0.4)]">
						T
					</div>
					<div>
						<h1 class="font-black text-sm text-white leading-tight">PAOZ Trailblazers</h1>
						<p class="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Staff Admin CMS</p>
					</div>
				</div>

				<!-- Nav Links -->
				<nav class="p-4 space-y-1 text-sm font-medium">
					<a
						href="/"
						data-active={isActive('/') ? 'true' : 'false'}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition {isActive('/') ? 'bg-white/10 text-white font-semibold border-l-2 border-[var(--brand-primary,#f95c4b)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
					>
						<svg class="h-4 w-4 text-[var(--brand-primary,#f95c4b)] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
						Dashboard
					</a>
					<a
						href="/sermons"
						data-active={isActive('/sermons') ? 'true' : 'false'}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition {isActive('/sermons') ? 'bg-white/10 text-white font-semibold border-l-2 border-[var(--brand-primary,#f95c4b)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
					>
						<svg class="h-4 w-4 text-[var(--brand-primary,#f95c4b)] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
						Sermons & Media
					</a>
					<a
						href="/events"
						data-active={isActive('/events') ? 'true' : 'false'}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition {isActive('/events') ? 'bg-white/10 text-white font-semibold border-l-2 border-[var(--brand-primary,#f95c4b)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
					>
						<svg class="h-4 w-4 text-[var(--brand-primary,#f95c4b)] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
						Events CMS
					</a>
					<a
						href="/groups"
						data-active={isActive('/groups') ? 'true' : 'false'}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition {isActive('/groups') ? 'bg-white/10 text-white font-semibold border-l-2 border-[var(--brand-primary,#f95c4b)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
					>
						<svg class="h-4 w-4 text-[var(--brand-primary,#f95c4b)] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
						Connect Groups
					</a>
					<a
						href="/stories"
						data-active={isActive('/stories') ? 'true' : 'false'}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition {isActive('/stories') ? 'bg-white/10 text-white font-semibold border-l-2 border-[var(--brand-primary,#f95c4b)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
					>
						<svg class="h-4 w-4 text-[var(--brand-primary,#f95c4b)] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
						Stories & Articles
					</a>
					<a
						href="/leaders"
						data-active={isActive('/leaders') ? 'true' : 'false'}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition {isActive('/leaders') ? 'bg-white/10 text-white font-semibold border-l-2 border-[var(--brand-primary,#f95c4b)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
					>
						<svg class="h-4 w-4 text-[var(--brand-primary,#f95c4b)] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
						Ministry Leaders
					</a>
					<a
						href="/testimonials"
						data-active={isActive('/testimonials') ? 'true' : 'false'}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition {isActive('/testimonials') ? 'bg-white/10 text-white font-semibold border-l-2 border-[var(--brand-primary,#f95c4b)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
					>
						<svg class="h-4 w-4 text-[var(--brand-primary,#f95c4b)] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
						Testimonials
					</a>
					<a
						href="/bep"
						data-active={isActive('/bep') ? 'true' : 'false'}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition {isActive('/bep') ? 'bg-white/10 text-white font-semibold border-l-2 border-[var(--brand-primary,#f95c4b)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
					>
						<svg class="h-4 w-4 text-[var(--brand-primary,#f95c4b)] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
						BEP Marketplace
					</a>
					<a
						href="/equipment"
						data-active={isActive('/equipment') ? 'true' : 'false'}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition {isActive('/equipment') ? 'bg-white/10 text-white font-semibold border-l-2 border-[var(--brand-primary,#f95c4b)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
					>
						<svg class="h-4 w-4 text-[var(--brand-primary,#f95c4b)] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
						Equipment Inventory
					</a>
					<a
						href="/pages"
						data-active={isActive('/pages') ? 'true' : 'false'}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition {isActive('/pages') ? 'bg-white/10 text-white font-semibold border-l-2 border-[var(--brand-primary,#f95c4b)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
					>
						<svg class="h-4 w-4 text-[var(--brand-primary,#f95c4b)] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
						Landing Pages CMS
					</a>
					<a
						href="/parents"
						data-active={isActive('/parents') ? 'true' : 'false'}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition {isActive('/parents') ? 'bg-white/10 text-white font-semibold border-l-2 border-[var(--brand-primary,#f95c4b)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
					>
						<svg class="h-4 w-4 text-[var(--brand-primary,#f95c4b)] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
						Parents Portal
					</a>
					<a
						href="/newcomers"
						data-active={isActive('/newcomers') ? 'true' : 'false'}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition {isActive('/newcomers') ? 'bg-white/10 text-white font-semibold border-l-2 border-[var(--brand-primary,#f95c4b)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
					>
						<svg class="h-4 w-4 text-[var(--brand-primary,#f95c4b)] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
						VIP Newcomers
					</a>

					<a
						href="/faq"
						data-active={isActive('/faq') ? 'true' : 'false'}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition {isActive('/faq') ? 'bg-white/10 text-white font-semibold border-l-2 border-[var(--brand-primary,#f95c4b)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
					>
						<svg class="h-4 w-4 text-[var(--brand-primary,#f95c4b)] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
						FAQ Portal
					</a>
					<a
						href="/serve"
						data-active={isActive('/serve') ? 'true' : 'false'}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition {isActive('/serve') ? 'bg-white/10 text-white font-semibold border-l-2 border-[var(--brand-primary,#f95c4b)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
					>
						<svg class="h-4 w-4 text-[var(--brand-primary,#f95c4b)] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
						Volunteer Serve
					</a>
					<a
						href="/submissions"
						data-active={isActive('/submissions') ? 'true' : 'false'}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition {isActive('/submissions') ? 'bg-white/10 text-white font-semibold border-l-2 border-[var(--brand-primary,#f95c4b)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
					>
						<svg class="h-4 w-4 text-[var(--brand-primary,#f95c4b)] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
						Visitor & Serve Leads
					</a>
					<a
						href="/statistics"
						data-active={isActive('/statistics') ? 'true' : 'false'}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition {isActive('/statistics') ? 'bg-white/10 text-white font-semibold border-l-2 border-[var(--brand-primary,#f95c4b)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
					>
						<svg class="h-4 w-4 text-[var(--brand-primary,#f95c4b)] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
						District Statistics
					</a>
					<a
						href="/users"
						data-active={isActive('/users') ? 'true' : 'false'}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition {isActive('/users') ? 'bg-white/10 text-white font-semibold border-l-2 border-[var(--brand-primary,#f95c4b)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
					>
						<svg class="h-4 w-4 text-[var(--brand-primary,#f95c4b)] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
						Staff Accounts
					</a>
					<a
						href="/audit-logs"
						data-active={isActive('/audit-logs') ? 'true' : 'false'}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition {isActive('/audit-logs') ? 'bg-white/10 text-white font-semibold border-l-2 border-[var(--brand-primary,#f95c4b)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
					>
						<svg class="h-4 w-4 text-[var(--brand-primary,#f95c4b)] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 16 14"/></svg>
						Audit Activity Logs
					</a>
					<a
						href="/settings"
						data-active={isActive('/settings') ? 'true' : 'false'}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition {isActive('/settings') ? 'bg-white/10 text-white font-semibold border-l-2 border-[var(--brand-primary,#f95c4b)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
					>
						<svg class="h-4 w-4 text-[var(--brand-primary,#f95c4b)] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
						Site Settings
					</a>


				</nav>
			</div>

			<!-- User Profile Footer -->
			<div class="p-4 border-t border-white/10 bg-white/5">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="h-9 w-9 rounded-full bg-[var(--brand-primary-muted,rgba(249,92,75,0.15))] text-[var(--brand-primary,#f95c4b)] border border-[var(--brand-primary,#f95c4b)]/30 flex items-center justify-center font-black text-sm">
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
			<header class="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-xl px-8 flex items-center justify-between shadow-sm">
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
