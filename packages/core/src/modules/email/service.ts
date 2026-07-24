import { logger } from '../../logger.js';

export function createEmailService() {
	return {
		async sendWelcomeEmail(toEmail: string, fullName: string) {
			logger.info('EMAIL', `Simulating sending welcome email to ${fullName} (${toEmail})`);
			return { success: true, messageId: `msg_${Date.now()}` };
		},

		async sendVolunteerConfirmation(toEmail: string, fullName: string, team: string) {
			logger.info('EMAIL', `Simulating sending volunteer serve confirmation to ${fullName} (${toEmail}) for team: ${team}`);
			return { success: true, messageId: `msg_${Date.now()}` };
		}
	};
}
