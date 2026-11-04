/** Lowercases, trims and collapses whitespace; drops empty tags and duplicates (first one wins). */
export function normalizeTags(tags: string[]): string[] {
	const cleaned = tags.map((tag) => tag.trim().toLowerCase().replace(/\s+/g, " "));
	return [...new Set(cleaned.filter(Boolean))];
}
