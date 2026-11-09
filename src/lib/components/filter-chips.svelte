<script lang="ts">
	import * as ToggleGroup from "$comp/ui/toggle-group";

	let {
		chips,
		value,
		total,
		onchange,
		label
	}: {
		chips: { id: string; label: string; count: number }[];
		value: string | null;
		total: number;
		onchange: (id: string | null) => void;
		label: string;
	} = $props();

	const items = $derived([{ id: "all", label: "All", count: total }, ...chips]);

	// Bound through a getter so the group always shows the parent's value, even when a click
	// doesn't change it. Deselecting the current item gives "", which (like "All") means no filter.
	function select(next: string) {
		onchange(next === "" || next === "all" ? null : next);
	}
</script>

<!-- A non-zero spacing turns off the joined-button styles (px-2, rounded ends, no shadow). -->
<ToggleGroup.Root
	type="single"
	aria-label={label}
	bind:value={() => value ?? "all", select}
	spacing={4}
	class="no-scrollbar flex w-auto gap-4 overflow-x-auto"
>
	{#each items as item (item.id)}
		<ToggleGroup.Item
			value={item.id}
			class="h-11 shrink-0 gap-1 rounded-none bg-transparent px-0 text-body text-text-muted hover:bg-transparent hover:text-text focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-accent-color data-[state=on]:bg-transparent data-[state=on]:text-body-strong data-[state=on]:text-text data-[state=on]:shadow-[inset_0_-2px_0_var(--accent-color)] min-[900px]:h-8"
		>
			{item.label}
			<span class="text-caption tabular-nums">{item.count}</span>
		</ToggleGroup.Item>
	{/each}
</ToggleGroup.Root>
