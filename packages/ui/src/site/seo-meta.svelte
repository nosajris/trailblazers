<script lang="ts">
	/**
	 * Page metadata, including Open Graph and Twitter cards.
	 *
	 * The site had none of these. A church lives on links shared into WhatsApp
	 * groups and Facebook feeds, and without og: tags every one of those shares
	 * renders as a bare URL with no title, description, or image — which is a
	 * reach problem, not a cosmetic one.
	 *
	 * Drop this into a page's markup and it renders into <svelte:head>.
	 */

	type Props = {
		title: string;
		description: string;
		/** Absolute URL of this page. Falls back to the site root. */
		canonical?: string;
		/** Absolute or root-relative image path. */
		image?: string;
		imageAlt?: string;
		/** 'website' for pages, 'article' for a story or sermon. */
		type?: 'website' | 'article';
		siteName?: string;
		siteUrl?: string;
		/** Article-only. ISO date strings. */
		publishedTime?: string;
		modifiedTime?: string;
		/** Keeps a page out of search results — use for token-driven pages. */
		noindex?: boolean;
	};

	let {
		title,
		description,
		canonical,
		image = '/images/wallpaper01.jpg',
		imageAlt,
		type = 'website',
		siteName = 'PAOZ Trailblazers',
		siteUrl = '',
		publishedTime,
		modifiedTime,
		noindex = false
	}: Props = $props();

	/** og:image must be absolute — relative paths are ignored by most crawlers. */
	const absoluteImage = $derived(
		image.startsWith('http') ? image : `${siteUrl}${image.startsWith('/') ? '' : '/'}${image}`
	);

	const canonicalUrl = $derived(canonical ?? siteUrl);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />

	{#if canonicalUrl}
		<link rel="canonical" href={canonicalUrl} />
	{/if}

	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}

	<!-- Open Graph: WhatsApp, Facebook, LinkedIn, Slack. -->
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={siteName} />
	{#if canonicalUrl}
		<meta property="og:url" content={canonicalUrl} />
	{/if}
	{#if absoluteImage}
		<meta property="og:image" content={absoluteImage} />
		<meta property="og:image:alt" content={imageAlt ?? title} />
	{/if}

	{#if type === 'article' && publishedTime}
		<meta property="article:published_time" content={publishedTime} />
	{/if}
	{#if type === 'article' && modifiedTime}
		<meta property="article:modified_time" content={modifiedTime} />
	{/if}

	<!-- Twitter/X. summary_large_image gives the full-width card. -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	{#if absoluteImage}
		<meta name="twitter:image" content={absoluteImage} />
		<meta name="twitter:image:alt" content={imageAlt ?? title} />
	{/if}
</svelte:head>
