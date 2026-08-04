<script lang="ts">
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-[var(--zinc-900)] p-4">
	<div class="w-full max-w-md admin-card p-8 shadow-2xl bg-white/95 backdrop-blur-md">
		<div class="text-center">
			<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-xl font-bold text-white shadow-md">
				T
			</div>
			<h1 class="mt-4 text-2xl font-black text-[var(--zinc-900)]">Trailblazers Staff CMS</h1>
			<p class="mt-1 text-sm text-[var(--zinc-500)]">Log in to manage church content, sermons & events.</p>
		</div>

		{#if form?.error}
			<div class="mt-4 rounded-lg bg-[var(--color-danger-bg)] p-3 text-center text-xs font-semibold text-[var(--color-danger-fg)] border border-[var(--color-danger-border)]">
				{form.error}
			</div>
		{/if}

		<form method="POST" class="mt-6 space-y-4">
			<div>
				<label for="admin-email-input" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Email Address</label>
				<input
					id="admin-email-input"
					type="email"
					name="email"
					required
					placeholder="admin@trailblazers.org"
					class="admin-input"
				/>
			</div>

			<div>
				<label for="admin-password-input" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Password</label>
				<input
					id="admin-password-input"
					type="password"
					name="password"
					required
					class="admin-input"
				/>
			</div>

			<button
				type="submit"
				class="admin-btn-primary w-full py-3 text-xs font-bold uppercase tracking-wider shadow-md"
			>
				Sign In to Staff Portal
			</button>
		</form>
	</div>
</div>
