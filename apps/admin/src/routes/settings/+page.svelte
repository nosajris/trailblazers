<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6 max-w-3xl">
	<div>
		<h1 class="text-2xl font-bold text-zinc-900">Site Settings & Branding</h1>
		<p class="text-sm text-zinc-500">Configure global website announcement banners, links, and contact information.</p>
	</div>

	<form action="?/saveSettings" method="POST" class="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
		<div>
			<label for="admin-setting-watch" class="block text-xs font-semibold uppercase text-zinc-700 mb-1">Live Stream / Watch URL</label>
			<input
				id="admin-setting-watch"
				type="text"
				name="watchUrl"
				value={data.settings.siteExtras.watchUrl || '/watch'}
				class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
			/>
		</div>

		<div>
			<label for="admin-setting-giving" class="block text-xs font-semibold uppercase text-zinc-700 mb-1">Giving Portal URL</label>
			<input
				id="admin-setting-giving"
				type="text"
				name="givingUrl"
				value={data.settings.siteExtras.givingUrl || '/give'}
				class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
			/>
		</div>

		<div class="pt-4 border-t border-zinc-200 flex justify-end">
			<button type="submit" class="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary/90">
				Save Site Settings
			</button>
		</div>
	</form>
</div>
