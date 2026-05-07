const POPOVER_SETTINGS = {
	openOnHover: true,
	openDelay: 0,
	closeDelay: 0
};

export type SortOption = {
	readonly value: string;
	readonly label: string;
	readonly ascIcon: string;
	readonly descIcon: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readonly compare: (a: any, b: any) => number;
};

const PLAYER_SORT_OPTIONS = [
	{
		value: "name",
		label: "Name",
		ascIcon: "arrow-down-a-z",
		descIcon: "arrow-up-a-z",
		compare: (a, b) => a.name.localeCompare(b.name)
	},
	{
		value: "date",
		label: "Date",
		ascIcon: "calendar-arrow-down",
		descIcon: "calendar-arrow-up",
		compare: (a, b) => a._creationTime - b._creationTime
	}
] as const satisfies SortOption[];

const SKIN_SORT_OPTIONS = [
	{
		value: "name",
		label: "Name",
		ascIcon: "arrow-down-a-z",
		descIcon: "arrow-up-a-z",
		compare: (a, b) => a.name.localeCompare(b.name)
	},
	{
		value: "date",
		label: "Date",
		ascIcon: "calendar-arrow-down",
		descIcon: "calendar-arrow-up",
		compare: (a, b) => a._creationTime - b._creationTime
	},
	{
		value: "downloads",
		label: "Downloads",
		ascIcon: "arrow-down-0-1",
		descIcon: "arrow-up-0-1",
		compare: (a, b) => a.download_count - b.download_count
	}
] as const satisfies SortOption[];

type PlayerSortBy = (typeof PLAYER_SORT_OPTIONS)[number]["value"];
type SkinSortBy = (typeof SKIN_SORT_OPTIONS)[number]["value"];
type OrderBy = "asc" | "desc";

export { PLAYER_SORT_OPTIONS, SKIN_SORT_OPTIONS, POPOVER_SETTINGS };
export type { PlayerSortBy, SkinSortBy, OrderBy };
