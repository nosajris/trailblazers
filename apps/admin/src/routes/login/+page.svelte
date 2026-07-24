<script lang="ts">
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-zinc-900 p-4">
	<div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
		<div class="text-center">
			<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-xl font-bold text-white shadow-md">
				T
			</div>
			<h1 class="mt-4 text-2xl font-black text-zinc-900">Trailblazers Staff CMS</h1>
			<p class="mt-1 text-sm text-zinc-500">Log in to manage church content, sermons & events.</p>
		</div>

		{#if form?.error}
			<div class="mt-4 rounded-lg bg-red-50 p-3 text-center text-xs font-semibold text-red-700 border border-red-200">
				{form.error}
			</div>
		{/if}

		<form method="POST" class="mt-6 space-y-4">
			<div>
				<label for="admin-email-input" class="block text-xs font-semibold uppercase text-zinc-700 mb-1">Email Address</label>
				<input
					id="admin-email-input"
					type="email"
					name="email"
					required
					placeholder="admin@trailblazers.org"
					class="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-brand-primary focus:outline-none"
				/>
			</div>

			<div>
				<label for="admin-password-input" class="block text-xs font-semibold uppercase text-zinc-700 mb-1">Password</label>
				<input
					id="admin-password-input"
					type="password"
					name="password"
					required
					class="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-brand-primary focus:outline-none"
				/>
			</div>

			<button
				type="submit"
				class="w-full rounded-lg bg-brand-primary py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-brand-primary/90"
			>
				Sign In to Staff Portal
			</button>
		</form>
	</div>
</div>
