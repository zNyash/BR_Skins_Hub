<script lang="ts">
	import { SvelteSet } from "svelte/reactivity";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import SearchSorted from "$comp/search-sorted.svelte";
	import * as Dialog from "$comp/ui/dialog";
	import * as Tooltip from "$comp/ui/tooltip";
	import type { Doc, Id } from "$convex/_generated/dataModel";
	import { PLAYER_SORT_OPTIONS, type OrderBy, type PlayerSortBy } from "$lib/constants";
	import { useFuzzyFilter } from "$lib/utils/fuzzyFilter.svelte";
	import { useSorted } from "$lib/utils/sorted.svelte";
	import { osuAvatar } from "$lib/osu";
	import { cn } from "$lib/utils";

	type Props = {
		allPlayers: Doc<"players">[];
		/** Players already in the editor's draft. They can't be selected again. */
		assignedIds: Id<"players">[];
		skinName: string;
		onAssign: (playerIds: Id<"players">[]) => void;
	};

	let { allPlayers, assignedIds, skinName, onAssign }: Props = $props();

	let open = $state(false);
	let inputValue = $state("");
	let sortBy = $state<PlayerSortBy>("name");
	let orderBy = $state<OrderBy>("asc");
	let hideAssigned = $state(true);
	const selected = new SvelteSet<Id<"players">>();

	const filtered = useFuzzyFilter(
		() => allPlayers,
		() => inputValue,
		{ keys: ["name", "osu_id", "previous_usernames", "tags"], threshold: 0.4 }
	);
	const sorted = useSorted(
		() => filtered.results,
		() => sortBy,
		() => orderBy,
		PLAYER_SORT_OPTIONS
	);

	const assignedSet = $derived(new Set(assignedIds));
	const visiblePlayers = $derived(
		hideAssigned ? sorted.results.filter((p) => !assignedSet.has(p._id)) : sorted.results
	);

	function handleOpenChange(isOpen: boolean) {
		if (isOpen) {
			selected.clear();
			inputValue = "";
		}
	}

	function toggle(playerId: Id<"players">) {
		if (assignedSet.has(playerId)) return;
		if (selected.has(playerId)) selected.delete(playerId);
		else selected.add(playerId);
	}

	function confirm() {
		onAssign([...selected]);
		open = false;
	}

	const formatDate = (ms: number) =>
		new Date(ms).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props} type="button" variant="secondary" size="sm">
				<Icon name="plus" />
				Assign players
			</Button>
		{/snippet}
	</Dialog.Trigger>

	<Dialog.Content class="flex max-h-[85vh] flex-col gap-3 bg-layer-1 sm:max-w-3xl">
		<Dialog.Header>
			<Dialog.Title>Assign players to {skinName || "skin"}</Dialog.Title>
		</Dialog.Header>

		<SearchSorted
			placeholder="Search players..."
			sortOptions={PLAYER_SORT_OPTIONS}
			bind:sortBy
			bind:orderBy
			bind:inputValue
		/>

		<div class="flex gap-2">
			<button
				type="button"
				aria-pressed={hideAssigned}
				onclick={() => (hideAssigned = !hideAssigned)}
				class={cn(
					"rounded-full border px-3 py-0.5 text-xs transition",
					hideAssigned
						? "border-primary/60 bg-primary/20 text-foreground"
						: "border-border text-muted-foreground hover:text-foreground"
				)}
			>
				Hide assigned
			</button>
		</div>

		<Tooltip.Provider delayDuration={150}>
			<div class="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 py-1">
				{#if visiblePlayers.length === 0}
					<p class="py-10 text-center text-muted-foreground">No players match.</p>
				{:else}
					<div class="grid grid-cols-3 gap-2 sm:grid-cols-5">
						{#each visiblePlayers as player (player._id)}
							{@const isAssigned = assignedSet.has(player._id)}
							{@const isSelected = selected.has(player._id)}
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
									onclick={() => toggle(player._id)}
								>
									<img
										src={osuAvatar(player.osu_id)}
										alt=""
										class={cn("aspect-square w-full object-cover", isAssigned && "opacity-40")}
									/>
									<p class={cn("truncate p-1.5 text-xs", isAssigned && "opacity-50")}>
										{player.name}
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
										<p class="col-span-2 text-center font-medium">{player.name}</p>
										{@render infoRow("osu! ID", String(player.osu_id))}
										{#if player.previous_usernames?.length}
											<p class="col-span-2 text-center text-muted-foreground">
												aka {player.previous_usernames.slice(0, 3).join(", ")}
											</p>
										{/if}
										{@render infoRow("Added", formatDate(player._creationTime))}
										{@render infoRow(
											"Synced",
											player.synced_at ? formatDate(player.synced_at) : "Never"
										)}
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
					{selected.size === 1 ? "player" : "players"}
				</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

{#snippet infoRow(label: string, value: string)}
	<span class="text-right text-muted-foreground">{label}</span>
	<span class="truncate text-left">{value}</span>
{/snippet}
