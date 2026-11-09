<script lang="ts" generics="T">
	import Icon from "$comp/icon.svelte";
	import * as ButtonGroup from "$comp/ui/button-group";
	import Button from "$comp/ui/button/button.svelte";
	import * as InputGroup from "$comp/ui/input-group";
	import * as Select from "$comp/ui/select";
	import type { ListQuery } from "$lib/hooks/list-query.svelte";

	let { list, placeholder }: { list: ListQuery<T>; placeholder: string } = $props();

	const currentOption = $derived(list.sortOptions.find((o) => o.value === list.sortBy));
	const sortIcon = $derived(
		list.orderBy === "asc"
			? (currentOption?.ascIcon ?? "arrow-down-a-z")
			: (currentOption?.descIcon ?? "arrow-up-a-z")
	);

	function toggleOrder() {
		list.orderBy = list.orderBy === "asc" ? "desc" : "asc";
	}
</script>

<ButtonGroup.Root>
	<InputGroup.Root>
		<InputGroup.Input
			{placeholder}
			bind:value={list.query}
			onkeydown={(e) => {
				if (e.key === "Escape") list.query = "";
			}}
		/>
		<InputGroup.Addon>
			<Icon name="search" class="size-4" />
		</InputGroup.Addon>
		<InputGroup.Addon align="inline-end">
			{#if list.query}
				<Button
					size="icon-xs"
					variant="ghost"
					class="dark:hover:bg-popover"
					onclick={() => (list.query = "")}
				>
					<Icon name="x" class="size-4" />
				</Button>
			{/if}
		</InputGroup.Addon>
	</InputGroup.Root>
	<Select.Root type="single" bind:value={list.sortBy}>
		<Select.Trigger>{currentOption?.label ?? "Sort by"}</Select.Trigger>
		<Select.Content>
			{#each list.sortOptions as option (option.value)}
				<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
	<Button onclick={toggleOrder} variant="ghost">
		<Icon name={sortIcon} />
	</Button>
</ButtonGroup.Root>
