<script lang="ts">
	import SeoMeta from '@trailblazers/ui/site/seo-meta.svelte';
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import { container, sectionY } from '@trailblazers/ui/tb-layout';
	import { resolve } from '$app/paths';
	import type { SiteSettingsBundle } from '@trailblazers/core';

	let {
		data,
		form
	}: {
		data: { settings: SiteSettingsBundle; next: string };
		form: { error?: string } | null;
	} = $props();
</script>

<SeoMeta title="Sign in — Trailblazers" description="Sign in to your Trailblazers account." noindex />

<SiteShell settings={data.settings}>
	<section class="bg-brand-light {sectionY}">
		<div class="{container} max-w-md">
			<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Account</p>
			<h1 class="mt-2 font-sans text-2xl font-black text-brand-dark md:text-3xl">Sign in</h1>
			<p class="mt-3 text-brand-dark/75">See your giving and event registration history.</p>

			{#if form?.error}
				<div class="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
					{form.error}
				</div>
			{/if}

			<form method="POST" class="mt-8 space-y-6">
				<input type="hidden" name="next" value={data.next} />
				<div>
					<label class="text-xs font-bold uppercase tracking-wide text-brand-dark/60" for="email">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						autocomplete="email"
						class="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
					/>
				</div>
				<div>
					<label class="text-xs font-bold uppercase tracking-wide text-brand-dark/60" for="password"
						>Password</label
					>
					<input
						id="password"
						name="password"
						type="password"
						required
						autocomplete="current-password"
						class="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
					/>
				</div>
				<button
					type="submit"
					class="w-full rounded-full bg-brand-primary px-10 py-4 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md transition hover:brightness-105"
				>
					Sign in
				</button>
			</form>

			<p class="mt-6 text-sm text-brand-dark/70">
				New here?
				<a href={resolve('/account/signup')} class="font-semibold text-brand-primary hover:underline">Create an account</a>
			</p>
		</div>
	</section>
</SiteShell>
