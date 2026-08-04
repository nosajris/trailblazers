<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-bold text-[var(--zinc-900)]">Visitor & Serve Leads Management</h1>
		<p class="text-sm text-[var(--zinc-500)]">Track newcomer VIP visit requests, volunteer applications, and staff follow-up tasks.</p>
	</div>

	<!-- Tasks List -->
	<div class="admin-card p-6">
		<h2 class="text-lg font-bold text-[var(--zinc-900)] mb-4">Assigned Follow-up Tasks</h2>
		{#if data.tasks.length === 0}
			<p class="text-sm text-[var(--zinc-500)] text-center py-4">No pending follow-up tasks.</p>
		{:else}
			<div class="space-y-3">
				{#each data.tasks as task}
					<div class="flex items-center justify-between p-3.5 rounded-lg border border-[var(--zinc-200)] bg-[var(--zinc-50)]">
						<div>
							<div class="font-semibold text-sm text-[var(--zinc-900)] {task.isCompleted ? 'line-through text-[var(--zinc-400)]' : ''}">{task.title}</div>
							{#if task.description}
								<div class="text-xs text-[var(--zinc-500)]">{task.description}</div>
							{/if}
						</div>
						<form action="?/toggleTask" method="POST">
							<input type="hidden" name="taskId" value={task.id} />
							<input type="hidden" name="isCompleted" value={task.isCompleted ? 'false' : 'true'} />
							<button
								type="submit"
								class="rounded-md px-3 py-1 text-xs font-semibold transition {task.isCompleted ? 'bg-[var(--zinc-200)] text-[var(--zinc-700)]' : 'bg-[var(--color-success-fg)] text-white hover:opacity-90'}"
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
	<div class="admin-card p-6">
		<h2 class="text-lg font-bold text-[var(--zinc-900)] mb-4">Recent Inquiries & Contact Submissions</h2>
		<div class="overflow-hidden rounded-lg border border-[var(--zinc-200)]">
			<table class="admin-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Email</th>
						<th>Message</th>
						<th>Submitted At</th>
					</tr>
				</thead>
				<tbody>
					{#if data.inquiries.length === 0}
						<tr>
							<td colspan="4" class="py-8 text-center text-sm text-[var(--zinc-500)]">No contact inquiries received yet.</td>
						</tr>
					{:else}
						{#each data.inquiries as item}
							<tr>
								<td class="font-medium text-[var(--zinc-900)]">{item.fullName}</td>
								<td class="text-sm text-[var(--zinc-600)]">{item.email}</td>
								<td class="text-sm text-[var(--zinc-600)]">{item.message}</td>
								<td class="text-sm text-[var(--zinc-400)]">{new Date(item.createdAt).toLocaleDateString()}</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
