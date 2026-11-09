<script lang="ts">
	import type { Attachment } from "svelte/attachments";
	import Icon from "$comp/icon.svelte";
	import Popover from "$comp/popover.svelte";
	import { humanize } from "$lib/otd";
	import { visibleChips, type Setup } from "$lib/setup";
	import { cn } from "$lib/utils";

	type Filter = NonNullable<NonNullable<Setup["tablet"]>["filters"]>[number];

	let { filters }: { filters: Filter[] } = $props();

	const GAP = 8; // gap-2
	const CHIP =
		"flex h-7 shrink-0 items-center gap-1 rounded-md bg-layer-2 px-2 text-caption whitespace-nowrap";

	let count = $state(0);
	let selected = $state(0);
	const hidden = $derived(filters.slice(count));

	const settingText = (value: string) =>
		value === "true" ? "On" : value === "false" ? "Off" : value;

	// Chip widths come from an invisible copy of the row that always shows every chip (plus "+N"),
	// so chips that are currently collapsed can still be measured.
	const fit: Attachment<HTMLElement> = (row) => {
		void filters;
		const measure = () => {
			const copy = row.querySelector<HTMLElement>("[data-measure]");
			if (!copy) return;
			const chips = [...copy.children] as HTMLElement[];
			const more = chips.pop();
			count = visibleChips(
				chips.map((chip) => chip.offsetWidth),
				row.clientWidth,
				more?.offsetWidth ?? 0,
				GAP
			);
		};
		const observer = new ResizeObserver(measure);
		observer.observe(row);
		// The copy changes size when the web font swaps in, even if the row doesn't.
		const copy = row.querySelector<HTMLElement>("[data-measure]");
		if (copy) observer.observe(copy);
		measure();
		return () => observer.disconnect();
	};
</script>

{#snippet chipBody(filter: Filter)}
	{humanize(filter.path)}
	{#if filter.settings.length}
		<Icon name="chevron-down" class="size-3 shrink-0 text-text-muted" />
	{/if}
{/snippet}

{#snippet details(filter: Filter)}
	<p class="mb-3 text-card-title trim">{humanize(filter.path)}</p>
	{#if filter.settings.length}
		<dl class="grid grid-cols-2 gap-x-4 gap-y-2">
			{#each filter.settings as setting (setting.property)}
				<div class="flex min-w-0 flex-col gap-1">
					<dt class="truncate text-label text-text-muted" title={humanize(setting.property)}>
						{humanize(setting.property)}
					</dt>
					<dd class="text-body-strong break-words">{settingText(setting.value)}</dd>
				</div>
			{/each}
		</dl>
	{:else}
		<p class="text-body text-text-muted">No settings</p>
	{/if}
{/snippet}

{#if filters.length === 0}
	<div class="flex h-7 items-center">
		<span class="text-body trim text-text-muted">No filters</span>
	</div>
{:else}
	<div {@attach fit} class="relative flex h-7 min-w-0 items-center gap-2 overflow-hidden">
		<div data-measure aria-hidden="true" inert class="invisible absolute flex gap-2">
			{#each filters as filter, i (i)}
				<span class={CHIP}>{@render chipBody(filter)}</span>
			{/each}
			<span class={CHIP}>+{filters.length}</span>
		</div>

		{#each filters.slice(0, count) as filter, i (i)}
			{#if filter.settings.length}
				<Popover class="max-h-90 w-72 overflow-auto p-3">
					{#snippet trigger(props)}
						<button {...props} type="button" class={cn(CHIP, "hover:bg-layer-3")}>
							{@render chipBody(filter)}
						</button>
					{/snippet}
					{@render details(filter)}
				</Popover>
			{:else}
				<span class={CHIP}>{@render chipBody(filter)}</span>
			{/if}
		{/each}

		{#if hidden.length}
			<Popover
				class={cn(
					"max-h-90 max-w-[calc(100vw-1rem)]",
					hidden.length > 1
						? "w-120 grid-cols-[11rem_1fr] overflow-hidden open:grid max-[480px]:grid-cols-1"
						: "w-72 overflow-auto p-3"
				)}
				onopen={() => (selected = 0)}
			>
				{#snippet trigger(props)}
					<button
						{...props}
						type="button"
						class={cn(CHIP, "text-text-muted hover:bg-layer-3")}
						aria-label="{hidden.length} more filters"
					>
						+{hidden.length}
					</button>
				{/snippet}
				{#if hidden.length > 1}
					<div
						role="tablist"
						aria-orientation="vertical"
						class="flex flex-col gap-1 overflow-auto bg-layer-1 p-2 max-[480px]:flex-row"
					>
						{#each hidden as filter, i (i)}
							<button
								type="button"
								role="tab"
								aria-selected={selected === i}
								class={cn(
									"shrink-0 truncate rounded-md p-2 text-start text-body text-text-muted",
									selected === i && "bg-layer-3 text-text"
								)}
								onpointerenter={() => (selected = i)}
								onclick={() => (selected = i)}
							>
								{humanize(filter.path)}
							</button>
						{/each}
					</div>
					<div role="tabpanel" class="min-w-0 overflow-auto p-3">
						{@render details(hidden[selected] ?? hidden[0])}
					</div>
				{:else}
					{@render details(hidden[0])}
				{/if}
			</Popover>
		{/if}
	</div>
{/if}
