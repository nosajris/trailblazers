<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import type { EventCardVm } from '@trailblazers/core';

	let { data } = $props();

	let searchQuery = $state(data.filters.search);
	let selectedType = $state(data.filters.type);
	let selectedSort = $state(data.filters.sort);

	$effect(() => {
		searchQuery = data.filters.search;
		selectedType = data.filters.type;
		selectedSort = data.filters.sort;
	});

	const formatPrice = (cents: number) => {
		if (cents === 0) return 'Free';
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
	};

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		}).format(new Date(date));
	};

	const formatDayTime = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(date));
	};

	function applyFilters() {
		const params = new URLSearchParams($page.url.searchParams);
		if (searchQuery) params.set('q', searchQuery);
		else params.delete('q');
		if (selectedType !== 'ALL') params.set('type', selectedType);
		else params.delete('type');
		params.set('sort', selectedSort);
		params.set('page', '1');
		params.delete('view');
		goto(`?${params.toString()}`, { keepFocus: true });
	}

	function changePage(newPage: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', newPage.toString());
		params.delete('view');
		goto(`?${params.toString()}`);
	}

	function setView(view: 'list' | 'calendar') {
		const params = new URLSearchParams();
		if (view === 'calendar') {
			params.set('view', 'calendar');
			params.set('y', String(data.calYear));
			params.set('m', String(data.calMonth));
		} else {
			if (data.filters.search) params.set('q', data.filters.search);
			if (data.filters.type !== 'ALL') params.set('type', data.filters.type);
			params.set('sort', data.filters.sort);
			params.set('page', String(data.pagination.currentPage));
		}
		goto(`/events?${params}`, { replaceState: true });
	}

	function shiftMonth(delta: number) {
		let ny = data.calYear;
		let nm = data.calMonth + delta;
		if (nm < 1) {
			nm = 12;
			ny--;
		}
		if (nm > 12) {
			nm = 1;
			ny++;
		}
		goto(`/events?view=calendar&y=${ny}&m=${nm}`, { replaceState: true });
	}

	const monthLabel = $derived(
		new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
			new Date(data.calYear, data.calMonth - 1, 1)
		)
	);

	function calendarCells(year: number, month: number) {
		const first = new Date(year, month - 1, 1);
		const last = new Date(year, month, 0);
		const pad = first.getDay();
		const daysInMonth = last.getDate();
		const cells: ({ day: number } | null)[] = [];
		for (let i = 0; i < pad; i++) cells.push(null);
		for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });
		while (cells.length % 7 !== 0) cells.push(null);
		return cells;
	}

	function eventsForDay(events: EventCardVm[], year: number, month: number, day: number) {
		return events.filter((e) => {
			const dt = new Date(e.date);
			return dt.getFullYear() === year && dt.getMonth() + 1 === month && dt.getDate() === day;
		});
	}
</script>

