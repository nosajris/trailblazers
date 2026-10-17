<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const maxViews = $derived(Math.max(1, ...data.report.series.map((d) => d.views)));

	function formatDay(day: string): string {
		// day is YYYY-MM-DD; show it as e.g. "Oct 14" without pulling in a date library.
		const [, month, date] = day.split('-').map(Number);
		const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return `${names[month - 1]} ${date}`;
	}
</script>

<div class="space-y-8">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight text-zinc-900">Site Analytics</h1>
			<p class="text-sm text-zinc-500">
				How many people visited the public site, where they came from, and what they clicked. No
				cookies, no stored addresses — just daily counts.
			</p>
		</div>
		<div class="inline-flex rounded-xl border border-zinc-200 bg-white p-1 text-xs font-semibold">
			<a
				href={resolve('/analytics?range=7')}
				class="rounded-lg px-3 py-1.5 transition {data.days === 7 ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}"
			>
				7 days
			</a>
			<a
				href={resolve('/analytics?range=30')}
				class="rounded-lg px-3 py-1.5 transition {data.days === 30 ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}"
			>
				30 days
			</a>
		</div>
	</div>

	<!-- Headline numbers -->
	<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
		<div class="admin-card bg-white border border-zinc-200 rounded-xl shadow-sm p-5">
			<div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Page views</div>
			<div class="mt-2 text-3xl font-bold text-zinc-900">{data.report.views.toLocaleString()}</div>
		</div>
		<div class="admin-card bg-white border border-zinc-200 rounded-xl shadow-sm p-5">
			<div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Visitors</div>
			<div class="mt-2 text-3xl font-bold text-zinc-900">{data.report.visitors.toLocaleString()}</div>
		</div>
		<div class="admin-card bg-white border border-zinc-200 rounded-xl shadow-sm p-5">
			<div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Link clicks</div>
			<div class="mt-2 text-3xl font-bold text-zinc-900">{data.report.clicks.toLocaleString()}</div>
		</div>
		<div class="admin-card bg-white border border-zinc-200 rounded-xl shadow-sm p-5">
			<div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Click-through rate</div>
			<div class="mt-2 text-3xl font-bold text-zinc-900">{data.report.rate}%</div>
		</div>
	</div>

	<!-- Daily views chart (plain CSS bars — no charting library) -->
	<div class="admin-card bg-white border border-zinc-200 rounded-xl shadow-sm p-5">
		<h2 class="text-sm font-semibold text-zinc-900 mb-4">Views per day</h2>
		{#if data.report.views === 0}
			<p class="text-sm text-zinc-400">No views recorded yet for this window.</p>
		{:else}
			<div class="flex items-end gap-1.5 h-40">
				{#each data.report.series as point (point.day)}
					<div class="flex-1 flex flex-col items-center gap-1.5 group">
						<div class="relative w-full flex-1 flex items-end">
							<div
								class="w-full rounded-t bg-brand-primary/80 group-hover:bg-brand-primary transition"
								style="height: {Math.max(2, Math.round((point.views / maxViews) * 100))}%"
								title="{formatDay(point.day)}: {point.views} views, {point.visitors} visitors"
							></div>
						</div>
						{#if data.days <= 7}
							<span class="text-[10px] text-zinc-400">{formatDay(point.day)}</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
		<!-- Traffic sources -->
		<div class="admin-card bg-white border border-zinc-200 rounded-xl shadow-sm p-5">
			<h2 class="text-sm font-semibold text-zinc-900 mb-4">Where visitors came from</h2>
			{#if data.report.sources.length === 0}
				<p class="text-sm text-zinc-400">No source data yet.</p>
			{:else}
				<ul class="space-y-2">
					{#each data.report.sources as source (source.name + source.tag)}
						<li class="flex items-center justify-between text-sm">
							<span class="text-zinc-700">
								{source.name}
								{#if source.tag}
									<span class="ml-1 text-[10px] text-zinc-400 font-medium">tagged link</span>
								{/if}
							</span>
							<span class="font-semibold text-zinc-900">{source.n.toLocaleString()}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Top clicked links -->
		<div class="admin-card bg-white border border-zinc-200 rounded-xl shadow-sm p-5">
			<h2 class="text-sm font-semibold text-zinc-900 mb-4">Most-clicked links</h2>
			{#if data.report.links.length === 0}
				<p class="text-sm text-zinc-400">No tracked clicks yet.</p>
			{:else}
				<ul class="space-y-2">
					{#each data.report.links as link (link.href)}
						<li class="flex items-center justify-between text-sm gap-3">
							<span class="text-zinc-700 truncate">{link.label || link.href}</span>
							<span class="font-semibold text-zinc-900 flex-none">{link.n.toLocaleString()}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>

	{#if data.report.campaigns.length > 0}
		<div class="admin-card bg-white border border-zinc-200 rounded-xl shadow-sm p-5">
			<h2 class="text-sm font-semibold text-zinc-900 mb-4">Campaign links (UTM)</h2>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100">
							<th class="pb-2 pr-4">Source</th>
							<th class="pb-2 pr-4">Medium</th>
							<th class="pb-2 pr-4">Content</th>
							<th class="pb-2 pr-4">Campaign</th>
							<th class="pb-2 text-right">Visitors</th>
						</tr>
					</thead>
					<tbody>
						{#each data.report.campaigns as c (c.source + c.medium + c.content + c.campaign)}
							<tr class="border-b border-zinc-50">
								<td class="py-2 pr-4 text-zinc-700">{c.source || '—'}</td>
								<td class="py-2 pr-4 text-zinc-700">{c.medium || '—'}</td>
								<td class="py-2 pr-4 text-zinc-700">{c.content || '—'}</td>
								<td class="py-2 pr-4 text-zinc-700">{c.campaign || '—'}</td>
								<td class="py-2 text-right font-semibold text-zinc-900">{c.n.toLocaleString()}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
