export type BepProfileVm = {
	id: number;
	businessName: string;
	industry: string;
	description: string;
	websiteUrl: string | null;
	isVerified: boolean;
};

export type EquipmentVm = {
	id: number;
	name: string;
	description: string | null;
	dailyRate: number;
	imageUrl: string | null;
	status: string;
};
