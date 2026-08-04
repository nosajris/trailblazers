import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async () => {
	const [inquiries, tasks] = await Promise.all([
		services.inquiries.listForAdmin(),
		services.tasks.getAllTasks()
	]);

	return {
		inquiries,
		tasks
	};
};

export const actions: Actions = {
	updateInquiryStatus: async ({ request, locals }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		const status = form.get('status')?.toString().trim();

		if (id && status) {
			await services.inquiries.updateStatus(id, status);
			await services.auditLogs.logAction(
				'UPDATE_INQUIRY_STATUS',
				'INQUIRY',
				String(id),
				`Updated lead ID ${id} status to ${status}`,
				locals.user?.id,
				locals.user?.fullName
			);
		}
		return { success: true };
	},

	deleteInquiry: async ({ request, locals }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (id) {
			await services.inquiries.deleteInquiry(id);
			await services.auditLogs.logAction(
				'DELETE_INQUIRY',
				'INQUIRY',
				String(id),
				`Deleted lead submission ID: ${id}`,
				locals.user?.id,
				locals.user?.fullName
			);
		}
		return { success: true };
	},

	toggleTask: async ({ request, locals }) => {
		const form = await request.formData();
		const taskId = Number(form.get('taskId'));
		const isCompleted = form.get('isCompleted') === 'true';

		if (taskId) {
			await services.tasks.toggleTaskCompleted(taskId, isCompleted);
			await services.auditLogs.logAction(
				'TOGGLE_TASK',
				'TASK',
				String(taskId),
				`Task status updated to ${isCompleted ? 'Completed' : 'Pending'}`,
				locals.user?.id,
				locals.user?.fullName
			);
		}

		return { success: true };
	},

	createTask: async ({ request, locals }) => {
		const form = await request.formData();
		const title = form.get('title')?.toString().trim();
		const description = form.get('description')?.toString().trim();

		if (!title) {
			return fail(400, { error: 'Task title is required' });
		}

		const created = await services.tasks.createTask(title, description);
		await services.auditLogs.logAction(
			'CREATE_TASK',
			'TASK',
			String(created.id),
			`Created staff task: ${title}`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
	},

	deleteTask: async ({ request, locals }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (id) {
			await services.tasks.deleteTask(id);
			await services.auditLogs.logAction(
				'DELETE_TASK',
				'TASK',
				String(id),
				`Deleted task ID: ${id}`,
				locals.user?.id,
				locals.user?.fullName
			);
		}
		return { success: true };
	}
};

