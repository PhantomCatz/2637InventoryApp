import { categoriesContain } from "./categories.ts";

import type { Part, PartSearch } from "../types/inventory.ts";

export function partSearchParams(search: PartSearch): URLSearchParams {
	const params = new URLSearchParams();
	setText(params, "query", search.query);
	setText(params, "name", search.name);
	setText(params, "manufacturer_name", search.manufacturer_name);
	setText(params, "subteam", search.subteam);
	setText(params, "categories", search.categories);
	setText(params, "part_number", search.part_number);
	setText(params, "manufacturer", search.manufacturer);
	if (search.part_id !== undefined) {
		params.set("part_id", String(search.part_id));
	}
	if (search.is_special !== undefined) {
		params.set("is_special", String(search.is_special));
	}
	return params;
}

function setText(params: URLSearchParams, key: string, value: string | undefined): void {
	if (value === undefined) {
		return;
	}
	const trimmed = value.trim();
	if (trimmed === "") {
		return;
	}
	params.set(key, trimmed);
}

export function partMatches(part: Part, search: PartSearch): boolean {
	if (search.part_id !== undefined && part.id !== search.part_id) {
		return false;
	}
	if (search.is_special !== undefined && part.is_special !== search.is_special) {
		return false;
	}
	if (search.subteam !== undefined && part.subteam.toLowerCase() !== search.subteam.trim().toLowerCase()) {
		return false;
	}
	if (search.manufacturer !== undefined) {
		const manufacturer = search.manufacturer.trim().toLowerCase();
		if (part.manufacturer === null || part.manufacturer.toLowerCase() !== manufacturer) {
			return false;
		}
	}
	if (!fieldContains(part.name, search.name)) {
		return false;
	}
	if (!fieldContains(part.manufacturer_name, search.manufacturer_name)) {
		return false;
	}
	if (!fieldContains(part.part_number, search.part_number)) {
		return false;
	}
	if (!categoriesContain(part.categories, search.categories ?? null)) {
		return false;
	}
	return matchesQuery(part, search.query);
}

function fieldContains(value: string | null, needle: string | undefined): boolean {
	if (needle === undefined || needle.trim() === "") {
		return true;
	}
	if (value === null) {
		return false;
	}
	return value.toLowerCase().includes(needle.trim().toLowerCase());
}

function matchesQuery(part: Part, query: string | undefined): boolean {
	if (query === undefined || query.trim() === "") {
		return true;
	}
	const term = query.trim();
	const folded = term.toLowerCase();
	if (part.name.toLowerCase().includes(folded)) {
		return true;
	}
	if (part.manufacturer_name !== null && part.manufacturer_name.toLowerCase().includes(folded)) {
		return true;
	}
	if (part.part_number !== null && part.part_number.toLowerCase().includes(folded)) {
		return true;
	}
	return String(part.id) === term;
}
