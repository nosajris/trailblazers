<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showTaskModal = $state(false);
	let newTask = $state({ title: '', description: '' });

	function openTaskModal() {
		newTask = { title: '', description: '' };
		showTaskModal = true;
	}

	function closeTaskModal() {
		showTaskModal = false;
	}

	function downloadCsv() {
		const headers = ['ID', 'Name', 'Email', 'Type', 'Status', 'Message', 'Submitted At'];
		const rows = data.inquiries.map((item) => [
			item.id,
			`"${(item.fullName || '').replace(/"/g, '""')}"`,
			`"${(item.email || '').replace(/"/g, '""')}"`,
			item.type,
			item.status,
			`"${(item.message || '').replace(/"/g, '""')}"`,
			`"${new Date(item.createdAt).toISOString()}"`
		]);

		const csvStr = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `leads_export_${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-[var(--zinc-900)]">Visitor & Serve Leads Management</h1>
			<p class="text-sm text-[var(--zinc-500)]">Track newcomer VIP visit requests, volunteer applications, and staff follow-up tasks.</p>
		</div>
		<div class="flex items-center gap-3">
			<button onclick={downloadCsv} class="admin-btn-secondary">Export CSV</button>
			<button onclick={openTaskModal} class="admin-btn-primary">+ Add Follow-up Task</button>
		</div>
	</div>

	<!-- Tasks List -->
	<div class="admin-card p-6">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-bold text-[var(--zinc-900)]">Assigned Follow-up Tasks</h2>
			<span class="text-xs font-semibold text-[var(--zinc-500)]">{data.tasks.filter((t) => !t.isCompleted).length} Pending</span>
		</div>
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
						<div class="flex items-center gap-3">
							<form action="?/toggleTask" method="POST" class="inline">
								<input type="hidden" name="taskId" value={task.id} />
								<input type="hidden" name="isCompleted" value={task.isCompleted ? 'false' : 'true'} />
								<button
									type="submit"
									class="rounded-md px-3 py-1 text-xs font-semibold transition {task.isCompleted ? 'bg-[var(--zinc-200)] text-[var(--zinc-700)]' : 'bg-emerald-600 text-white hover:bg-emerald-700'}"
								>
									{task.isCompleted ? 'Completed ✓' : 'Mark Done'}
								</button>
							</form>
							<form action="?/deleteTask" method="POST" class="inline">
								<input type="hidden" name="id" value={task.id} />
								<button type="submit" class="text-[var(--color-danger-fg)] text-xs hover:underline">Delete</button>
							</form>
						</div>
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
						<th>Name & Contact</th>
						<th>Type</th>
						<th>Message</th>
						<th>Status</th>
						<th>Submitted At</th>
						<th class="text-right">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#if data.inquiries.length === 0}
						<tr>
							<td colspan="6" class="py-8 text-center text-sm text-[var(--zinc-500)]">No contact inquiries received yet.</td>
						</tr>
					{:else}
						{#each data.inquiries as item}
							<tr>
								<td>
									<div class="font-medium text-[var(--zinc-900)]">{item.fullName}</div>
									<div class="text-xs text-[var(--zinc-500)]">{item.email}</div>
								</td>
								<td>
									<span class="admin-badge admin-badge-neutral">{item.type}</span>
								</td>
								<td class="text-sm text-[var(--zinc-600)] max-w-xs">{item.message}</td>
								<td>
									<form action="?/updateInquiryStatus" method="POST" class="inline">
										<input type="hidden" name="id" value={item.id} />
										<select
											name="status"
											value={item.status}
											onchange={(e) => e.currentTarget.form?.requestSubmit()}
											class="text-xs font-semibold rounded px-2 py-1 border border-[var(--zinc-300)] bg-white"
										>
											<option value="PENDING">PENDING</option>
											<option value="CONTACTED">CONTACTED</option>
											<option value="RESOLVED">RESOLVED</option>
										</select>
									</form>
								</td>
								<td class="text-sm text-[var(--zinc-400)]">{new Date(item.createdAt).toLocaleDateString()}</td>
								<td class="text-right font-medium">
									<form action="?/deleteInquiry" method="POST" class="inline">
										<input type="hidden" name="id" value={item.id} />
										<button type="submit" class="text-[var(--color-danger-fg)] text-xs hover:underline">Delete</button>
									</form>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

{#if showTaskModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
		<div class="w-full max-w-md admin-card p-6 shadow-2xl bg-white">
			<h2 class="text-xl font-bold text-[var(--zinc-900)] mb-4">Add Follow-up Task</h2>
			<form action="?/createTask" method="POST" class="space-y-4">
				<div>
					<label for="task-title" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Task Title</label>
					<input id="task-title" type="text" name="title" bind:value={newTask.title} required placeholder="e.g. Call back VIP visitor" class="admin-input" />
				</div>

				<div>
					<label for="task-desc" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Description / Details</label>
					<textarea id="task-desc" name="description" bind:value={newTask.description} rows="3" class="admin-input"></textarea>
				</div>

				<div class="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--zinc-200)]">
					<button type="button" onclick={closeTaskModal} class="admin-btn-secondary">Cancel</button>
					<button type="submit" class="admin-btn-primary">Add Task</button>
				</div>
			</form>
		</div>
	</div>
{/if}

