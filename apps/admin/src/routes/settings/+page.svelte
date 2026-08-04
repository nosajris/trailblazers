<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6 max-w-4xl">
	<div>
		<h1 class="text-2xl font-bold text-[var(--zinc-900)]">Site Settings & SEO Configuration</h1>
		<p class="text-sm text-[var(--zinc-500)]">Configure global organization details, platform links, media embeds, and SEO metadata.</p>
	</div>

	<form action="?/saveSettings" method="POST" class="admin-card p-8 space-y-8 bg-white">
		<!-- General Information -->
		<div class="space-y-4">
			<h2 class="text-base font-bold text-[var(--zinc-900)] border-b border-[var(--zinc-200)] pb-2">General Organization Details</h2>
			<div>
				<label for="admin-setting-org" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Organization Name</label>
				<input
					id="admin-setting-org"
					type="text"
					name="organizationName"
					value={data.settings.siteExtras.organizationName || 'Trailblazers Young Adults'}
					class="admin-input"
				/>
			</div>
		</div>

		<!-- Global URLs -->
		<div class="space-y-4">
			<h2 class="text-base font-bold text-[var(--zinc-900)] border-b border-[var(--zinc-200)] pb-2">Media & Platform Links</h2>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="admin-setting-watch" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Live Stream / Watch Path</label>
					<input
						id="admin-setting-watch"
						type="text"
						name="watchUrl"
						value={data.settings.siteExtras.watchUrl || '/watch'}
						class="admin-input"
					/>
				</div>

				<div>
					<label for="admin-setting-giving" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Giving Portal URL / Path</label>
					<input
						id="admin-setting-giving"
						type="text"
						name="givingUrl"
						value={data.settings.siteExtras.givingUrl || '/give'}
						class="admin-input"
					/>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="admin-setting-embed" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Watch Hero Embed URL (YouTube)</label>
					<input
						id="admin-setting-embed"
						type="text"
						name="watchEmbedUrl"
						value={data.settings.siteExtras.watchEmbedUrl || ''}
						placeholder="https://www.youtube.com/embed/..."
						class="admin-input"
					/>
				</div>

				<div>
					<label for="admin-setting-visit" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Plan a Visit Path</label>
					<input
						id="admin-setting-visit"
						type="text"
						name="planVisitHref"
						value={data.settings.siteExtras.planVisitHref || '/plan-a-visit'}
						class="admin-input"
					/>
				</div>
			</div>
		</div>

		<!-- SEO Defaults -->
		<div class="space-y-4">
			<h2 class="text-base font-bold text-[var(--zinc-900)] border-b border-[var(--zinc-200)] pb-2">SEO & Social Meta Defaults</h2>
			<div>
				<label for="admin-setting-seo-title" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Default Site Meta Title</label>
				<input
					id="admin-setting-seo-title"
					type="text"
					name="seoTitle"
					value={data.settings.seoDefaults.title}
					class="admin-input"
				/>
			</div>

			<div>
				<label for="admin-setting-seo-desc" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Default Meta Description</label>
				<textarea
					id="admin-setting-seo-desc"
					name="seoDescription"
					rows="3"
					class="admin-input"
				>{data.settings.seoDefaults.description}</textarea>
			</div>
		</div>

		<div class="pt-4 border-t border-[var(--zinc-200)] flex justify-end">
			<button type="submit" class="admin-btn-primary">
				Save Site Settings
			</button>
		</div>
	</form>
</div>

