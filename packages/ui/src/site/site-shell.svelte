<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SiteSettingsBundle } from '@trailblazers/core';
	import Navbar from './navbar.svelte';
	import Footer from './footer.svelte';

	type NavLink = { label: string; href: string };

	let {
		settings,
		cta,
		children
	}: {
		settings: SiteSettingsBundle;
		cta?: NavLink;
		children: Snippet;
	} = $props();

	const ctaResolved = $derived(
		cta ?? {
			label: 'Plan a visit',
			href: settings.siteExtras.planVisitHref ?? '/plan-a-visit'
		}
	);
</script>

<div class="min-h-screen overflow-x-hidden bg-brand-light text-brand-dark antialiased">
	<Navbar navItems={settings.navLinks} extras={settings.siteExtras} cta={ctaResolved} />
	<main id="main-content">
		{@render children()}
	</main>
	<Footer columns={settings.footerColumns} extras={settings.siteExtras} />
</div>
