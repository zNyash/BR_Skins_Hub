import type { OrderBy, SortBy } from '$lib/constants';

type Sortable = { name: string; _creationTime: number };

export function useSorted<T extends Sortable>(
	list: () => T[],
	sortBy: () => SortBy,
	orderBy: () => OrderBy
) {
	const results = $derived.by(() => {
		return [...list()].sort((a, b) => {
			if (sortBy() === 'name') {
				return orderBy() === 'asc'
					? a.name.localeCompare(b.name)
					: b.name.localeCompare(a.name);
			}
			if (sortBy() === 'date') {
				return orderBy() === 'asc'
					? a._creationTime - b._creationTime
					: b._creationTime - a._creationTime;
			}
			return 0;
		});
	});

	return {
		get results() {
			return results;
		}
	};
}
