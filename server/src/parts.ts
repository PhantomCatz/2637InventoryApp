import mysql from "mysql2/promise";

import { categoryWhere, formatCategories, parseCategories } from "./categories.ts";
import { execute, queryRows, withConnection } from "./database.ts";
import { BAD_REQUEST, InventoryError, SERVER_ERROR } from "./inventoryError.ts";
import { FIELD_LIMITS } from "./types/inventory.ts";

import type { Part, PartFilterOptions, PartInput, PartSearch, Tinyint } from "./types/inventory.ts";

const LIKE_CONTAINS = " LIKE ? ESCAPE '\\\\'";

type PartRow = mysql.RowDataPacket & {
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
	is_special: number;
};

type FilterRow = mysql.RowDataPacket & {
	subteam: string;
	manufacturer: string | null;
	categories: string | null;
};

function optionalText(value: unknown, field: string, limit: number): string | null {
	if (value === null || value === undefined) {
		return null;
	}
	if (typeof value !== "string") {
		throw new InventoryError(BAD_REQUEST, `${field} must be a string`);
	}
	const trimmed = value.trim();
	if (trimmed.length === 0) {
		return null;
	}
	if (trimmed.length > limit) {
		throw new InventoryError(BAD_REQUEST, `${field} must be ${limit} characters or fewer`);
	}
	return trimmed;
}

function requiredText(value: unknown, field: string, limit: number): string {
	const text = optionalText(value, field, limit);
	if (text === null) {
		throw new InventoryError(BAD_REQUEST, `${field} is required`);
	}
	return text;
}

function readInteger(value: unknown, field: string): number {
	let numeric = Number.NaN;
	if (typeof value === "number") {
		numeric = value;
	} else if (typeof value === "string" && /^-?\d+$/.test(value.trim())) {
		numeric = Number(value.trim());
	}
	if (!Number.isInteger(numeric)) {
		throw new InventoryError(BAD_REQUEST, `${field} must be a whole number`);
	}
	return numeric;
}

function readWholeNumber(value: unknown, field: string, minimum: number): number {
	const numeric = readInteger(value, field);
	if (numeric < minimum) {
		throw new InventoryError(BAD_REQUEST, `${field} must be at least ${minimum}`);
	}
	return numeric;
}

function readFlag(value: unknown, field: string): Tinyint {
	if (value === 0 || value === false || value === "0") {
		return 0;
	}
	if (value === 1 || value === true || value === "1") {
		return 1;
	}
	throw new InventoryError(BAD_REQUEST, `${field} must be 0 or 1`);
}


function readRecord(value: unknown): Record<string, unknown> {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		throw new InventoryError(BAD_REQUEST, "Expected an object");
	}
	return value as Record<string, unknown>;
}

function readCategories(value: unknown): string | null {
	const text = optionalText(value, "categories", FIELD_LIMITS.categories);
	const formatted = formatCategories(text);
	if (formatted !== null && formatted.length > FIELD_LIMITS.categories) {
		throw new InventoryError(BAD_REQUEST, `categories must be ${FIELD_LIMITS.categories} characters or fewer`);
	}
	return formatted;
}

export function readPartInput(value: unknown): PartInput {
	const body = readRecord(value);
	if (Object.hasOwn(body, "id")) {
		throw new InventoryError(BAD_REQUEST, "id is assigned by the database");
	}
	return {
		subteam: requiredText(body.subteam, "subteam", FIELD_LIMITS.subteam),
		name: requiredText(body.name, "name", FIELD_LIMITS.name),
		manufacturer_name: optionalText(body.manufacturer_name, "manufacturer_name", FIELD_LIMITS.manufacturer_name),
		part_number: optionalText(body.part_number, "part_number", FIELD_LIMITS.part_number),
		manufacturer: optionalText(body.manufacturer, "manufacturer", FIELD_LIMITS.manufacturer),
		categories: readCategories(body.categories),
		purchase_link: optionalText(body.purchase_link, "purchase_link", FIELD_LIMITS.purchase_link),
		description: requiredText(body.description, "description", FIELD_LIMITS.description),
		location: optionalText(body.location, "location", FIELD_LIMITS.location),
		quantity: readWholeNumber(body.quantity, "quantity", 0),
		is_special: readFlag(body.is_special, "is_special"),
	};
}

export function readNamedId(value: unknown, field: string): number {
	return readWholeNumber(value, field, 1);
}

function asString(value: unknown, field: string): string {
	if (typeof value === "string") {
		return value;
	}
	throw new InventoryError(SERVER_ERROR, `${field} is invalid`);
}

function asNullableString(value: unknown, field: string): string | null {
	if (value === null) {
		return null;
	}
	return asString(value, field);
}

