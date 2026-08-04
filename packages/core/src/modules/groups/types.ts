export type GroupCardVm = {
	id: number;
	name: string;
	leader: string;
	dayTime: string;
	type: string;
	imageUrl: string | null;
	description: string | null;
};

export type GroupAdminVm = GroupCardVm & {
	status: string;
	sortOrder: number | null;
};

