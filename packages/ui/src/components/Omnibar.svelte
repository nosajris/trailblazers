<script lang="ts">
	let { isOpen = $bindable(false) }: { isOpen: boolean } = $props();

	let searchQuery = $state('');

	function handleKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			isOpen = !isOpen;
		}
		if (e.key === 'Escape' && isOpen) {
			isOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-20 p-4 backdrop-blur-sm">
		<div class="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-zinc-200">
			<!-- Search Bar Input -->
			<div class="flex items-center px-4 border-b border-zinc-200 bg-zinc-50">
				<svg class="h-5 w-5 text-zinc-400 fill-none stroke-current stroke-2 mr-3" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search sermons, events, connect groups, or team leads... (Esc to close)"
					class="w-full bg-transparent py-4 text-sm font-medium text-zinc-900 focus:outline-none"
					autofocus
				/>
				<button onclick={() => (isOpen = false)} class="text-xs font-semibold text-zinc-400 hover:text-zinc-700">ESC</button>
			</div>

			<!-- Search Results Shortcuts -->
			<div class="p-4 space-y-2 max-h-96 overflow-y-auto">
				<div class="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-3">Quick Navigation</div>
				<a href="/watch" onclick={() => (isOpen = false)} class="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-zinc-100 transition text-sm font-semibold text-zinc-800">
					<div class="flex items-center gap-3">
						<span class="rounded bg-amber-100 p-1.5 text-amber-800 text-xs font-bold">WATCH</span>
						<span>Latest Video Sermon & Messages</span>
					</div>
					<span class="text-xs text-zinc-400">Jump →</span>
				</a>

				<a href="/events" onclick={() => (isOpen = false)} class="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-zinc-100 transition text-sm font-semibold text-zinc-800">
					<div class="flex items-center gap-3">
						<span class="rounded bg-blue-100 p-1.5 text-blue-800 text-xs font-bold">EVENTS</span>
						<span>Upcoming National Youth Camps & Workshops</span>
					</div>
					<span class="text-xs text-zinc-400">Jump →</span>
				</a>

				<a href="/groups" onclick={() => (isOpen = false)} class="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-zinc-100 transition text-sm font-semibold text-zinc-800">
					<div class="flex items-center gap-3">
						<span class="rounded bg-emerald-100 p-1.5 text-emerald-800 text-xs font-bold">GROUPS</span>
						<span>Connect Groups & Student Hubs</span>
					</div>
					<span class="text-xs text-zinc-400">Jump →</span>
				</a>

				<a href="/plan-a-visit" onclick={() => (isOpen = false)} class="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-zinc-100 transition text-sm font-semibold text-zinc-800">
					<div class="flex items-center gap-3">
						<span class="rounded bg-purple-100 p-1.5 text-purple-800 text-xs font-bold">VISIT</span>
						<span>Plan A VIP Visit to PAOZ Trailblazers</span>
					</div>
					<span class="text-xs text-zinc-400">Jump →</span>
				</a>
			</div>
		</div>
	</div>
{/if}
