const SORT_OPTIONS = [
	{ value: "date", label: "Date", icon: "book-a" },
	{ value: "name", label: "Name", icon: "calendar-clock" }
] as const;

type SortOption = (typeof SORT_OPTIONS)[number];
type OrderBy = "asc" | "desc";
type SortBy = SortOption["value"];

export { SORT_OPTIONS };
export type { SortOption, OrderBy, SortBy };
