<script lang="ts" generics="T">
	import type { Snippet } from "svelte";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import * as InputGroup from "$comp/ui/input-group";
	import * as Select from "$comp/ui/select";
	import type { ListQuery } from "$lib/hooks/list-query.svelte";

	let {
		list,
		placeholder,
		total,
		children
	}: { list: ListQuery<T>; placeholder: string; total?: number; children?: Snippet } = $props();

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

<div class="flex flex-col gap-2">
	<div class="flex items-center gap-2">
		<InputGroup.Root class="flex-1">
			<InputGroup.Input
				{placeholder}
				aria-label={placeholder}
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
						aria-label="Clear search"
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
		<Button onclick={toggleOrder} variant="ghost" size="icon" aria-label="Reverse order">
			<Icon name={sortIcon} />
		</Button>
	</div>
	{#if total !== undefined}
		<p class="text-caption text-text-muted tabular-nums">{list.results.length} of {total} shown</p>
	{/if}
	{@render children?.()}
</div>
