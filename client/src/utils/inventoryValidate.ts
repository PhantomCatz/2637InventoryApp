import { formatCategories } from "./categories.ts";
import { FIELD_LIMITS } from "../types/inventory.ts";

import type { PartInput } from "../types/inventory.ts";

function blankToNull(value: string | null): string | null {
	if (value === null) {
		return null;
	}
	const trimmed = value.trim();
	if (trimmed === "") {
		return null;
	}
	return trimmed;
}

export function normalizePartInput(input: PartInput): PartInput {
	return {
		subteam: input.subteam.trim(),
		name: input.name.trim(),
		manufacturer_name: blankToNull(input.manufacturer_name),
		part_number: blankToNull(input.part_number),
		manufacturer: blankToNull(input.manufacturer),
		categories: formatCategories(input.categories),
		purchase_link: blankToNull(input.purchase_link),
		description: input.description.trim(),
		location: blankToNull(input.location),
		quantity: input.quantity,
		is_special: input.is_special,
	};
}

function textError(field: string, value: string | null, limit: number, required: boolean): string | null {
	if (value === null || value.trim() === "") {
		if (required) {
			return `${field} is required`;
		}
		return null;
	}
	if (value.trim().length > limit) {
		return `${field} must be ${limit} characters or fewer`;
	}
	return null;
}

export function partInputError(input: PartInput): string | null {
	const part = normalizePartInput(input);
	const subteamError = textError("subteam", part.subteam, FIELD_LIMITS.subteam, true);
	if (subteamError !== null) {
		return subteamError;
	}
	const nameError = textError("name", part.name, FIELD_LIMITS.name, true);
	if (nameError !== null) {
		return nameError;
	}
	const manufacturerNameError = textError("manufacturer_name", part.manufacturer_name, FIELD_LIMITS.manufacturer_name, false);
	if (manufacturerNameError !== null) {
		return manufacturerNameError;
	}
	const partNumberError = textError("part_number", part.part_number, FIELD_LIMITS.part_number, false);
	if (partNumberError !== null) {
		return partNumberError;
	}
	const manufacturerError = textError("manufacturer", part.manufacturer, FIELD_LIMITS.manufacturer, false);
	if (manufacturerError !== null) {
		return manufacturerError;
	}
	const categoriesError = textError("categories", part.categories, FIELD_LIMITS.categories, false);
	if (categoriesError !== null) {
		return categoriesError;
	}
	const linkError = textError("purchase_link", part.purchase_link, FIELD_LIMITS.purchase_link, false);
	if (linkError !== null) {
		return linkError;
	}
	const descriptionError = textError("description", part.description, FIELD_LIMITS.description, true);
	if (descriptionError !== null) {
		return descriptionError;
	}
	const locationError = textError("location", part.location, FIELD_LIMITS.location, false);
	if (locationError !== null) {
		return locationError;
	}
	if (!Number.isInteger(part.quantity) || part.quantity < 0) {
		return "quantity must be a whole number, and 0 is allowed";
	}
	return null;
}
