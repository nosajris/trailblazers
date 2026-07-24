<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-bold text-zinc-900">Visitor & Serve Leads Management</h1>
		<p class="text-sm text-zinc-500">Track newcomer VIP visit requests, volunteer applications, and staff follow-up tasks.</p>
	</div>

	<!-- Tasks List -->
	<div class="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
		<h2 class="text-lg font-bold text-zinc-900 mb-4">Assigned Follow-up Tasks</h2>
		{#if data.tasks.length === 0}
			<p class="text-sm text-zinc-500 text-center py-4">No pending follow-up tasks.</p>
		{:else}
			<div class="space-y-3">
				{#each data.tasks as task}
					<div class="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-zinc-50/50">
						<div>
							<div class="font-semibold text-sm text-zinc-900 {task.isCompleted ? 'line-through text-zinc-400' : ''}">{task.title}</div>
							{#if task.description}
								<div class="text-xs text-zinc-500">{task.description}</div>
							{/if}
						</div>
						<form action="?/toggleTask" method="POST">
							<input type="hidden" name="taskId" value={task.id} />
							<input type="hidden" name="isCompleted" value={task.isCompleted ? 'false' : 'true'} />
							<button
								type="submit"
								class="rounded-md px-3 py-1 text-xs font-semibold transition {task.isCompleted ? 'bg-zinc-200 text-zinc-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}"
							>
								{task.isCompleted ? 'Completed ✓' : 'Mark Done'}
							</button>
						</form>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Submissions Table -->
	<div class="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
		<h2 class="text-lg font-bold text-zinc-900 mb-4">Recent Inquiries & Contact Submissions</h2>
		<div class="overflow-hidden rounded-lg border border-zinc-200">
			<table class="min-w-full divide-y divide-zinc-200">
				<thead class="bg-zinc-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Name</th>
						<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</th>
						<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Message</th>
						<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Submitted At</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-zinc-200 bg-white">
					{#if data.inquiries.length === 0}
						<tr>
							<td colspan="4" class="px-6 py-8 text-center text-sm text-zinc-500">No contact inquiries received yet.</td>
						</tr>
					{:else}
						{#each data.inquiries as item}
							<tr class="hover:bg-zinc-50/50">
								<td class="px-6 py-4 font-medium text-zinc-900">{item.fullName}</td>
								<td class="px-6 py-4 text-sm text-zinc-600">{item.email}</td>
								<td class="px-6 py-4 text-sm text-zinc-600">{item.message}</td>
								<td class="px-6 py-4 text-sm text-zinc-400">{new Date(item.createdAt).toLocaleDateString()}</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
