<script lang="ts">
	import { onDestroy } from 'svelte';
	import { container } from '../tb-layout.js';
	import type { SiteExtras, SiteNavItem, SiteNavMega } from '@trailblazers/core';

	function isMegaNavItem(item: SiteNavItem): item is SiteNavMega {
		return (
			'columns' in item &&
			Array.isArray((item as SiteNavMega).columns) &&
			(item as SiteNavMega).columns.length > 0
		);
	}

	type NavLink = { label: string; href: string };

	let {
		navItems,
		extras,
		cta = { label: 'Plan a visit', href: '/plan-a-visit' }
	}: {
		navItems: SiteNavItem[];
		extras: SiteExtras;
		cta?: NavLink;
	} = $props();

	let menuOpen = $state(false);
	let openMega = $state<string | null>(null);
	let headerEl: HTMLDivElement | null = $state(null);
	let mobilePanelEl: HTMLDivElement | null = $state(null);

	const givingHref = $derived(extras.givingUrl?.trim() ? extras.givingUrl : '/give');
	const watchHref = $derived(extras.watchUrl?.trim() ? extras.watchUrl : '/watch');
	const messagesHref = $derived(extras.messagesUrl?.trim() ? extras.messagesUrl : '/watch#messages');

	function closeMenu() {
		menuOpen = false;
	}

	function closeMega() {
		openMega = null;
	}

	// Close mega on outside click
	$effect(() => {
		if (openMega === null) return;
		const onDoc = (e: MouseEvent) => {
			const t = e.target as Node;
			if (headerEl && !headerEl.contains(t)) closeMega();
		};
		document.addEventListener('click', onDoc, true);
		return () => document.removeEventListener('click', onDoc, true);
	});

	// Escape closes menus
	function onWinKey(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			closeMenu();
			closeMega();
		}
	}

	$effect(() => {
		if (!menuOpen) return;
		queueMicrotask(() => {
			const root = mobilePanelEl;
			if (!root) return;
			const focusable = root.querySelector<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			focusable?.focus();
		});
	});

	// Lock body scroll when mobile menu open
	$effect(() => {
		if (!menuOpen) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') {
			document.body.style.overflow = '';
		}
	});
</script>

<svelte:window onkeydown={onWinKey} />

<div
	bind:this={headerEl}
	class="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/80 shadow-[0_8px_32px_0_rgba(23,22,22,0.06)] backdrop-blur-xl"
