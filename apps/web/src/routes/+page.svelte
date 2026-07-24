<script lang="ts">
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import HomeBlocks from '@trailblazers/ui/home/home-blocks.svelte';
	import type { HomeSectionBlock } from '@trailblazers/core';
	import type { SiteSettingsBundle } from '@trailblazers/core';

	let {
		data
	}: {
		data: { settings: SiteSettingsBundle; blocks: HomeSectionBlock[] };
	} = $props();
</script>

<svelte:head>
	<title>{data.settings.seoDefaults.title}</title>
	<meta name="description" content={data.settings.seoDefaults.description} />
</svelte:head>

<SiteShell settings={data.settings}>
	<HomeBlocks blocks={data.blocks} />
</SiteShell>
