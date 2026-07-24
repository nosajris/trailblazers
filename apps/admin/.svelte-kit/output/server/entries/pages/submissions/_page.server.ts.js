import { s as services } from "../../../chunks/services.js";
const load = async () => {
  const [inquiries, tasks] = await Promise.all([
    services.inquiries.listForAdmin(),
    services.tasks.getAllTasks()
  ]);
  return {
    inquiries,
    tasks
  };
};
const actions = {
  toggleTask: async ({ request, locals }) => {
    const form = await request.formData();
    const taskId = Number(form.get("taskId"));
    const isCompleted = form.get("isCompleted") === "true";
    if (taskId) {
      await services.tasks.toggleTaskCompleted(taskId, isCompleted);
      await services.auditLogs.logAction(
        "TOGGLE_TASK",
        "TASK",
        String(taskId),
        `Task status updated to ${isCompleted ? "Completed" : "Pending"}`,
        locals.user?.id,
        locals.user?.fullName
      );
    }
    return { success: true };
  }
};
export {
  actions,
  load
};
