<script lang="ts">
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import SeoMeta from '@trailblazers/ui/site/seo-meta.svelte';
	import HomeBlocks from '@trailblazers/ui/home/home-blocks.svelte';

	let { data } = $props();

	const orgName = $derived(data.settings.siteExtras.organizationName ?? 'Trailblazers');
</script>

<SeoMeta
	title={`About — ${orgName}`}
	description={`Who we are, what we believe, and who leads ${orgName}.`}
	image="/images/image08.jpeg"
/>

<SiteShell settings={data.settings}>
	<HomeBlocks blocks={data.blocks} extras={data.settings.siteExtras} variant="page" />
</SiteShell>
