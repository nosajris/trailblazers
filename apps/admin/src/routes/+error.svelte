<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';

	/**
	 * Staff portal error page.
	 *
	 * 403 is the common one now that the portal is guarded per section: a
	 * secretary following a link to /users lands here. It says what happened in
	 * plain terms rather than showing SvelteKit's default status code.
	 *
	 * `$page.error.message` is shown only for 4xx, where the message is one we
	 * wrote deliberately. Server errors are logged, never rendered.
	 */

	const status = $derived($page.status);
	const isForbidden = $derived(status === 403);
	const isClientError = $derived(status >= 400 && status < 500);

	const heading = $derived(
		isForbidden
			? 'You do not have access to that'
			: status === 404
				? 'That page does not exist'
				: 'Something went wrong'
	);

	const detail = $derived(
		isForbidden
			? 'This area is limited to administrators. If you need access, ask an administrator to change your role.'
			: isClientError
				? ($page.error?.message ?? 'Please check the address and try again.')
				: 'The error has been logged. Please try again in a moment.'
	);
</script>

<svelte:head>
	<title>Error {status} — Trailblazers Staff</title>
</svelte:head>

<div class="flex min-h-[60vh] items-center justify-center p-6">
	<div class="admin-card max-w-lg p-8 text-center">
		<div
			class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-danger-bg)] text-xl font-bold text-[var(--color-danger-fg)]"
			aria-hidden="true"
		>
			!
		</div>

		<p class="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[var(--zinc-400)]">
			Error {status}
		</p>
		<h1 class="mt-2 text-2xl font-black text-[var(--zinc-900)]">{heading}</h1>
		<p class="mt-3 text-sm leading-relaxed text-[var(--zinc-500)]">{detail}</p>

		<div class="mt-8 flex flex-wrap justify-center gap-3">
			<a class="admin-btn-primary" href={resolve('/')}>Back to the dashboard</a>
			<button class="admin-btn-secondary" onclick={() => history.back()}>Go back</button>
		</div>
	</div>
</div>
