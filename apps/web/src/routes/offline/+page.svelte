<script lang="ts">
	/**
	 * Offline fallback, precached by the service worker.
	 *
	 * Deliberately standalone: no data loading, no shell, nothing that needs a
	 * network round trip — it has to render from cache alone.
	 */
</script>

<svelte:head>
	<title>You are offline — Trailblazers</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main id="main-content" class="flex min-h-screen items-center justify-center bg-brand-light px-4">
	<div class="mx-auto max-w-md text-center">
		<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Offline</p>
		<h1 class="mt-4 font-sans text-3xl font-black tracking-tight text-brand-dark">
			No connection right now
		</h1>
		<p class="mt-5 text-lg leading-relaxed text-brand-dark/75">
			You are not connected to the internet. Pages you have already visited will still open — try
			again once you have signal.
		</p>

		<button
			class="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-brand-primary px-10 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg transition hover:brightness-105"
			onclick={() => location.reload()}
		>
			Try again
		</button>
	</div>
</main>