>
	<!-- Acrylic Dark Utility Bar -->
	<div
		class="hidden border-b border-white/10 bg-[#171616]/95 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-md lg:block"
	>
		<div class="{container} flex flex-wrap items-center justify-end gap-x-6 gap-y-2 py-2">
			<a class="transition hover:text-brand-gold" href={watchHref}>Watch</a>
			<a class="transition hover:text-brand-gold" href={messagesHref}>Messages</a>
			<a class="transition hover:text-brand-gold" href={givingHref}>Give</a>
			{#if extras.campuses && extras.campuses.length > 1}
				<label class="inline-flex items-center gap-2 text-white/80">
					<span class="sr-only">Campus</span>
					<select
						class="max-w-[10rem] cursor-pointer rounded-md border border-white/20 bg-white/10 px-2 py-1 text-[11px] font-bold tracking-wide text-white outline-none backdrop-blur-sm focus:border-brand-primary"
						onchange={(e) => {
							const opt = extras.campuses?.[e.currentTarget.selectedIndex];
							if (opt?.href) window.location.href = opt.href;
						}}
					>
						{#each extras.campuses as c (c.id)}
							<option value={c.id} class="bg-[#171616] text-white">{c.label}</option>
						{/each}
					</select>
				</label>
			{/if}
			{#if extras.languageOptions && extras.languageOptions.length > 1}
				<div class="flex gap-3 border-l border-white/20 pl-6">
					{#each extras.languageOptions as lang (lang.code)}
						<a
							class="opacity-90 transition hover:text-brand-gold"
							href={lang.href ?? '#'}
							lang={lang.code}>{lang.label}</a
						>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Acrylic Header Container -->
	<div class="{container} flex h-14 items-center justify-between gap-4 sm:h-16 lg:h-[4.25rem]">
		<a
			href="/"
			class="font-sans text-lg font-black tracking-tight text-brand-dark sm:text-xl lg:text-2xl"
		>
			<span class="text-brand-primary">Trail</span><span class="text-brand-dark">blazers</span>
		</a>

		<nav class="hidden items-center gap-0.5 lg:flex xl:gap-1" aria-label="Primary">
			{#each navItems as item, i (`nav-${i}`)}
				{#if isMegaNavItem(item)}
					<div class="relative">
						<button
							type="button"
							class="flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-semibold text-brand-dark/90 transition hover:bg-black/5 hover:text-brand-primary xl:px-4 xl:text-sm"
							aria-expanded={openMega === item.label}
							aria-haspopup="true"
							onclick={(e) => {
								e.stopPropagation();
								openMega = openMega === item.label ? null : item.label;
							}}
						>
							{item.label}
							<svg class="h-3.5 w-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</button>
						{#if openMega === item.label}
							<div
								class="absolute left-0 top-full z-[60] mt-2 w-[min(100vw-2rem,42rem)] rounded-2xl border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(23,22,22,0.15)] backdrop-blur-2xl ring-1 ring-black/5"
								role="region"
								aria-label={item.label}
							>
								<div class="grid gap-8 sm:grid-cols-2">
									{#each item.columns as col (col.title)}
										<div>
											<p
												class="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary"
											>
												{col.title}
											</p>
											<ul class="mt-4 space-y-2">
												{#each col.links as link (link.href + link.label)}
													<li>
														<a
															class="block rounded-lg px-2.5 py-2 text-sm font-semibold text-brand-dark transition hover:bg-brand-primary/10 hover:text-brand-primary"
															href={link.href}
															onclick={closeMega}>{link.label}</a
														>
													</li>
												{/each}
											</ul>
										</div>
									{/each}
								</div>
								{#if item.href}
									<div class="mt-6 border-t border-zinc-200/60 pt-4">
										<a
											class="text-sm font-bold text-brand-primary hover:underline"
											href={item.href}
											onclick={closeMega}>View all →</a
										>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{:else}
					<a
						class="rounded-full px-3 py-2 text-[13px] font-semibold text-brand-dark/90 transition hover:bg-black/5 hover:text-brand-primary xl:px-4 xl:text-sm"
						href={item.href}>{item.label}</a
					>
				{/if}
			{/each}
		</nav>

		<div class="hidden items-center gap-3 md:flex">
			<a
				class="rounded-full bg-brand-primary px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-[0_4px_20px_rgba(249,92,75,0.35)] transition hover:bg-brand-secondary hover:shadow-[0_6px_25px_rgba(249,92,75,0.45)] lg:px-6"
				href={cta.href}>{cta.label}</a
			>
			<a
				class="rounded-full border border-brand-dark/20 bg-white/40 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-brand-dark backdrop-blur-sm transition hover:border-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary"
				href="/admin">Staff Portal</a
			>
		</div>

		<div class="flex items-center gap-2 md:hidden">
			<a
				class="rounded-full bg-brand-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-md"
				href={cta.href}>{cta.label}</a
			>
			<button
				type="button"
				class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white/80 text-brand-dark shadow-sm backdrop-blur-md"
				aria-expanded={menuOpen}
				aria-controls="mobile-nav-panel"
				aria-label={menuOpen ? 'Close menu' : 'Open menu'}
				onclick={() => (menuOpen = !menuOpen)}
			>
				{#if menuOpen}
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				{/if}
			</button>
		</div>
	</div>
</div>

{#if menuOpen}
	<div
		class="fixed inset-0 z-[70] md:hidden"
		role="dialog"
		aria-modal="true"
		aria-labelledby="mobile-nav-title"
		id="mobile-nav-panel"
	>
		<button
			type="button"
			tabindex="-1"
			class="absolute inset-0 bg-[#171616]/70 backdrop-blur-md"
			onclick={closeMenu}
			aria-label="Close menu overlay"
		></button>
		<div
			bind:this={mobilePanelEl}
			class="absolute right-0 top-0 flex h-full w-[min(100%,22rem)] flex-col bg-white/95 backdrop-blur-2xl shadow-2xl outline-none"
			role="document"
		>
			<div class="flex h-14 items-center justify-between border-b border-zinc-200/60 px-4">
				<span id="mobile-nav-title" class="font-sans text-sm font-bold text-brand-dark">Navigation</span>
				<button type="button" class="rounded-full p-2 hover:bg-black/5" onclick={closeMenu} aria-label="Close">
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<div class="flex flex-1 flex-col overflow-y-auto">
				<div class="border-b border-zinc-100 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
					Quick links
				</div>
				<div class="grid gap-1 px-4 pb-3">
					<a
						class="rounded-lg px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-brand-primary/10 hover:text-brand-primary transition"
						href={watchHref}
						onclick={closeMenu}>Watch</a
					>
					<a
						class="rounded-lg px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-brand-primary/10 hover:text-brand-primary transition"
						href={messagesHref}
						onclick={closeMenu}>Messages</a
					>
					<a
						class="rounded-lg px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-brand-primary/10 hover:text-brand-primary transition"
						href={givingHref}
						onclick={closeMenu}>Give</a
					>
				</div>
				<nav class="flex flex-1 flex-col gap-1 px-4 pb-8" aria-label="Mobile">
					{#each navItems as item, mi (`mnav-${mi}`)}
						{#if isMegaNavItem(item)}
							<div class="py-2">
								<p class="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
									{item.label}
								</p>
								{#each item.columns as col}
									<p class="mt-3 text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
										{col.title}
									</p>
									<ul class="mt-1 space-y-0.5">
										{#each col.links as link}
											<li>
												<a
													class="block rounded-lg px-3 py-2 text-[15px] font-semibold text-brand-dark hover:bg-brand-primary/10 hover:text-brand-primary transition"
													href={link.href}
													onclick={closeMenu}>{link.label}</a
												>
											</li>
										{/each}
									</ul>
								{/each}
							</div>
						{:else}
							<a
								class="rounded-xl px-3 py-3 text-base font-semibold text-brand-dark hover:bg-brand-primary/10 hover:text-brand-primary transition"
								href={item.href}
								onclick={closeMenu}>{item.label}</a
							>
						{/if}
					{/each}
					<a
						class="mt-2 rounded-xl px-3 py-3 text-base font-semibold text-brand-primary hover:bg-brand-primary/10 transition"
						href="/admin"
						onclick={closeMenu}>Staff Portal</a
					>
				</nav>
			</div>
		</div>
	</div>
{/if}