<SiteShell settings={data.settings}>
	<div class="min-h-screen bg-brand-light">
		{#if data.featuredEvent}
			<section class="group relative flex h-[min(56vh,28rem)] w-full items-end overflow-hidden md:h-[60vh]">
				<div class="absolute inset-0 bg-brand-dark">
					<img
						src={data.featuredEvent.imageUrl ?? '/images/wallpaper01.jpg'}
						alt={data.featuredEvent.title}
						class="h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-105"
						sizes="100vw"
						loading="eager"
					/>
					<div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent"></div>
				</div>

				<div class="relative z-10 container mx-auto max-w-7xl px-6 pb-12 text-white">
					<span
						class="mb-4 inline-block rounded-full bg-brand-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-dark"
					>
						Featured Event
					</span>
					<h1 class="mb-4 font-serif text-4xl font-bold md:text-6xl">{data.featuredEvent.title}</h1>
					<div class="mb-8 flex flex-wrap gap-6 text-sm font-medium text-gray-200 md:text-base">
						<div class="flex items-center gap-2">
							<svg class="h-5 w-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								></path>
							</svg>
							{formatDate(data.featuredEvent.date)}
						</div>
						<div class="flex items-center gap-2">
							<svg class="h-5 w-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
								></path>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
								></path>
							</svg>
							{data.featuredEvent.location}
						</div>
					</div>
					<a
						class="inline-flex items-center justify-center rounded-full bg-brand-primary px-8 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg transition hover:brightness-105"
						href="/events/{data.featuredEvent.id}"
					>
						View & register
					</a>
				</div>
			</section>
		{/if}

		<section
			class="sticky top-[4.5rem] z-40 border-b border-gray-200 bg-white/95 py-4 shadow-sm backdrop-blur-md lg:top-[7.25rem]"
		>
			<div class="container mx-auto flex max-w-7xl flex-col gap-4 px-6 md:px-6">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div class="inline-flex rounded-full border border-gray-200 bg-brand-light/50 p-1">
						<button
							type="button"
							class="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition {data.view ===
							'list'
								? 'bg-white text-brand-dark shadow-sm'
								: 'text-brand-dark/60 hover:text-brand-dark'}"
							aria-pressed={data.view === 'list'}
							onclick={() => setView('list')}
						>
							List
						</button>
						<button
							type="button"
							class="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition {data.view ===
							'calendar'
								? 'bg-white text-brand-dark shadow-sm'
								: 'text-brand-dark/60 hover:text-brand-dark'}"
							aria-pressed={data.view === 'calendar'}
							onclick={() => setView('calendar')}
						>
							Calendar
						</button>
					</div>
					{#if data.view === 'calendar'}
						<div class="flex items-center gap-3">
							<button
								type="button"
								class="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-brand-dark transition hover:border-brand-primary"
								aria-label="Previous month"
								onclick={() => shiftMonth(-1)}>&larr;</button
							>
							<span class="min-w-[10rem] text-center font-serif text-lg font-bold text-brand-dark"
								>{monthLabel}</span
							>
							<button
								type="button"
								class="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-brand-dark transition hover:border-brand-primary"
								aria-label="Next month"
								onclick={() => shiftMonth(1)}>&rarr;</button
							>
						</div>
					{/if}
				</div>

				{#if data.view === 'list'}
					<div class="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
						<div class="relative w-full md:w-96">
							<input
								type="text"
								bind:value={searchQuery}
								oninput={applyFilters}
								placeholder="Search events..."
								class="w-full rounded-full border border-gray-300 py-2 pl-10 pr-4 outline-none ring-brand-primary focus:border-brand-primary focus:ring-1"
							/>
							<svg
								class="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								></path></svg
							>
						</div>

						<div class="flex w-full gap-4 overflow-x-auto pb-2 md:w-auto md:pb-0">
							<select
								bind:value={selectedType}
								onchange={applyFilters}
								class="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 outline-none focus:border-brand-primary"
							>
								<option value="ALL">All Types</option>
								<option value="CAMP">Camps</option>
								<option value="WORKSHOP">Workshops</option>
								<option value="MEETUP">Meetups</option>
							</select>

							<select
								bind:value={selectedSort}
								onchange={applyFilters}
								class="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 outline-none focus:border-brand-primary"
							>
								<option value="date_asc">Date: Soonest</option>
								<option value="date_desc">Date: Latest</option>
								<option value="title_asc">Title: A-Z</option>
							</select>
						</div>
					</div>
				{/if}
			</div>
		</section>

		{#if data.view === 'calendar'}
			<section class="container mx-auto max-w-7xl px-6 py-12">
				<div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
					<div class="grid grid-cols-7 border-b border-gray-100 bg-brand-light/80 text-center text-[11px] font-bold uppercase tracking-wider text-brand-dark/60 md:text-xs">
						{#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as wd}
							<div class="py-3">{wd}</div>
						{/each}
					</div>
					<div class="grid grid-cols-7">
						{#each calendarCells(data.calYear, data.calMonth) as cell, i (i)}
							<div
								class="min-h-[6.5rem] border-b border-r border-gray-100 p-2 md:min-h-[7.5rem] {cell
									? 'bg-white'
									: 'bg-brand-light/30'}"
							>
								{#if cell}
									<div class="text-xs font-bold text-brand-dark/50 md:text-sm">{cell.day}</div>
									<div class="mt-2 space-y-1">
										{#each eventsForDay(data.calendarEvents, data.calYear, data.calMonth, cell.day) as ev (ev.id)}
											<a
												href="/events/{ev.id}"
												class="block truncate rounded-md bg-brand-primary/10 px-1.5 py-1 text-[10px] font-semibold text-brand-primary transition hover:bg-brand-primary/20 md:text-xs"
											>
												{formatDayTime(ev.date)} · {ev.title}
											</a>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
				<p class="mt-6 text-center text-sm text-brand-dark/60">
					Tap a tile for details. Prefer filters? Switch to list view.
				</p>
			</section>
		{:else if data.events.length === 0}
			<section class="container mx-auto max-w-7xl px-6 py-20">
				<div class="text-center">
					<p class="font-serif text-2xl text-gray-500">No events found matching your criteria.</p>
					<button
						type="button"
						onclick={() => {
							searchQuery = '';
							selectedType = 'ALL';
							applyFilters();
						}}
						class="mt-4 font-bold text-brand-primary hover:underline"
					>
						Clear filters
					</button>
				</div>
			</section>
		{:else}
			<section class="container mx-auto max-w-7xl px-6 py-12">
				<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					{#each data.events as event (event.id)}
						<a
							href="/events/{event.id}"
							class="card flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition duration-300 hover:shadow-xl"
						>
							<div class="relative h-48 overflow-hidden">
								<img
									src={event.imageUrl || '/images/wallpaper04.jpg'}
									alt={event.title}
									loading="lazy"
									decoding="async"
									sizes="(max-width: 768px) 100vw, 33vw"
									class="h-full w-full object-cover transition duration-500 hover:scale-105"
								/>
								<div class="absolute left-3 top-3 flex gap-2">
									<span
										class="rounded bg-white/90 px-2 py-1 text-xs font-bold uppercase text-brand-dark backdrop-blur"
									>
										{event.type}
									</span>
									{#if event.isFeatured}
										<span class="rounded bg-brand-gold px-2 py-1 text-xs font-bold uppercase text-white">
											Featured
										</span>
									{/if}
								</div>
								<div class="absolute bottom-0 right-0 rounded-tl-lg bg-brand-primary px-4 py-1 font-bold text-white">
									{formatPrice(event.price)}
								</div>
							</div>
							<div class="flex flex-grow flex-col p-6">
								<div class="mb-2 text-sm font-bold uppercase tracking-wide text-brand-primary">
									{formatDate(event.date)}
								</div>
								<h3 class="mb-2 line-clamp-2 font-serif text-xl font-bold text-brand-dark">
									{event.title}
								</h3>
								<div class="mb-4 flex items-center text-sm text-gray-500">
									<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										></path>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
										></path>
									</svg>
									{event.location}
								</div>
								{#if event.capacity}
									<div class="mb-4">
										<div class="mb-1 flex justify-between text-xs text-gray-500">
											<span>{event.registeredCount ?? 0} registered</span>
											<span>{event.capacity - (event.registeredCount ?? 0)} spots left</span>
										</div>
										<div class="h-2 w-full rounded-full bg-gray-200">
											<div
												class="h-2 rounded-full bg-brand-secondary"
												style="width: {((event.registeredCount ?? 0) / event.capacity) * 100}%"
											></div>
										</div>
									</div>
								{/if}
								{#if event.earlyBirdDeadline && new Date(event.earlyBirdDeadline) > new Date()}
									<div class="mb-4 rounded border border-orange-100 bg-orange-50 p-2 text-xs text-orange-800">
										Early bird ends {new Date(event.earlyBirdDeadline).toLocaleDateString()}
									</div>
								{/if}
								<div class="mt-auto border-t border-gray-100 pt-4">
									<span class="block w-full text-center font-bold text-brand-primary">
										View details & register →
									</span>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		{#if data.view === 'list' && data.pagination.totalPages > 1}
			<section class="container mx-auto flex max-w-7xl justify-center px-6 pb-24">
				<div class="flex gap-2">
					<button
						type="button"
						disabled={data.pagination.currentPage === 1}
						onclick={() => changePage(data.pagination.currentPage - 1)}
						class="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Previous
					</button>
					{#each Array(data.pagination.totalPages) as _, i}
						<button
							type="button"
							onclick={() => changePage(i + 1)}
							class="h-10 w-10 rounded border {data.pagination.currentPage === i + 1
								? 'border-brand-primary bg-brand-primary text-white'
								: 'border-gray-300 hover:bg-gray-50'}"
						>
							{i + 1}
						</button>
					{/each}
					<button
						type="button"
						disabled={data.pagination.currentPage === data.pagination.totalPages}
						onclick={() => changePage(data.pagination.currentPage + 1)}
						class="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Next
					</button>
				</div>
			</section>
		{/if}
	</div>
</SiteShell>
