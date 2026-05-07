import type { OrderBy, SortOption } from "$lib/constants";

export function useSorted<T>(
	list: () => T[],
	sortBy: () => string,
	orderBy: () => OrderBy,
	sortOptions: readonly SortOption[]
) {
	const results = $derived.by(() => {
		const option = sortOptions.find((o) => o.value === sortBy());
		const dir = orderBy() === "asc" ? 1 : -1;
		return [...list()].sort((a, b) => (option?.compare(a, b) ?? 0) * dir);
	});

	return {
		get results() {
			return results;
		}
	};
}
