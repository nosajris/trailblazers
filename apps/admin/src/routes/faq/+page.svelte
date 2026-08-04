<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showModal = $state(false);
	let editingFaq = $state<any>(null);
	let searchQuery = $state('');

	let filteredFaqs = $derived(
		data.faqs.filter(
			(f) =>
				f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
				f.answer.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function openCreate() {
		editingFaq = {
			id: '',
			question: '',
			answer: '',
			status: 'PUBLISHED',
			order: 0
		};
		showModal = true;
	}

	function openEdit(faq: any) {
		editingFaq = { ...faq };
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingFaq = null;
	}

	function downloadCsv() {
		const headers = ['ID', 'Question', 'Answer', 'Status', 'Order'];
		const rows = data.faqs.map((f) => [
			f.id,
			`"${(f.question || '').replace(/"/g, '""')}"`,
			`"${(f.answer || '').replace(/"/g, '""')}"`,
			f.status,
			f.order
		]);

		const csvStr = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `faq_export_${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-[var(--zinc-900)]">Frequently Asked Questions Manager</h1>
			<p class="text-sm text-[var(--zinc-500)]">Manage questions and answers shown on the /faq public portal.</p>
		</div>
		<div class="flex items-center gap-3">
			<button onclick={downloadCsv} class="admin-btn-secondary">Export CSV</button>
			<button onclick={openCreate} class="admin-btn-primary">+ Add FAQ</button>
		</div>
	</div>

	<div class="flex items-center gap-4">
		<input
			type="text"
			placeholder="Search FAQs by question or answer..."
			bind:value={searchQuery}
			class="admin-input max-w-md"
		/>
	</div>

	<div class="overflow-hidden admin-card">
		<table class="admin-table">
			<thead>
				<tr>
					<th>Question</th>
					<th>Answer</th>
					<th>Status</th>
					<th>Order</th>
					<th class="text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#if filteredFaqs.length === 0}
					<tr>
						<td colspan="5" class="py-8 text-center text-sm text-[var(--zinc-500)]">
							No FAQs found. Click "+ Add FAQ" to create one.
						</td>
					</tr>
				{:else}
					{#each filteredFaqs as faq}
						<tr>
							<td class="font-medium text-[var(--zinc-900)] max-w-xs">{faq.question}</td>
							<td class="text-sm text-[var(--zinc-600)] max-w-md line-clamp-2">{faq.answer}</td>
							<td>
								{#if faq.status === 'PUBLISHED'}
									<span class="admin-badge admin-badge-success">Published</span>
								{:else}
									<span class="admin-badge admin-badge-neutral">Draft</span>
								{/if}
							</td>
							<td class="text-sm text-[var(--zinc-500)]">{faq.order}</td>
							<td class="text-right font-medium">
								<button onclick={() => openEdit(faq)} class="mr-3 text-[var(--brand-primary)] hover:underline">Edit</button>
								<form action="?/deleteFaq" method="POST" class="inline">
									<input type="hidden" name="id" value={faq.id} />
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
		<div class="w-full max-w-lg admin-card p-6 shadow-2xl bg-white">
			<h2 class="text-xl font-bold text-[var(--zinc-900)] mb-4">
				{editingFaq?.id ? 'Edit FAQ' : 'Add FAQ'}
			</h2>
			<form action="?/saveFaq" method="POST" class="space-y-4">
				{#if editingFaq?.id}
					<input type="hidden" name="id" value={editingFaq.id} />
				{/if}

				<div>
					<label for="faq-q" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Question</label>
					<input id="faq-q" type="text" name="question" bind:value={editingFaq.question} required class="admin-input" />
				</div>

				<div>
					<label for="faq-a" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Answer</label>
					<textarea id="faq-a" name="answer" bind:value={editingFaq.answer} rows="4" required class="admin-input"></textarea>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="faq-status" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Status</label>
						<select id="faq-status" name="status" bind:value={editingFaq.status} class="admin-input">
							<option value="PUBLISHED">PUBLISHED</option>
							<option value="DRAFT">DRAFT</option>
						</select>
					</div>
					<div>
						<label for="faq-order" class="block text-xs font-semibold text-[var(--zinc-700)] uppercase mb-1">Sort Order</label>
						<input id="faq-order" type="number" name="order" bind:value={editingFaq.order} class="admin-input" />
					</div>
				</div>

				<div class="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--zinc-200)]">
					<button type="button" onclick={closeModal} class="admin-btn-secondary">Cancel</button>
					<button type="submit" class="admin-btn-primary">Save FAQ</button>
				</div>
			</form>
		</div>
	</div>
{/if}
