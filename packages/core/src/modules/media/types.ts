export type MediaAsset = {
	id: number;
	url: string;
	width: number;
	height: number;
	variants: Record<string, string>;
};
