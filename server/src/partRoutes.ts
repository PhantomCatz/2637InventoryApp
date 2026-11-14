import express from "express";

import { BAD_REQUEST, InventoryError, SERVER_ERROR } from "./inventoryError.ts";
import { createPart, listFilterOptions, readNamedId, readPartInput, searchParts } from "./parts.ts";

import type { PartSearch, Tinyint } from "./types/inventory.ts";

function queryString(query: express.Request["query"], key: string): string | undefined {
	if (!Object.hasOwn(query, key)) {
		return undefined;
	}
	const value = query[key];
	if (typeof value !== "string") {
		throw new InventoryError(BAD_REQUEST, `${key} must be a string`);
	}
	const trimmed = value.trim();
	if (trimmed === "") {
		return undefined;
	}
	return trimmed;
}

function readSearch(query: express.Request["query"]): PartSearch {
	const search: PartSearch = {};
	const freeText = queryString(query, "query");
	const name = queryString(query, "name");
	const manufacturerName = queryString(query, "manufacturer_name");
	const subteam = queryString(query, "subteam");
	const categories = queryString(query, "categories");
	const partNumber = queryString(query, "part_number");
	const manufacturer = queryString(query, "manufacturer");
	const partId = queryString(query, "part_id");
	const isSpecial = queryString(query, "is_special");

	if (freeText !== undefined) {
		search.query = freeText;
	}
	if (name !== undefined) {
		search.name = name;
	}
	if (manufacturerName !== undefined) {
		search.manufacturer_name = manufacturerName;
	}
	if (subteam !== undefined) {
		search.subteam = subteam;
	}
	if (categories !== undefined) {
		search.categories = categories;
	}
	if (partNumber !== undefined) {
		search.part_number = partNumber;
	}
	if (manufacturer !== undefined) {
		search.manufacturer = manufacturer;
	}
	if (partId !== undefined) {
		search.part_id = readNamedId(partId, "part_id");
	}
	if (isSpecial !== undefined) {
		search.is_special = readSearchFlag(isSpecial);
	}
	return search;
}

function readSearchFlag(value: string): Tinyint {
	if (value === "0") {
		return 0;
	}
	if (value === "1") {
		return 1;
	}
	throw new InventoryError(BAD_REQUEST, "is_special must be 0 or 1");
}

function handle(handler: (request: express.Request) => Promise<unknown>): express.RequestHandler {
	return async (request, response) => {
		try {
			const result = await handler(request);
			response.json(result);
		} catch (err: unknown) {
			if (err instanceof InventoryError) {
				response.status(err.status);
				response.json({ error: err.message });
				return;
			}
			console.error(err);
			response.status(SERVER_ERROR);
			response.json({ error: "Failed to resolve request." });
		}
	};
}

export function registerPartRoutes(app: express.Express): void {
	app.get(
		"/api/parts/search",
		handle((request) => searchParts(readSearch(request.query))),
	);
	app.get(
		"/api/parts/filters",
		handle(() => listFilterOptions()),
	);
	app.post(
		"/api/part/",
		handle(async (request) => {
			const id = await createPart(readPartInput(request.body));
			return { id };
		}),
	);
}
