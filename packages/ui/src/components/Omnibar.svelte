<script lang="ts">
	import { goto } from '$app/navigation';
	import type { SearchItem } from '../site/search.js';

	/**
	 * Site-wide search overlay.
	 *
	 * It used to list four hardcoded links and was never rendered on any page.
	 * It now queries /api/search, which ranks real events, groups, messages,
	 * campuses and pages. Ctrl/Cmd+K opens it; arrows and Enter pick a result.
	 */
	let { isOpen = $bindable(false) }: { isOpen?: boolean } = $props();

	let query = $state('');
	let results = $state<SearchItem[]>([]);
	let active = $state(0);
	let loading = $state(false);
	let failed = $state(false);
	let inputEl = $state<HTMLInputElement | null>(null);

	const KIND_LABEL: Record<SearchItem['kind'], string> = {
		event: 'Event',
		group: 'Group',
		sermon: 'Message',
		page: 'Page'
	};

	const shortcuts: SearchItem[] = [
		{ id: 's-visit', kind: 'page', title: 'Plan a visit', subtitle: 'What a first Sunday looks like', href: '/plan-a-visit' },
		{ id: 's-watch', kind: 'page', title: 'Watch', subtitle: 'Live and past messages', href: '/watch' },
		{ id: 's-events', kind: 'page', title: 'Events', subtitle: 'Camps, workshops and meetups', href: '/events' },
		{ id: 's-groups', kind: 'page', title: 'Groups', subtitle: 'Find your people', href: '/groups' }
	];

	const shown = $derived(query.trim().length === 0 ? shortcuts : results);

	function close() {
		isOpen = false;
		query = '';
		results = [];
		active = 0;
		failed = false;
	}

	// Each keystroke would otherwise fire its own request.
	let timer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const q = query.trim();
		clearTimeout(timer);

		if (q.length === 0) {
			results = [];
			loading = false;
			failed = false;
			return;
		}

		loading = true;
		const controller = new AbortController();
		timer = setTimeout(async () => {
			try {
				const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
					signal: controller.signal
				});
				if (!response.ok) throw new Error(String(response.status));
				const body = (await response.json()) as { results?: SearchItem[] };
				results = body.results ?? [];
				failed = false;
			} catch (error) {
				if ((error as Error).name === 'AbortError') return;
				results = [];
				failed = true;
			} finally {
				loading = false;
			}
			active = 0;
		}, 220);

		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	});

	// Focus the field once the dialog is on screen, rather than using autofocus.
	$effect(() => {
		if (isOpen) queueMicrotask(() => inputEl?.focus());
	});

	$effect(() => {
		if (!isOpen) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previous;
		};
	});

	function onWindowKey(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			if (isOpen) close();
			else isOpen = true;
			return;
		}
		if (!isOpen) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
		}
	}

	function onFieldKey(event: KeyboardEvent) {
		if (shown.length === 0) return;
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			active = (active + 1) % shown.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			active = (active - 1 + shown.length) % shown.length;
		} else if (event.key === 'Enter') {
			const choice = shown[active];
			if (choice) {
				event.preventDefault();
				close();
				void goto(choice.href);
			}
		}
	}
</script>

<svelte:window onkeydown={onWindowKey} />

{#if isOpen}
	<div class="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-16 sm:pt-24">
		<!-- The backdrop closes the dialog; Escape does the same for the keyboard. -->
		<button
			type="button"
			class="absolute inset-0 cursor-default bg-brand-dark/70 backdrop-blur-sm"
			aria-label="Close search"
			onclick={close}
		></button>

		<div
			class="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl"
			role="dialog"
			aria-modal="true"
			aria-label="Search this site"
		>
			<div class="flex items-center gap-3 border-b border-neutral-200 bg-brand-light px-4">
				<svg
					class="h-5 w-5 shrink-0 fill-none stroke-current stroke-2 text-brand-dark/50"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
				<label class="sr-only" for="omnibar-input">Search events, groups, messages and pages</label>
				<input
					id="omnibar-input"
					bind:this={inputEl}
					bind:value={query}
					onkeydown={onFieldKey}
					type="search"
					placeholder="Search events, groups, messages…"
					autocomplete="off"
					class="w-full bg-transparent py-4 text-sm font-medium text-brand-dark outline-none placeholder:text-brand-dark/50"
				/>
				<button
					type="button"
					onclick={close}
					class="shrink-0 rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-dark/60 transition hover:bg-black/5 hover:text-brand-dark"
					>Esc</button
				>
			</div>

			<div class="max-h-[60vh] overflow-y-auto p-3">
				<p class="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-brand-dark/50" aria-live="polite">
					{#if query.trim().length === 0}
						Go to
					{:else if loading}
						Searching…
					{:else if failed}
						Search is unavailable
					{:else}
						{results.length} result{results.length === 1 ? '' : 's'}
					{/if}
				</p>

				{#if failed}
					<p class="px-2 pb-3 text-sm text-brand-dark/70">
						Something went wrong. Try again, or browse from the menu.
					</p>
				{:else if query.trim().length > 0 && !loading && results.length === 0}
					<p class="px-2 pb-3 text-sm text-brand-dark/70">
						Nothing matched “{query.trim()}”. Try a leader's name, a camp or a day of the week.
					</p>
				{/if}

				<ul class="space-y-1">
					{#each shown as item, i (item.id)}
						<li>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- hrefs come from search results, including CMS records -->
							<a
								href={item.href}
								onclick={close}
								onmouseenter={() => (active = i)}
								class="flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition {i ===
								active
									? 'bg-brand-primary/10'
									: 'hover:bg-black/[0.04]'}"
							>
								<span class="flex min-w-0 items-center gap-3">
									<span
										class="shrink-0 rounded-md bg-brand-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-primary"
										>{KIND_LABEL[item.kind]}</span
									>
									<span class="min-w-0">
										<span class="block truncate font-semibold text-brand-dark">{item.title}</span>
										{#if item.subtitle}
											<span class="block truncate text-xs text-brand-dark/60">{item.subtitle}</span>
										{/if}
									</span>
								</span>
								<span class="shrink-0 text-xs font-bold text-brand-primary" aria-hidden="true">→</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
{/if}
