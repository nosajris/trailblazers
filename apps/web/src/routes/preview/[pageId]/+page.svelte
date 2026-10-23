<script lang="ts">
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import HomeBlocks from '@trailblazers/ui/home/home-blocks.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Draft preview — {data.page.title}</title>
	<!--
		Unpublished content: never indexed, and never followed to whatever it
		links to either. `SeoMeta` is deliberately not used here — its job is to
		make a page shareable, which is the opposite of what this page wants.
	-->
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<!--
	The banner is fixed rather than inline so it survives a scroll: the whole
	risk of a preview is someone reading it as the live page and acting on it.
-->
<div class="tb-preview-banner" role="status">
	<strong>Draft preview</strong>
	<span>
		This is how <code>{data.page.slug}</code> will look once it is published. Visitors cannot see
		this yet.
	</span>
</div>

<div class="tb-preview-offset">
	<SiteShell settings={data.settings}>
		{#if data.blocks.length === 0}
			<section class="tb-preview-empty">
				<p>This page has no sections to show yet.</p>
			</section>
		{:else}
			<HomeBlocks blocks={data.blocks} extras={data.settings.siteExtras} variant="page" />
		{/if}
	</SiteShell>
</div>

<style>
	.tb-preview-banner {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background-color: var(--color-warning-bg);
		color: var(--color-warning-fg);
		border-bottom: 1px solid var(--color-warning-border);
		padding: 0.5rem 1rem;
		font-size: 0.8rem;
		text-align: center;
	}
	.tb-preview-offset {
		padding-top: 2.75rem;
	}
	.tb-preview-empty {
		padding: 6rem 1rem;
		text-align: center;
		color: var(--zinc-500);
	}
</style>
