export const Sanitizer = {
	email(val: string | null | undefined): string {
		if (!val) return '';
		return val.trim().toLowerCase().replace(/\s+/g, '');
	},

	phone(val: string | null | undefined): string {
		if (!val) return '';
		return val.trim().replace(/[^\d+()\s-]/g, '');
	},

	text(val: string | null | undefined): string {
		if (!val) return '';
		return val.trim().replace(/<[^>]*>?/gm, '');
	}
};
