export type EventCardVm = {
	id: number;
	title: string;
	description: string;
	date: Date;
	location: string;
	imageUrl: string | null;
	type: string;
	price: number;
	isFeatured: boolean;
	capacity: number | null;
	registeredCount: number | null;
	earlyBirdDeadline: Date | null;
};

export type EventListingFilters = {
	search: string;
	type: string;
	sort: string;
	page: number;
	limit: number;
};

export type EventListingResult = {
	events: EventCardVm[];
	featuredEvent: EventCardVm | null;
	pagination: { currentPage: number; totalPages: number; totalEvents: number };
	filters: { search: string; type: string; sort: string };
};
