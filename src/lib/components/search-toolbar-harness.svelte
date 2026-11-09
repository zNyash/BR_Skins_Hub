<script lang="ts">
	// Test-only: a SearchToolbar over three named items with one sort option.
	import { useListQuery } from "$lib/hooks/list-query.svelte";
	import SearchToolbar from "./search-toolbar.svelte";

	let { total }: { total?: number } = $props();

	type Item = { name: string };
	const items: Item[] = [{ name: "Alpha" }, { name: "Bravo" }, { name: "Charlie" }];

	const list = useListQuery(() => items, {
		keys: ["name"],
		sortOptions: [
			{
				value: "name",
				label: "Name",
				ascIcon: "arrow-down-a-z",
				descIcon: "arrow-up-a-z",
				compare: (a: Item, b: Item) => a.name.localeCompare(b.name)
			}
		],
		defaultSort: "name",
		defaultOrder: "asc"
	});
</script>

<SearchToolbar {list} {total} placeholder="Search items" />
