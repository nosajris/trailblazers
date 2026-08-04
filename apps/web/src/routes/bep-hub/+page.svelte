<script lang="ts">
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';

	let { data } = $props();

	let selectedRegion = $state('ALL');

	const hubs = [
		{
			id: 'harare-central',
			name: 'Harare Central Hub',
			region: 'HARARE',
			address: '77 Jason Moyo Avenue, Harare',
			meetingTimes: 'Sundays @ 10:00 AM & Wednesdays @ 5:30 PM',
			leader: 'Leader Tafadzwa & Team',
			mapUrl: 'https://maps.google.com/?q=Harare+Central'
		},
		{
			id: 'bulawayo-hub',
			name: 'Bulawayo City Hub',
			region: 'BULAWAYO',
			address: '45 Leopold Takawira Ave, Bulawayo',
			meetingTimes: 'Sundays @ 09:30 AM',
			leader: 'Leader Blessing & Team',
			mapUrl: 'https://maps.google.com/?q=Bulawayo'
		},
		{
			id: 'campus-uz',
			name: 'University of Zimbabwe (UZ) Campus Hub',
			region: 'STUDENT_CAMPUS',
			address: 'Student Union Complex, UZ Campus',
			meetingTimes: 'Thursdays @ 6:00 PM',
			leader: 'Student Leader Kudzai',
			mapUrl: 'https://maps.google.com/?q=University+of+Zimbabwe'
		},
		{
			id: 'campus-nust',
			name: 'NUST Student Hub',
			region: 'STUDENT_CAMPUS',
			address: 'NUST Campus Hall, Bulawayo',
			meetingTimes: 'Fridays @ 5:00 PM',
			leader: 'Student Leader Farai',
			mapUrl: 'https://maps.google.com/?q=NUST+Bulawayo'
		}
	];

	const filteredHubs = $derived(
		selectedRegion === 'ALL' ? hubs : hubs.filter((h) => h.region === selectedRegion)
	);
</script>

<svelte:head>
	<title>Locations & BEP Campus Hubs — PAOZ Trailblazers</title>
	<meta name="description" content="Find a local PAOZ Trailblazers gathering or campus hub near you." />
</svelte:head>

<SiteShell settings={data.settings}>
	<div class="min-h-screen bg-zinc-50">
		<section class="relative overflow-hidden bg-brand-dark py-20 text-white md:py-28">
			<div class="absolute inset-0">
				<img
					src="/images/image06.jpeg"
					alt="BEP Hub background"
					class="h-full w-full object-cover opacity-25"
					fetchpriority="high"
					loading="eager"
					decoding="async"
				/>
				<div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/90 to-brand-dark/50"></div>
			</div>
			<div class="relative z-10 mx-auto max-w-4xl px-6 text-center">
				<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">LOCATIONS & HUBS</p>
				<h1 class="font-sans text-4xl font-black tracking-tight md:text-6xl">Find a Location & Gatherings</h1>
				<p class="mx-auto mt-6 max-w-2xl text-lg text-gray-200">
					Whether on campus, in the city, or online — there is a Trailblazers gathering saved for you.
				</p>
			</div>
		</section>

		<!-- Hubs Locator Section -->
		<section class="mx-auto max-w-7xl px-6 py-14">
			<div class="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
				<div>
					<p class="text-xs font-bold uppercase tracking-wider text-brand-primary">Gathering Hubs</p>
					<h2 class="font-sans text-3xl font-black text-zinc-900">Campus & Regional Hubs</h2>
				</div>
				<!-- Region Filter Tabs -->
				<div class="flex flex-wrap gap-2">
					<button
						onclick={() => (selectedRegion = 'ALL')}
						class="rounded-full px-4 py-2 text-xs font-bold transition {selectedRegion === 'ALL' ? 'bg-brand-primary text-white shadow-md' : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'}"
					>
						All Locations
					</button>
					<button
						onclick={() => (selectedRegion = 'HARARE')}
						class="rounded-full px-4 py-2 text-xs font-bold transition {selectedRegion === 'HARARE' ? 'bg-brand-primary text-white shadow-md' : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'}"
					>
						Harare
					</button>
					<button
						onclick={() => (selectedRegion = 'BULAWAYO')}
						class="rounded-full px-4 py-2 text-xs font-bold transition {selectedRegion === 'BULAWAYO' ? 'bg-brand-primary text-white shadow-md' : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'}"
					>
						Bulawayo
					</button>
					<button
						onclick={() => (selectedRegion = 'STUDENT_CAMPUS')}
						class="rounded-full px-4 py-2 text-xs font-bold transition {selectedRegion === 'STUDENT_CAMPUS' ? 'bg-brand-primary text-white shadow-md' : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'}"
					>
						University Campuses
					</button>
				</div>
			</div>

			<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
				{#each filteredHubs as hub}
					<div class="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition hover:shadow-xl">
						<div>
							<div class="flex items-center justify-between">
								<span class="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-primary uppercase tracking-wider">{hub.region.replace('_', ' ')}</span>
								<span class="text-xs text-zinc-400 font-medium">Weekly Gathering</span>
							</div>
							<h3 class="mt-4 text-2xl font-bold text-zinc-900">{hub.name}</h3>
							<div class="mt-4 space-y-2 text-sm text-zinc-600">
								<div class="flex items-center gap-2">
									<svg class="h-4 w-4 text-zinc-400 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
									<span>{hub.address}</span>
								</div>
								<div class="flex items-center gap-2">
									<svg class="h-4 w-4 text-zinc-400 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
									<span class="font-semibold text-zinc-800">{hub.meetingTimes}</span>
								</div>
								<div class="flex items-center gap-2 text-xs text-zinc-500">
									<span>Host: {hub.leader}</span>
								</div>
							</div>
						</div>

						<div class="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
							<a href={hub.mapUrl} target="_blank" rel="noopener noreferrer" class="text-xs font-bold uppercase tracking-wider text-brand-primary hover:underline">Get Directions →</a>
							<a href="/plan-a-visit" class="rounded-full bg-brand-dark px-5 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition">Plan a Visit</a>
						</div>
					</div>
				{/each}
			</div>
		</section>
	</div>
</SiteShell>
