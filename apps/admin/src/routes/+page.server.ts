import type { PageServerLoad } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async () => {
	const [sermons, events, groups, leaders, testimonials, faqs, inquiries, auditLogs, tasks, equipment, bep] = await Promise.all([
		services.sermons.getAllSermons(),
		services.events.getAllEventsForAdmin(),
		services.groups.getAllForAdmin(),
		services.leaders.getAllForAdmin(),
		services.testimonials.getAllForAdmin(),
		services.faq.getAllForAdmin(),
		services.inquiries.listForAdmin(),
		services.auditLogs.getRecentLogs(10),
		services.tasks.getAllTasks(),
		services.equipment.getAllForAdmin(),
		services.bep.getAllForAdmin()
	]);

	return {
		stats: {
			totalSermons: sermons.length,
			totalEvents: events.length,
			totalGroups: groups.length,
			totalLeaders: leaders.length,
			totalTestimonials: testimonials.length,
			totalFaqs: faqs.length,
			totalInquiries: inquiries.length,
			pendingInquiries: inquiries.filter((i) => i.status === 'PENDING').length,
			pendingTasks: tasks.filter((t: { isCompleted: boolean }) => !t.isCompleted).length,
			totalEquipment: equipment.length,
			totalBep: bep.length
		},
		recentAuditLogs: auditLogs,
		tasks
	};
};

