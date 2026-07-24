export type BlogCardVm = {
	id: number;
	title: string;
	category: string | null;
	summary: string;
	imageUrl: string | null;
	createdAt: Date;
};

export type BlogPostVm = BlogCardVm & {
	content: string;
};
