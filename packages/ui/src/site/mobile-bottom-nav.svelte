<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import type { SiteExtras } from '@trailblazers/core';
	import { isActivePath } from './nav-utils.js';

	let { extras }: { extras: SiteExtras } = $props();

	const givingHref = $derived(extras.givingUrl?.trim() ? extras.givingUrl : '/give');

	const items = $derived([
		{ label: 'Home', href: resolve('/'), icon: 'home' },
		{ label: 'Events', href: resolve('/events'), icon: 'calendar' },
		{ label: 'Groups', href: resolve('/groups'), icon: 'users' },
		{ label: 'Give', href: givingHref, icon: 'heart' }
	]);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- the giving link comes from site settings and may be an absolute external URL, which resolve() cannot take -->

<!--
	Thumb-reach navigation for phones. Hidden from md up, where the header nav is
	always visible. The page reserves matching space at the bottom (see site-shell)
	so it never covers the footer or a form's submit button.
-->
<nav
	class="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
	aria-label="Quick navigation"
>
	<ul class="grid grid-cols-4">
		{#each items as item (item.label)}
			{@const active = isActivePath($page.url.pathname, item.href)}
			<li>
				<a
					href={item.href}
					aria-current={active ? 'page' : undefined}
					class="flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition {active
						? 'text-brand-primary'
						: 'text-brand-dark/70 hover:text-brand-primary'}"
				>
					<svg
						class="h-5 w-5 fill-none stroke-current stroke-2"
						viewBox="0 0 24 24"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						{#if item.icon === 'home'}
							<path d="M3 11l9-8 9 8" />
							<path d="M5 10v10h14V10" />
						{:else if item.icon === 'calendar'}
							<rect x="3" y="4" width="18" height="17" rx="2" />
							<path d="M16 2v4M8 2v4M3 10h18" />
						{:else if item.icon === 'users'}
							<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
							<circle cx="9" cy="7" r="4" />
							<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
							<path d="M16 3.13a4 4 0 0 1 0 7.75" />
						{:else}
							<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
						{/if}
					</svg>
					{item.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
