<script lang="ts">
	import { page } from '$app/stores';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const token = $derived($page.url.searchParams.get('token') ?? '');
	const heading = $derived(data.valid && data.purpose === 'RESET' ? 'Reset your password' : 'Set your password');
</script>

<svelte:head>
	<title>{heading} — Trailblazers Staff</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-[var(--zinc-900)] p-4">
	<div class="admin-card w-full max-w-md bg-white/95 p-8 shadow-2xl backdrop-blur-md">
		<div class="text-center">
			<div
				class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-xl font-bold text-white shadow-md"
			>
				T
			</div>
			<h1 class="mt-4 text-2xl font-black text-[var(--zinc-900)]">{heading}</h1>
		</div>

		{#if !data.valid}
			<div
				class="mt-6 rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-4 text-center text-sm text-[var(--color-danger-fg)]"
			>
				<p class="font-semibold">This link is no longer valid.</p>
				<p class="mt-2 text-xs">
					Invite and reset links last 48 hours and work once. Ask an administrator to send a new one.
				</p>
			</div>
			<a
				href="/login"
				class="mt-6 block text-center text-xs font-semibold uppercase tracking-wider text-[var(--zinc-500)] hover:text-[var(--brand-primary)]"
			>
				Back to sign in
			</a>
		{:else}
			<p class="mt-2 text-center text-sm text-[var(--zinc-500)]">
				Choose a password of at least 12 characters that you do not use anywhere else.
			</p>

			{#if form?.error}
				<div
					class="mt-4 rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-3 text-center text-xs font-semibold text-[var(--color-danger-fg)]"
				>
					{form.error}
				</div>
			{/if}

			<form method="POST" class="mt-6 space-y-4">
				<input type="hidden" name="token" value={token} />

				<div>
					<label
						for="new-password-input"
						class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]"
					>
						New password
					</label>
					<input
						id="new-password-input"
						type="password"
						name="password"
						required
						minlength="12"
						autocomplete="new-password"
						class="admin-input"
					/>
				</div>

				<div>
					<label
						for="confirm-password-input"
						class="mb-1 block text-xs font-semibold uppercase text-[var(--zinc-700)]"
					>
						Confirm password
					</label>
					<input
						id="confirm-password-input"
						type="password"
						name="confirmPassword"
						required
						minlength="12"
						autocomplete="new-password"
						class="admin-input"
					/>
				</div>

				<button
					type="submit"
					class="admin-btn-primary w-full py-3 text-xs font-bold uppercase tracking-wider shadow-md"
				>
					Save password
				</button>
			</form>
		{/if}
	</div>
</div>
