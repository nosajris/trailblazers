<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-[var(--zinc-900)]">Transformation Stories & Articles Manager</h1>
			<p class="text-sm text-[var(--zinc-500)]">Draft, edit, and publish life testimonies and blog stories.</p>
		</div>
	</div>

	<div class="overflow-hidden admin-card">
		<table class="admin-table">
			<thead>
				<tr>
					<th>Title</th>
					<th>Category</th>
					<th>Summary</th>
					<th>Created Date</th>
				</tr>
			</thead>
			<tbody>
				{#if data.posts.length === 0}
					<tr>
						<td colspan="4" class="py-8 text-center text-sm text-[var(--zinc-500)]">No stories published yet.</td>
					</tr>
				{:else}
					{#each data.posts as post}
						<tr>
							<td class="font-medium text-[var(--zinc-900)]">{post.title}</td>
							<td>
								<span class="admin-badge admin-badge-neutral">{post.category || 'Story'}</span>
							</td>
							<td class="text-sm text-[var(--zinc-600)] line-clamp-1">{post.summary}</td>
							<td class="text-sm text-[var(--zinc-400)]">{new Date(post.createdAt).toLocaleDateString()}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
