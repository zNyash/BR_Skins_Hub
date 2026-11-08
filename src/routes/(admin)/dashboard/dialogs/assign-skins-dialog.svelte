<script lang="ts">
	import { SvelteSet } from "svelte/reactivity";
	import Icon from "$comp/icon.svelte";
	import SearchSorted from "$comp/search-sorted.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import * as Dialog from "$comp/ui/dialog";
	import * as Tooltip from "$comp/ui/tooltip";
	import type { Id } from "$convex/_generated/dataModel";
	import { SKIN_LIST, useListQuery } from "$lib/hooks/list-query.svelte";
	import type { SkinWithPlayers } from "$lib/types";
	import { cn, formatDate } from "$lib/utils";

	type Props = {
		allSkins: SkinWithPlayers[];
		/** Skins already in the editor's draft. They can't be selected again. */
		assignedIds: Id<"skins">[];
		playerName: string;
		onAssign: (skinIds: Id<"skins">[]) => void;
	};

	let { allSkins, assignedIds, playerName, onAssign }: Props = $props();

	let open = $state(false);
	let hideAssigned = $state(true);
	let onlyUnused = $state(false);
	const selected = new SvelteSet<Id<"skins">>();

	// Search and sort, then the chip filters on top.
	const skins = useListQuery(() => allSkins, SKIN_LIST);

	const assignedSet = $derived(new Set(assignedIds));
	const visibleSkins = $derived(
		skins.results.filter((skin) => {
			if (hideAssigned && assignedSet.has(skin._id)) return false;
			if (onlyUnused && skin.players.length > 0) return false;
			return true;
		})
	);

	function handleOpenChange(isOpen: boolean) {
		// Start each session fresh so a cancelled selection doesn't linger.
		if (isOpen) {
			selected.clear();
			skins.query = "";
		}
	}

	function toggle(skinId: Id<"skins">) {
		if (assignedSet.has(skinId)) return;
		if (selected.has(skinId)) selected.delete(skinId);
		else selected.add(skinId);
	}

	function confirm() {
		onAssign([...selected]);
		open = false;
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props} type="button" variant="secondary" size="sm">
				<Icon name="plus" />
				Assign skins
			</Button>
		{/snippet}
	</Dialog.Trigger>

	<Dialog.Content class="flex max-h-[85vh] flex-col gap-3 bg-layer-1 sm:max-w-3xl">
		<Dialog.Header>
			<Dialog.Title>Assign skins to {playerName || "player"}</Dialog.Title>
		</Dialog.Header>

		<SearchSorted list={skins} placeholder="Search skins by name..." />

		<div class="flex gap-2">
			{@render chip("Hide assigned", hideAssigned, () => (hideAssigned = !hideAssigned))}
			{@render chip("Unassigned to anyone", onlyUnused, () => (onlyUnused = !onlyUnused))}
		</div>

		<Tooltip.Provider delayDuration={150}>
			<div class="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 py-1">
				{#if visibleSkins.length === 0}
					<p class="py-10 text-center text-muted-foreground">No skins match.</p>
				{:else}
					<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
						{#each visibleSkins as skin (skin._id)}
							{@const isAssigned = assignedSet.has(skin._id)}
							{@const isSelected = selected.has(skin._id)}
							<div
								class={cn(
									"relative overflow-hidden rounded-md bg-layer-2 transition",
									isSelected && "ring-2 ring-primary",
									!isAssigned && !isSelected && "hover:ring hover:ring-primary/60"
								)}
							>
								<button
									type="button"
									class="flex w-full flex-col text-left disabled:cursor-not-allowed"
									disabled={isAssigned}
									aria-pressed={isSelected}
									onclick={() => toggle(skin._id)}
								>
									<img
										src={skin.preview_images[0]}
										alt=""
										class={cn("aspect-video w-full object-cover", isAssigned && "opacity-40")}
									/>
									<p class={cn("truncate p-1.5 text-xs", isAssigned && "opacity-50")}>
										{skin.name}
									</p>
								</button>

								<span
									class={cn(
										"pointer-events-none absolute top-1.5 left-1.5 grid size-4 place-items-center rounded border border-white/60 bg-black/50",
										isSelected && "border-primary bg-primary text-primary-foreground"
									)}
								>
									{#if isSelected}<Icon name="check" class="size-3" />{/if}
								</span>

								{#if isAssigned}
									<span
										class="pointer-events-none absolute bottom-8 left-1.5 rounded bg-black/70 px-1 text-[10px]"
									>
										Assigned
									</span>
								{/if}

								<Tooltip.Root>
									<Tooltip.Trigger
										type="button"
										class="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-black/50 hover:bg-white hover:text-black"
									>
										<Icon name="info" class="size-3.5" />
									</Tooltip.Trigger>
									<Tooltip.Content
										side="right"
										class="grid w-56 grid-cols-2 items-start gap-x-2 gap-y-1 bg-popover p-2 text-popover-foreground ring-1 ring-foreground/10"
										arrowClasses="bg-popover fill-popover"
									>
										<p class="col-span-2 text-center font-medium">{skin.name}</p>
										{@render infoRow("Author", skin.author ?? "Unknown")}
										{@render infoRow("Players", String(skin.players.length))}
										{#if skin.players.length > 0}
											<p class="col-span-2 text-center text-muted-foreground">
												{skin.players
													.slice(0, 3)
													.map((p) => p.name)
													.join(", ")}{skin.players.length > 3 ? ", …" : ""}
											</p>
										{/if}
										{@render infoRow("Uploaded", formatDate(skin._creationTime))}
										{@render infoRow("Updated", formatDate(skin.updated_at ?? skin._creationTime))}
									</Tooltip.Content>
								</Tooltip.Root>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</Tooltip.Provider>

		<Dialog.Footer class="flex-row items-center justify-between sm:justify-between">
			<span class="text-xs text-muted-foreground">
				{selected.size} selected
				{#if selected.size > 0}
					· <button type="button" class="underline" onclick={() => selected.clear()}>clear</button>
				{/if}
			</span>
			<div class="flex gap-2">
				<Dialog.Close>
					{#snippet child({ props })}
						<Button {...props} type="button" variant="secondary">Cancel</Button>
					{/snippet}
				</Dialog.Close>
				<Button type="button" disabled={selected.size === 0} onclick={confirm}>
					Assign {selected.size || ""}
					{selected.size === 1 ? "skin" : "skins"}
				</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

{#snippet chip(label: string, active: boolean, onclick: () => void)}
	<button
		type="button"
		aria-pressed={active}
		{onclick}
		class={cn(
			"rounded-full border px-3 py-0.5 text-xs transition",
			active
				? "border-primary/60 bg-primary/20 text-foreground"
				: "border-border text-muted-foreground hover:text-foreground"
		)}
	>
		{label}
	</button>
{/snippet}

{#snippet infoRow(label: string, value: string)}
	<span class="text-right text-muted-foreground">{label}</span>
	<span class="truncate text-left">{value}</span>
{/snippet}
