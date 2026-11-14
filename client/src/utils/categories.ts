// Category lists are comma-separated words. Every word in the filter must appear
// in the stored list. Extra stored words are allowed, and order does not matter.

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

export function addCategory(csv: string | null, word: string): string | null {
	const existing = csv ?? "";
	return formatCategories(`${existing},${word}`);
}

export function removeCategory(csv: string | null, word: string): string | null {
	const key = word.trim().toLowerCase();
	const words = parseCategories(csv).filter((item) => item.toLowerCase() !== key);
	if (words.length === 0) {
		return null;
	}
	return words.join(",");
}
