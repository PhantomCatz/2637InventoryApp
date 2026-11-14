export const FIELD_LIMITS = {
	subteam: 32,
	name: 512,
	manufacturer_name: 512,
	manufacturer: 128,
	categories: 512,
	part_number: 64,
	purchase_link: 512,
	description: 512,
	location: 512,
} as const;

export type Tinyint = 0 | 1;

export type Part = {
	id: number;
	subteam: string;
	name: string;
	manufacturer_name: string | null;
	part_number: string | null;
	manufacturer: string | null;
	categories: string | null;
	purchase_link: string | null;
	description: string;
	location: string | null;
	quantity: number;
	is_special: Tinyint;
};

export type PartInput = {
	subteam: string;
	name: string;
	manufacturer_name: string | null;
	part_number: string | null;
	manufacturer: string | null;
	categories: string | null;
	purchase_link: string | null;
	description: string;
	location: string | null;
	quantity: number;
	is_special: Tinyint;
};

export type PartSearch = {
	query?: string;
	name?: string;
	manufacturer_name?: string;
	subteam?: string;
	categories?: string;
	part_number?: string;
	part_id?: number;
	manufacturer?: string;
	is_special?: Tinyint;
};

export type PartFilterOptions = {
	subteams: string[];
	manufacturers: string[];
	categories: string[];
};
