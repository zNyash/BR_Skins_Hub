<script lang="ts">
	import Button from "$comp/ui/button/button.svelte";
	import Icon from "$comp/icon.svelte";
	import * as ButtonGroup from "$comp/ui/button-group/index.js";
	import * as InputGroup from "$comp/ui/input-group/index.js";
	import * as Select from "$comp/ui/select/index.js";
	import { SORT_OPTIONS } from "$lib/constants";
	import type { OrderBy, SortBy } from "$lib/constants";

	let {
		placeholder,
		sortBy = $bindable<SortBy>("name"),
		orderBy = $bindable<OrderBy>("asc")
	} = $props();

	const toggleOrderBy = () => (orderBy === "asc" ? (orderBy = "desc") : (orderBy = "asc"));
	let triggerContent = $derived(
		sortBy ? SORT_OPTIONS.find((o) => o.value === sortBy)?.label : "Sort by"
	);
	const sortIcon = $derived.by(() => {
		if (sortBy === "name") {
			return orderBy === "asc" ? "arrow-down-a-z" : "arrow-up-a-z";
		} else if (sortBy === "date") {
			return orderBy === "asc" ? "calendar-arrow-down" : "calendar-arrow-up";
		}
		return "arrow-down-a-z";
	});
</script>

<ButtonGroup.Root>
	<InputGroup.Root>
		<InputGroup.Input {placeholder} />
		<InputGroup.Addon>
			<Icon name="search" class="size-4" />
		</InputGroup.Addon>
	</InputGroup.Root>
	<Select.Root type="single" bind:value={sortBy}>
		<Select.Trigger>{triggerContent}</Select.Trigger>
		<Select.Content>
			{#each SORT_OPTIONS as option (option.value)}
				<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
	<Button onclick={toggleOrderBy} variant="outline">
		<Icon name={sortIcon} />
	</Button>
</ButtonGroup.Root>
