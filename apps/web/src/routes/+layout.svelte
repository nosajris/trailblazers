<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { data, children } = $props();

	const structuredDataJson = $derived(
		JSON.stringify([data.jsonLdOrganization, data.jsonLdWebsite]).replace(/</g, '\\u003c')
	);
	// The tag is assembled here, with its name split, because a literal script tag
	// inside the template confuses the Svelte parser (and the linter).
	const structuredDataTag = $derived(
		'<scr' + 'ipt type="application/ld+json">' + structuredDataJson + '</scr' + 'ipt>'
	);

	onMount(() => {
		// Registered after load so it never competes with the first render.
		// Failure is non-fatal: the site works exactly as before without it.
		if (!('serviceWorker' in navigator)) return;

		navigator.serviceWorker.register('/service-worker.js').catch(() => {
			// Unsupported browser, private mode, or an insecure origin. Ignore.
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!--
		theme_color lives in manifest.webmanifest, not in a meta tag here.
		A meta tag would mean a second copy of the brand hex outside tokens.css,
		which the guardrail in packages/ui/src/tokens.test.ts rightly rejects.
		Android Chrome — the dominant browser for this audience — reads the
		manifest value.
	-->
	<link rel="manifest" href="/manifest.webmanifest" />
	<link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-title" content="Trailblazers" />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD built from our own data with every "<" escaped to \u003c, so it cannot close the tag -->
	{@html structuredDataTag}
</svelte:head>

{@render children()}
