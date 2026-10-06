<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';

	/**
	 * Public error page.
	 *
	 * Without this, a 404 or 500 rendered SvelteKit's unstyled default — a bare
	 * status code on a white page, with no way back into the site.
	 *
	 * It deliberately does not render `$page.error.message` for 5xx: server
	 * error messages are internal and are logged, not shown.
	 */

	const status = $derived($page.status);
	const isNotFound = $derived(status === 404);

	const heading = $derived(
		isNotFound ? 'We could not find that page' : 'Something went wrong on our end'
	);

	const body = $derived(
		isNotFound
			? 'The page may have moved, or the link that brought you here may be out of date.'
			: 'This is our problem, not yours. Please try again in a moment — if it keeps happening, let the office know.'
	);
</script>

<svelte:head>
	<title>{isNotFound ? 'Page not found' : 'Something went wrong'} — Trailblazers</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main id="main-content" class="flex min-h-screen items-center justify-center bg-brand-light px-4">
	<div class="mx-auto max-w-xl text-center">
		<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">
			Error {status}
		</p>
		<h1 class="mt-4 font-sans text-3xl font-black tracking-tight text-brand-dark md:text-4xl">
			{heading}
		</h1>
		<p class="mx-auto mt-5 max-w-md text-lg leading-relaxed text-brand-dark/75">
			{body}
		</p>

		<div class="mt-10 flex flex-wrap justify-center gap-4">
			<a
				class="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-primary px-10 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg transition hover:brightness-105"
				href={resolve('/')}
			>
				Back to the homepage
			</a>
			<a
				class="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-dark/15 bg-white px-10 text-xs font-bold uppercase tracking-[0.14em] text-brand-dark transition hover:border-brand-primary"
				href={resolve('/contact')}
			>
				Contact the office
			</a>
		</div>

		{#if isNotFound}
			<nav class="mt-12" aria-label="Popular pages">
				<p class="text-xs font-bold uppercase tracking-[0.18em] text-brand-dark/70">
					Or try one of these
				</p>
				<ul class="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
					<li><a class="text-brand-primary hover:underline" href={resolve('/events')}>Events</a></li>
					<li><a class="text-brand-primary hover:underline" href={resolve('/watch')}>Watch</a></li>
					<li><a class="text-brand-primary hover:underline" href={resolve('/groups')}>Groups</a></li>
					<li><a class="text-brand-primary hover:underline" href={resolve('/plan-a-visit')}>Plan a visit</a></li>
				</ul>
			</nav>
		{/if}
	</div>
</main>
