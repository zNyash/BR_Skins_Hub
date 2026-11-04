import Fuse, { type IFuseOptions } from "fuse.js";
import type { Doc } from "$convex/_generated/dataModel";
import type { SkinWithPlayers } from "$lib/types";

// --- Types ---


export type OrderBy = "asc" | "desc";

export type SortOption<T> = {
	value: string;
	label: string;
	ascIcon: string;
	descIcon: string;
	compare: (a: T, b: T) => number;
};

export type ListConfig<T> = {
	/** Fields the search box looks at. */
	keys: IFuseOptions<T>["keys"];
	threshold?: number;
	sortOptions: readonly SortOption<T>[];
	defaultSort: string;
	defaultOrder: OrderBy;
};

export type ListQuery<T> = ReturnType<typeof useListQuery<T>>;

// --- Hook ---

/** Search (fuzzy) + sort state for a list, with the visible results derived from it. */
export function useListQuery<T>(list: () => T[], config: ListConfig<T>) {
	let query = $state("");
	let sortBy = $state(config.defaultSort);
	let orderBy = $state<OrderBy>(config.defaultOrder);

	const results = $derived.by(() => {
		const q = query.trim();
		const found = q
			? new Fuse(list(), { keys: config.keys, threshold: config.threshold ?? 0.4 })
					.search(q)
					.map((r) => r.item)
			: list();

		const option = config.sortOptions.find((o) => o.value === sortBy);
		const direction = orderBy === "asc" ? 1 : -1;
		return [...found].sort((a, b) => (option?.compare(a, b) ?? 0) * direction);
	});

	return {
		get query() {
			return query;
		},
		set query(value) {
			query = value;
		},
		get sortBy() {
			return sortBy;
		},
		set sortBy(value) {
			sortBy = value;
		},
		get orderBy() {
			return orderBy;
		},
		set orderBy(value) {
			orderBy = value;
		},
		get results() {
			return results;
		},
		sortOptions: config.sortOptions
	};
}

// --- Configs ---

const byName = {
	value: "name",
	label: "Name",
	ascIcon: "arrow-down-a-z",
	descIcon: "arrow-up-a-z",
	compare: (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)
};

const byDate = {
	value: "date",
	label: "Date",
	ascIcon: "calendar-arrow-down",
	descIcon: "calendar-arrow-up",
	compare: (a: { _creationTime: number }, b: { _creationTime: number }) =>
		a._creationTime - b._creationTime
};

type Timestamps = { _creationTime: number; updated_at?: number };
const byUpdated = {
	value: "updated",
	label: "Updated",
	ascIcon: "clock-arrow-down",
	descIcon: "clock-arrow-up",
	// Older documents have no updated_at yet, so fall back to when they were created.
	compare: (a: Timestamps, b: Timestamps) =>
		(a.updated_at ?? a._creationTime) - (b.updated_at ?? b._creationTime)
};

const byDownloads = {
	value: "downloads",
	label: "Downloads",
	ascIcon: "arrow-down-0-1",
	descIcon: "arrow-up-0-1",
	compare: (a: Doc<"skins">, b: Doc<"skins">) => a.download_count - b.download_count
};

export const PLAYER_LIST: ListConfig<Doc<"players">> = {
	keys: ["name", "osu_id", "previous_usernames", "tags"],
	sortOptions: [byName, byDate, byUpdated],
	defaultSort: "name",
	defaultOrder: "asc"
};

export const SKIN_LIST: ListConfig<Doc<"skins">> = {
	keys: ["name", "tags"],
	sortOptions: [byName, byDate, byUpdated, byDownloads],
	defaultSort: "date",
	defaultOrder: "desc"
};

/** The dashboard also finds skins by author and by the players using them. */
export const DASHBOARD_SKIN_LIST: ListConfig<SkinWithPlayers> = {
	...SKIN_LIST,
	keys: ["name", "author", "tags", "players.name", "players.previous_usernames"]
};
