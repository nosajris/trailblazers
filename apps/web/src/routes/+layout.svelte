<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { data, children } = $props();

	const structuredDataJson = $derived(
		JSON.stringify([data.jsonLdOrganization, data.jsonLdWebsite]).replace(/</g, '\\u003c')
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{@html `<script type="application/ld+json">${structuredDataJson}</script>`}
</svelte:head>

{@render children()}
