// A category list is comma-separated words. Every filter word must appear in the
// column. Extra words in the column are fine, and word order does not matter.

export function parseCategories(csv: string | null): string[] {
	if (csv === null || csv.trim() === "") {
		return [];
	}

	const seen = new Set<string>();
	const words: string[] = [];
	for (const raw of csv.split(",")) {
		const word = raw.trim();
		if (word === "") {
			continue;
		}
		const key = word.toLowerCase();
		if (seen.has(key)) {
			continue;
		}
		seen.add(key);
		words.push(word);
	}
	return words;
}

export function formatCategories(csv: string | null): string | null {
	const words = parseCategories(csv);
	if (words.length === 0) {
		return null;
	}
	return words.join(",");
}

export function categoriesContain(columnCsv: string | null, filterCsv: string | null): boolean {
	const filter = parseCategories(filterCsv).map((word) => word.toLowerCase());
	if (filter.length === 0) {
		return true;
	}
	const have = new Set(parseCategories(columnCsv).map((word) => word.toLowerCase()));
	return filter.every((word) => have.has(word));
}

export function categoryWhere(filterCsv: string | null): { sql: string; values: string[] } {
	const words = parseCategories(filterCsv);
	if (words.length === 0) {
		return { sql: "", values: [] };
	}

	const checks = words.map(
		() => "FIND_IN_SET(LOWER(?), LOWER(REPLACE(IFNULL(categories, ''), ', ', ','))) > 0",
	);
	return {
		sql: checks.join(" AND "),
		values: words.map((word) => word.toLowerCase()),
	};
}
