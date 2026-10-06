<script lang="ts">
	import { resolve } from '$app/paths';
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';

	let { data } = $props();

	const COPY = {
		done: {
			title: 'You have been unsubscribed',
			body: 'You will not receive further email updates from Trailblazers. You are always welcome to sign up again from the footer of any page.'
		},
		unknown: {
			title: 'That link is no longer valid',
			body: 'It may already have been used, or the address may have been removed. If you are still receiving email you did not ask for, please contact the office.'
		},
		missing: {
			title: 'Nothing to unsubscribe',
			body: 'This page needs the unsubscribe link from one of our emails. Please use the link at the bottom of the message.'
		},
		error: {
			title: 'Something went wrong',
			body: 'We could not complete that just now. Please try the link again shortly, or contact the office and we will remove you manually.'
		}
	} as const;

	const copy = $derived(COPY[data.status]);
</script>

<svelte:head>
	<title>Unsubscribe — Trailblazers</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<SiteShell settings={data.settings}>
	<section class="border-b border-neutral-200/80 bg-brand-light py-20 md:py-28">
		<div class="mx-auto max-w-2xl px-4 text-center md:px-6">
			<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Email preferences</p>
			<h1 class="mt-4 font-sans text-3xl font-black tracking-tight text-brand-dark md:text-4xl">
				{copy.title}
			</h1>
			<p class="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-brand-dark/75">
				{copy.body}
			</p>
			<div class="mt-10 flex flex-wrap justify-center gap-4">
				<a
					class="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-primary px-10 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg transition hover:brightness-105"
					href={resolve('/')}
				>
					Back to the site
				</a>
				<a
					class="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-dark/15 bg-white px-10 text-xs font-bold uppercase tracking-[0.14em] text-brand-dark transition hover:border-brand-primary"
					href={resolve('/contact')}
				>
					Contact the office
				</a>
			</div>
		</div>
	</section>
</SiteShell>
