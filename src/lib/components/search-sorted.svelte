<script lang="ts" generics="T extends string">
	import Button from "$comp/ui/button/button.svelte";
	import Icon from "$comp/icon.svelte";
	import * as ButtonGroup from "$comp/ui/button-group/index.js";
	import * as InputGroup from "$comp/ui/input-group/index.js";
	import * as Select from "$comp/ui/select/index.js";
	import type { SortOption, OrderBy } from "$lib/constants";

	let {
		placeholder,
		inputValue = $bindable(""),
		sortBy = $bindable<T>(),
		orderBy = $bindable<OrderBy>("asc"),
		sortOptions
	}: {
		placeholder: string;
		inputValue?: string;
		sortBy: T;
		orderBy?: OrderBy;
		sortOptions: readonly (SortOption & { value: T })[];
	} = $props();

	const toggleOrderBy = () => (orderBy = orderBy === "asc" ? "desc" : "asc");

	const currentOption = $derived(sortOptions.find((o) => o.value === sortBy));
	const triggerContent = $derived(currentOption?.label ?? "Sort by");
	const sortIcon = $derived(
		orderBy === "asc"
			? (currentOption?.ascIcon ?? "arrow-down-a-z")
			: (currentOption?.descIcon ?? "arrow-up-a-z")
	);
</script>

<ButtonGroup.Root>
	<InputGroup.Root>
		<InputGroup.Input
			{placeholder}
			bind:value={inputValue}
			onkeydown={(e) => {
				if (e.key === "Escape") inputValue = "";
			}}
		/>
		<InputGroup.Addon>
			<Icon name="search" class="size-4" />
		</InputGroup.Addon>
		<InputGroup.Addon align="inline-end">
			{#if inputValue}
				<Button
					size="icon-xs"
					variant="ghost"
					class="dark:hover:bg-popover"
					onclick={() => (inputValue = "")}
				>
					<Icon name="x" class="size-4" />
				</Button>
			{/if}
		</InputGroup.Addon>
	</InputGroup.Root>
	<Select.Root type="single" bind:value={sortBy}>
		<Select.Trigger>{triggerContent}</Select.Trigger>
		<Select.Content>
			{#each sortOptions as option (option.value)}
				<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
	<Button onclick={toggleOrderBy} variant="outline">
		<Icon name={sortIcon} />
	</Button>
</ButtonGroup.Root>
