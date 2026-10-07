<script lang="ts">
	import SeoMeta from '@trailblazers/ui/site/seo-meta.svelte';
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import HomeBlocks from '@trailblazers/ui/home/home-blocks.svelte';
	import type { HomeSectionBlock, SermonCardVm, SiteSettingsBundle } from '@trailblazers/core';

	let {
		data
	}: {
		data: { settings: SiteSettingsBundle; blocks: HomeSectionBlock[]; latestSermon: SermonCardVm | null };
	} = $props();

	/** The hero photo doubles as the link preview image for shares of the homepage. */
	const heroImage = $derived.by(() => {
		const hero = data.blocks.find((b) => b.kind === 'HERO');
		return (hero?.kind === 'HERO' ? hero.data.imageUrl : undefined) ?? '/images/wallpaper01.jpg';
	});
</script>

<SeoMeta
	title={data.settings.seoDefaults.title}
	description={data.settings.seoDefaults.description}
	image={heroImage}
/>

<SiteShell settings={data.settings}>
	<HomeBlocks blocks={data.blocks} latestSermon={data.latestSermon} extras={data.settings.siteExtras} />
</SiteShell>
