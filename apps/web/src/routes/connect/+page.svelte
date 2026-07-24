<script lang="ts">
	let { data } = $props();
	
	let activeFilter = $state('all');

	// Derived state for filtering
	let filteredGroups = $derived(
		activeFilter === 'all' 
		? data.groups 
		: data.groups.filter(g => g.type === activeFilter)
	);

	const filters = [
		{ id: 'all', label: 'All Groups' },
		{ id: 'campus', label: 'Campus Ministry' },
		{ id: 'professional', label: 'Professionals' },
		{ id: 'interest', label: 'Interest Based' },
		{ id: 'online', label: 'Online Only' }
	];
</script>

<div class="bg-brand-light min-h-screen py-12">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-12">
			<h1 class="text-4xl font-serif font-bold text-brand-dark">Find Your Tribe</h1>
			<p class="mt-4 text-gray-600 max-w-2xl mx-auto">
				Life is better together. Connect with people who share your season of life, your campus, or your professional interests.
			</p>
		</div>

		<!-- Filter Bar -->
		<div class="flex flex-wrap justify-center gap-2 mb-12">
			{#each filters as filter}
				<button 
					onclick={() => activeFilter = filter.id}
					class="px-6 py-2 rounded-full text-sm font-bold transition-all duration-200
					{activeFilter === filter.id 
						? 'bg-brand-primary text-white shadow-md transform scale-105' 
						: 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}"
				>
					{filter.label}
				</button>
			{/each}
		</div>

		<!-- Grid -->
		{#if filteredGroups.length === 0}
			<div class="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
				<p class="text-gray-500 text-lg">No groups found in this category yet.</p>
				<button onclick={() => activeFilter = 'all'} class="mt-4 text-brand-primary font-bold hover:underline">
					View all groups
				</button>
			</div>
		{:else}
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each filteredGroups as group}
					<div class="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-gray-100 flex flex-col">
						<div class="flex justify-between items-start mb-4">
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
								{group.type}
							</span>
							<!-- Placeholder Icon -->
							<div class="h-10 w-10 rounded-full bg-brand-light flex items-center justify-center text-brand-primary">
								<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
							</div>
						</div>

						<h3 class="text-xl font-bold text-brand-dark mb-1">{group.name}</h3>
						<p class="text-sm text-gray-500 mb-4">Led by {group.leaderName}</p>
						
						<p class="text-gray-600 text-sm mb-6 flex-grow">{group.description}</p>
						
						<div class="space-y-2 text-sm text-gray-500 mb-6">
							<div class="flex items-center">
								<svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
								{group.meetingTime}
							</div>
							<div class="flex items-center">
								<svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
								{group.location}
							</div>
						</div>

						<a 
							href="mailto:connect@paoztrailblazers.org?subject=Joining {group.name}"
							class="block w-full text-center bg-brand-dark text-white py-2 rounded-md font-bold hover:bg-brand-primary transition"
						>
							Request to Join
						</a>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>