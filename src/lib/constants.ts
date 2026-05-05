const SORT_OPTIONS = [
	{ value: "date", label: "Date", icon: "book-a" },
	{ value: "name", label: "Name", icon: "calendar-clock" }
] as const;
const POPOVER_SETTINGS = {
	openOnHover: true,
	openDelay: 0,
	closeDelay: 0
};

type SortOption = (typeof SORT_OPTIONS)[number];
type OrderBy = "asc" | "desc";
type SortBy = SortOption["value"];

export { SORT_OPTIONS, POPOVER_SETTINGS };
export type { SortOption, OrderBy, SortBy };
