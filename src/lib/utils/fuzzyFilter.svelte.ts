import Fuse, { type IFuseOptions } from "fuse.js";

export function useFuzzyFilter<T>(list: () => T[], query: () => string, options: IFuseOptions<T>) {
	const results = $derived.by(() => {
		const q = query().trim();
		if (!q) return list();
		return new Fuse(list(), options).search(q).map((r) => r.item);
	});

	return {
		get results() {
			return results;
		}
	};
}
