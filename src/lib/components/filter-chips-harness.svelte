<script lang="ts" module>
	export const calls: (string | null)[] = $state([]);
</script>

<script lang="ts">
	// Test-only: FilterChips over two fixed chips, recording every onchange call.
	import FilterChips from "./filter-chips.svelte";

	let { value }: { value: string | null } = $props();

	const chips = [
		{ id: "no-skins", label: "No skins", count: 1 },
		{ id: "no-setup", label: "No setup", count: 54 }
	];
</script>

<FilterChips {chips} {value} total={60} label="Filter players" onchange={(id) => calls.push(id)} />