function asCount(value: unknown, field: string): number {
	if (typeof value === "number" && Number.isInteger(value)) {
		return value;
	}
	throw new InventoryError(SERVER_ERROR, `${field} is invalid`);
}

function toPart(row: PartRow): Part {
	const isSpecial = asCount(row.is_special, "is_special");
	if (isSpecial !== 0 && isSpecial !== 1) {
		throw new InventoryError(SERVER_ERROR, "is_special is invalid");
	}
	return {
		id: asCount(row.id, "id"),
		subteam: asString(row.subteam, "subteam"),
		name: asString(row.name, "name"),
		manufacturer_name: asNullableString(row.manufacturer_name, "manufacturer_name"),
		part_number: asNullableString(row.part_number, "part_number"),
		manufacturer: asNullableString(row.manufacturer, "manufacturer"),
		categories: asNullableString(row.categories, "categories"),
		purchase_link: asNullableString(row.purchase_link, "purchase_link"),
		description: asString(row.description, "description"),
		location: asNullableString(row.location, "location"),
		quantity: asCount(row.quantity, "quantity"),
		is_special: isSpecial,
	};
}


function escapeLike(value: string): string {
	return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

function containsClause(column: "name" | "manufacturer_name" | "part_number"): string {
	return `${column}${LIKE_CONTAINS}`;
}

function sorted(values: Set<string>): string[] {
	return [...values].sort((left, right) => left.localeCompare(right));
}

export async function createPart(input: PartInput): Promise<number> {
	return withConnection(async (conn) => {
		const result = await execute(
			conn,
			`INSERT INTO parts (
				subteam, name, manufacturer_name, part_number, manufacturer,
				categories, purchase_link, description, location, quantity, is_special
			) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
			[
				input.subteam,
				input.name,
				input.manufacturer_name,
				input.part_number,
				input.manufacturer,
				input.categories,
				input.purchase_link,
				input.description,
				input.location,
				input.quantity,
				input.is_special,
			],
		);
		return result.insertId;
	});
}

export async function searchParts(search: PartSearch): Promise<Part[]> {
	const clauses: string[] = [];
	const values: unknown[] = [];

	if (search.query !== undefined) {
		const term = `%${escapeLike(search.query)}%`;
		clauses.push(
			`(${containsClause("name")} OR ${containsClause("manufacturer_name")} OR ${containsClause("part_number")} OR CAST(id AS CHAR)=?)`,
		);
		values.push(term, term, term, search.query);
	}
	if (search.name !== undefined) {
		clauses.push(containsClause("name"));
		values.push(`%${escapeLike(search.name)}%`);
	}
	if (search.manufacturer_name !== undefined) {
		clauses.push(containsClause("manufacturer_name"));
		values.push(`%${escapeLike(search.manufacturer_name)}%`);
	}
	if (search.part_number !== undefined) {
		clauses.push(containsClause("part_number"));
		values.push(`%${escapeLike(search.part_number)}%`);
	}
	if (search.subteam !== undefined) {
		clauses.push("LOWER(subteam)=LOWER(?)");
		values.push(search.subteam);
	}
	if (search.manufacturer !== undefined) {
		clauses.push("LOWER(manufacturer)=LOWER(?)");
		values.push(search.manufacturer);
	}
	if (search.part_id !== undefined) {
		clauses.push("id=?");
		values.push(search.part_id);
	}
	if (search.is_special !== undefined) {
		clauses.push("is_special=?");
		values.push(search.is_special);
	}
	const categories = categoryWhere(search.categories ?? null);
	if (categories.sql !== "") {
		clauses.push(categories.sql);
		values.push(...categories.values);
	}

	const where = clauses.length === 0 ? "" : `WHERE ${clauses.join(" AND ")}`;
	return withConnection(async (conn) => {
		const rows = await queryRows<PartRow>(conn, `SELECT * FROM parts ${where} ORDER BY manufacturer_name, name, id`, values);
		return rows.map((row) => toPart(row));
	});
}

export async function listFilterOptions(): Promise<PartFilterOptions> {
	return withConnection(async (conn) => {
		const rows = await queryRows<FilterRow>(conn, "SELECT subteam, manufacturer, categories FROM parts", []);
		const subteams = new Set<string>();
		const manufacturers = new Set<string>();
		const categories = new Set<string>();
		for (const row of rows) {
			subteams.add(row.subteam);
			if (row.manufacturer !== null && row.manufacturer !== "") {
				manufacturers.add(row.manufacturer);
			}
			for (const word of parseCategories(row.categories)) {
				categories.add(word);
			}
		}
		return {
			subteams: sorted(subteams),
			manufacturers: sorted(manufacturers),
			categories: sorted(categories),
		};
	});
}

