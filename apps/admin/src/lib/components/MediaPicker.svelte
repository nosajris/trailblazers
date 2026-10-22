<script lang="ts">
	import { publicMediaUrl } from '@trailblazers/core/util/public-media-url';

	type MediaAsset = {
		id: number;
		url: string;
		width: number;
		height: number;
		variants: Record<string, string>;
	};

	let { onselect }: { onselect: (url: string) => void } = $props();

	let open = $state(false);
	let loading = $state(false);
	let error = $state('');
	let assets = $state<MediaAsset[]>([]);
	let loaded = false;

	async function openPicker() {
		open = true;
		if (loaded) return;

		loading = true;
		error = '';
		try {
			const response = await fetch('/api/media');
			if (!response.ok) throw new Error('That failed to load.');
			const result = await response.json();
			assets = result.assets ?? [];
			loaded = true;
		} catch {
			error = "Couldn't load the media library.";
		} finally {
			loading = false;
		}
	}

	function closePicker() {
		open = false;
	}

	function pick(asset: MediaAsset) {
		onselect(asset.url);
		closePicker();
	}

	/**
	 * The smallest variant available, for a fast-loading grid thumbnail.
	 * `asset.url`/`variants` are bare Blob pathnames (the store is private),
	 * so this is the display-only rewrite to `/media/<pathname>` —
	 * `pick()` below still passes the raw, un-rewritten value to `onselect`,
	 * since that's what gets stored.
	 */
	function thumbnailFor(asset: MediaAsset) {
		const widths = Object.keys(asset.variants)
			.map(Number)
			.filter((n) => Number.isFinite(n))
			.sort((a, b) => a - b);
		const raw = widths.length > 0 ? asset.variants[String(widths[0])] : asset.url;
		return publicMediaUrl(raw) ?? raw;
	}
</script>

<button type="button" onclick={openPicker} class="admin-btn-secondary shrink-0 px-3 py-2 text-xs">
	Browse library
</button>

{#if open}
	<div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
		<div class="w-full max-w-2xl admin-card bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-bold text-[var(--zinc-900)]">Media library</h2>
				<button type="button" onclick={closePicker} class="text-sm text-[var(--zinc-500)] hover:text-[var(--zinc-900)]">
					Close
				</button>
			</div>

			{#if loading}
				<p class="py-8 text-center text-sm text-[var(--zinc-500)]">Loading…</p>
			{:else if error}
				<p class="py-8 text-center text-sm font-semibold text-[var(--color-danger-fg)]">{error}</p>
			{:else if assets.length === 0}
				<p class="py-8 text-center text-sm text-[var(--zinc-500)]">
					Nothing uploaded yet. Use "Upload" on an image field to add the first one.
				</p>
			{:else}
				<div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
					{#each assets as asset (asset.id)}
						<button
							type="button"
							onclick={() => pick(asset)}
							class="group overflow-hidden rounded-lg border border-[var(--zinc-200)] focus:outline-2 focus:outline-[var(--brand-primary)]"
						>
							<img
								src={thumbnailFor(asset)}
								alt=""
								class="aspect-square w-full object-cover transition group-hover:opacity-80"
								loading="lazy"
							/>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}
