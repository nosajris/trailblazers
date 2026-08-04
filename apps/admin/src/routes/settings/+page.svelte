<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6 max-w-3xl">
	<div>
		<h1 class="text-2xl font-bold text-[var(--zinc-900)]">Site Settings & Branding</h1>
		<p class="text-sm text-[var(--zinc-500)]">Configure global website announcement banners, links, and contact information.</p>
	</div>

	<form action="?/saveSettings" method="POST" class="admin-card p-6 space-y-6">
		<div>
			<label for="admin-setting-watch" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Live Stream / Watch URL</label>
			<input
				id="admin-setting-watch"
				type="text"
				name="watchUrl"
				value={data.settings.siteExtras.watchUrl || '/watch'}
				class="admin-input"
			/>
		</div>

		<div>
			<label for="admin-setting-giving" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Giving Portal URL</label>
			<input
				id="admin-setting-giving"
				type="text"
				name="givingUrl"
				value={data.settings.siteExtras.givingUrl || '/give'}
				class="admin-input"
			/>
		</div>

		<div class="pt-4 border-t border-[var(--zinc-200)] flex justify-end">
			<button type="submit" class="admin-btn-primary">
				Save Site Settings
			</button>
		</div>
	</form>
</div>
