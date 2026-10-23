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
		data: { settings: SiteSettingsBundle; formToken: string };
		form: { error?: string } | null;
	} = $props();
</script>

<SeoMeta title="Create an account — Trailblazers" description="Create a Trailblazers account." noindex />

<SiteShell settings={data.settings}>
	<section class="bg-brand-light {sectionY}">
		<div class="{container} max-w-md">
			<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Account</p>
			<h1 class="mt-2 font-sans text-2xl font-black text-brand-dark md:text-3xl">Create an account</h1>
			<p class="mt-3 text-brand-dark/75">Keep track of your giving and event registrations in one place.</p>

			{#if form?.error}
				<div class="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
					{form.error}
				</div>
			{/if}

			<form method="POST" class="mt-8 space-y-6">
				<!--
					Decoy field: hidden from people and assistive tech, but filled in by
					form-spamming bots. The server drops any submission that carries it.
				-->
				<div class="hidden" aria-hidden="true">
					<label for="signup-website">Leave this field empty</label>
					<input id="signup-website" type="text" name="website" tabindex="-1" autocomplete="off" />
				</div>
				<input type="hidden" name="_ft" value={data.formToken} />
				<div>
					<label class="text-xs font-bold uppercase tracking-wide text-brand-dark/60" for="fullName"
						>Full name</label
					>
					<input
						id="fullName"
						name="fullName"
						required
						autocomplete="name"
						class="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
					/>
				</div>
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
						minlength="12"
						autocomplete="new-password"
						class="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
					/>
					<p class="mt-1.5 text-xs text-brand-dark/50">At least 12 characters.</p>
				</div>
				<div>
					<label class="text-xs font-bold uppercase tracking-wide text-brand-dark/60" for="confirmPassword"
						>Confirm password</label
					>
					<input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						required
						minlength="12"
						autocomplete="new-password"
						class="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
					/>
				</div>
				<button
					type="submit"
					class="w-full rounded-full bg-brand-primary px-10 py-4 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md transition hover:brightness-105"
				>
					Create account
				</button>
			</form>

			<p class="mt-6 text-sm text-brand-dark/70">
				Already have an account?
				<a href={resolve('/account/login')} class="font-semibold text-brand-primary hover:underline">Sign in</a>
			</p>
		</div>
	</section>
</SiteShell>
