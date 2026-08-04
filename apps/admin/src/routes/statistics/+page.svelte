<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showModal = $state(false);
	let editingRecord = $state<any>(null);
	let searchQuery = $state('');

	let filteredRecords = $derived(
		data.records.filter(
			(r) =>
				r.districtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(r.notes || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
				r.date.includes(searchQuery)
		)
	);

	let totalAttendance = $derived(data.records.reduce((sum, r) => sum + (r.attendanceCount ?? 0), 0));
	let totalSalvations = $derived(data.records.reduce((sum, r) => sum + (r.salvationsCount ?? 0), 0));

	function openCreate() {
		editingRecord = {
			id: '',
			districtName: '',
			date: new Date().toISOString().slice(0, 10),
			attendanceCount: 0,
			salvationsCount: 0,
			notes: ''
		};
		showModal = true;
	}

	function openEdit(record: any) {
		editingRecord = { ...record };
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingRecord = null;
	}

	function downloadCsv() {
		const headers = ['ID', 'District', 'Date', 'Attendance', 'Salvations', 'Notes'];
		const rows = data.records.map((r) => [
			r.id,
			`"${(r.districtName || '').replace(/"/g, '""')}"`,
			r.date,
			r.attendanceCount ?? 0,
			r.salvationsCount ?? 0,
			`"${(r.notes || '').replace(/"/g, '""')}"`
		]);

		const csvStr = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `district_stats_export_${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-[var(--zinc-900)]">District Attendance & Growth Reporting</h1>
			<p class="text-sm text-[var(--zinc-500)]">Track weekly district attendance, salvations, and field notes from zone leaders.</p>
		</div>
		<div class="flex items-center gap-3">
			<button onclick={downloadCsv} class="admin-btn-secondary">Export CSV</button>
			<button onclick={openCreate} class="admin-btn-primary">+ Add Report Entry</button>
		</div>
	</div>

	<!-- Summary KPIs -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="admin-card p-4 text-center">
			<div class="text-xs font-semibold uppercase text-[var(--zinc-500)] mb-1">Total Records</div>
			<div class="text-2xl font-bold text-[var(--zinc-900)]">{data.records.length}</div>
		</div>
		<div class="admin-card p-4 text-center">
			<div class="text-xs font-semibold uppercase text-[var(--zinc-500)] mb-1">Total Attendance</div>
			<div class="text-2xl font-bold text-[var(--brand-primary)]">{totalAttendance.toLocaleString()}</div>
		</div>
		<div class="admin-card p-4 text-center">
			<div class="text-xs font-semibold uppercase text-[var(--zinc-500)] mb-1">Total Salvations</div>
			<div class="text-2xl font-bold text-emerald-600">{totalSalvations.toLocaleString()}</div>
		</div>
	</div>

	<div class="flex items-center gap-4">
		<input
			type="text"
			placeholder="Search by district, date, or notes..."
			bind:value={searchQuery}
			class="admin-input max-w-md"
		/>
	</div>

	<div class="overflow-hidden admin-card">
		<table class="admin-table">
			<thead>
				<tr>
					<th>District</th>
					<th>Report Date</th>
					<th>Attendance</th>
					<th>Salvations</th>
					<th>Notes</th>
					<th class="text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#if filteredRecords.length === 0}
					<tr>
						<td colspan="6" class="py-8 text-center text-sm text-[var(--zinc-500)]">
							No district statistics yet. Click "+ Add Report Entry" to submit.
						</td>
					</tr>
				{:else}
					{#each filteredRecords as record}
						<tr>
							<td class="font-medium text-[var(--zinc-900)]">{record.districtName}</td>
							<td class="text-sm font-mono text-[var(--zinc-600)]">{record.date}</td>
							<td class="text-sm font-bold text-[var(--brand-primary)]">{record.attendanceCount ?? 0}</td>
							<td class="text-sm font-bold text-emerald-600">{record.salvationsCount ?? 0}</td>
							<td class="text-sm text-[var(--zinc-500)] max-w-xs line-clamp-1">{record.notes || '—'}</td>
							<td class="text-right font-medium">
								<button onclick={() => openEdit(record)} class="mr-3 text-[var(--brand-primary)] hover:underline">Edit</button>
								<form action="?/deleteStatistic" method="POST" class="inline">
									<input type="hidden" name="id" value={record.id} />
									<button type="submit" class="text-[var(--color-danger-fg)] hover:underline">Delete</button>
								</form>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>

{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
		<div class="w-full max-w-md admin-card p-6 shadow-2xl bg-white">
			<h2 class="text-xl font-bold text-[var(--zinc-900)] mb-4">
				{editingRecord?.id ? 'Edit Report Entry' : 'Add District Report Entry'}
			</h2>
			<form action="?/saveStatistic" method="POST" class="space-y-4">
				{#if editingRecord?.id}
					<input type="hidden" name="id" value={editingRecord.id} />
				{/if}

				<div>
					<label for="stat-district" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">District / Zone Name</label>
					<input id="stat-district" type="text" name="districtName" bind:value={editingRecord.districtName} required placeholder="e.g. Harare Central" class="admin-input" />
				</div>

				<div>
					<label for="stat-date" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Report Date</label>
					<input id="stat-date" type="date" name="date" bind:value={editingRecord.date} required class="admin-input" />
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="stat-attendance" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Attendance Count</label>
						<input id="stat-attendance" type="number" name="attendanceCount" bind:value={editingRecord.attendanceCount} min="0" class="admin-input" />
					</div>
					<div>
						<label for="stat-salvations" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Salvations Count</label>
						<input id="stat-salvations" type="number" name="salvationsCount" bind:value={editingRecord.salvationsCount} min="0" class="admin-input" />
					</div>
				</div>

				<div>
					<label for="stat-notes" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Field Notes / Observations</label>
					<textarea id="stat-notes" name="notes" bind:value={editingRecord.notes} rows="3" placeholder="Any notes or highlights from this district..." class="admin-input"></textarea>
				</div>

				<div class="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--zinc-200)]">
					<button type="button" onclick={closeModal} class="admin-btn-secondary">Cancel</button>
					<button type="submit" class="admin-btn-primary">Save Report</button>
				</div>
			</form>
		</div>
	</div>
{/if}
