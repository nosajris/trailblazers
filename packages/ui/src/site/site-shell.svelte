<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SiteSettingsBundle } from '@trailblazers/core';
	import Navbar from './navbar.svelte';
	import Footer from './footer.svelte';
	import MobileBottomNav from './mobile-bottom-nav.svelte';

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
	<!--
		First stop for keyboard and screen-reader users: jumps past the whole
		navigation, which is a mega-menu with dozens of links. Visually hidden
		until it receives focus (see .skip-link in tokens.css).
	-->
	<a class="skip-link" href="#main-content">Skip to main content</a>
	<Navbar navItems={settings.navLinks} extras={settings.siteExtras} cta={ctaResolved} />
	<main id="main-content" tabindex="-1">
		{@render children()}
	</main>
	<Footer columns={settings.footerColumns} extras={settings.siteExtras} />
	<!-- Spacer so the fixed phone nav never hides the end of the footer. -->
	<div class="h-14 md:hidden" aria-hidden="true"></div>
	<MobileBottomNav extras={settings.siteExtras} />
</div>
