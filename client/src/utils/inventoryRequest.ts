import Constants from "./constants.ts";
import { normalizePartInput, partInputError } from "./inventoryValidate.ts";
import { partSearchParams } from "./partSearch.ts";

import type { Part, PartFilterOptions, PartInput, PartSearch, Tinyint } from "../types/inventory.ts";

const SERVER_MISSING = "Server address is not set. Check the client .env.";
const REQUEST_FAILED = "Could not complete the part request.";
const UNEXPECTED = "The server returned an unexpected response.";

function apiUrl(path: string): string {
	const base = Constants.SERVER_ADDRESS;
	if (base === undefined || base.trim() === "") {
		throw new Error(SERVER_MISSING);
	}
	const origin = base.endsWith("/") ? base.slice(0, -1) : base;
	return `${origin}${path}`;
}

async function errorMessage(response: Response): Promise<string> {
	try {
		const body: unknown = await response.json();
		if (typeof body === "object" && body !== null && "error" in body && typeof body.error === "string" && body.error !== "") {
			return body.error;
		}
	} catch {
		return REQUEST_FAILED;
	}
	return REQUEST_FAILED;
}

async function requestJson(path: string, init?: RequestInit): Promise<unknown> {
	const response = await fetch(apiUrl(path), init);
	if (!response.ok) {
		throw new Error(await errorMessage(response));
	}
	return (await response.json()) as unknown;
}

function postJson(path: string, body: unknown): Promise<unknown> {
	return requestJson(path, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
}

function readRecord(value: unknown): Record<string, unknown> {
	if (typeof value !== "object" || value === null) {
		throw new Error(UNEXPECTED);
	}
	return value as Record<string, unknown>;
}

function asString(value: unknown, field: string): string {
	if (typeof value !== "string") {
		throw new Error(`The server returned an invalid ${field}.`);
	}
	return value;
}

function asNullableString(value: unknown, field: string): string | null {
	if (value === null) {
		return null;
	}
	return asString(value, field);
}

function asCount(value: unknown, field: string, minimum: number): number {
	if (typeof value !== "number" || !Number.isInteger(value) || value < minimum) {
		throw new Error(`The server returned an invalid ${field}.`);
	}
	return value;
}

function asFlag(value: unknown): Tinyint {
	if (value === 0 || value === 1) {
		return value;
	}
	throw new Error("The server returned an invalid is_special.");
}

function asPart(value: unknown): Part {
	const row = readRecord(value);
	return {
		id: asCount(row.id, "id", 1),
		subteam: asString(row.subteam, "subteam"),
		name: asString(row.name, "name"),
		manufacturer_name: asNullableString(row.manufacturer_name, "manufacturer_name"),
		part_number: asNullableString(row.part_number, "part_number"),
		manufacturer: asNullableString(row.manufacturer, "manufacturer"),
		categories: asNullableString(row.categories, "categories"),
		purchase_link: asNullableString(row.purchase_link, "purchase_link"),
		description: asString(row.description, "description"),
		location: asNullableString(row.location, "location"),
		quantity: asCount(row.quantity, "quantity", 0),
		is_special: asFlag(row.is_special),
	};
}

function asParts(value: unknown): Part[] {
	if (!Array.isArray(value)) {
		throw new Error(UNEXPECTED);
	}
	return value.map((item) => asPart(item));
}

function asStringList(value: unknown, field: string): string[] {
	if (!Array.isArray(value)) {
		throw new Error(`The server returned an invalid ${field}.`);
	}
	const words: string[] = [];
	for (const item of value) {
		words.push(asString(item, field));
	}
	return words;
}

function asFilterOptions(value: unknown): PartFilterOptions {
	const row = readRecord(value);
	return {
		subteams: asStringList(row.subteams, "subteams"),
		manufacturers: asStringList(row.manufacturers, "manufacturers"),
		categories: asStringList(row.categories, "categories"),
	};
}

export async function getPart(id: number): Promise<Part | null> {
	const rows = asParts(await requestJson(`/api/partDetails/${id}`));
	return rows[0] ?? null;
}

export async function listParts(): Promise<Part[]> {
	return asParts(await requestJson("/api/parts/all"));
}

export async function listPartsBySubteam(subteam: string): Promise<Part[]> {
	return asParts(await requestJson(`/api/parts/${encodeURIComponent(subteam)}`));
}

export async function searchParts(search: PartSearch): Promise<Part[]> {
	const query = partSearchParams(search).toString();
	const suffix = query === "" ? "" : `?${query}`;
	return asParts(await requestJson(`/api/parts/search${suffix}`));
}

export async function getPartFilterOptions(): Promise<PartFilterOptions> {
	return asFilterOptions(await requestJson("/api/parts/filters"));
}

export async function createPart(input: PartInput): Promise<number> {
	const part = normalizePartInput(input);
	const error = partInputError(part);
	if (error !== null) {
		throw new Error(error);
	}
	const result = readRecord(await postJson("/api/part/", part));
	return asCount(result.id, "id", 1);
}
