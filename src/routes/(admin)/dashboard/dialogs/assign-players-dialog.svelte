<script lang="ts">
	import { untrack } from "svelte";
	import { SvelteSet } from "svelte/reactivity";
	import Icon from "$comp/icon.svelte";
	import SearchToolbar from "$comp/search-toolbar.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import { Badge } from "$comp/ui/badge";
	import * as Dialog from "$comp/ui/dialog";
	import * as Tooltip from "$comp/ui/tooltip";
	import type { Doc, Id } from "$convex/_generated/dataModel";
	import { PLAYER_LIST, useListQuery } from "$lib/hooks/list-query.svelte";
	import { osuAvatar } from "$lib/osu";
	import { cn, formatDate } from "$lib/utils";

	type Props = {
		allPlayers: Doc<"players">[];
		/** Players already in the editor's draft. They can't be selected again. */
		assignedIds: Id<"players">[];
		skinName: string;
		onAssign: (playerIds: Id<"players">[]) => void;
		/** Bind it to open the dialog from somewhere other than its own trigger button. */
		open?: boolean;
	};

	let { allPlayers, assignedIds, skinName, onAssign, open = $bindable(false) }: Props = $props();
	let hideAssigned = $state(true);
	const selected = new SvelteSet<Id<"players">>();

	const players = useListQuery(() => allPlayers, PLAYER_LIST);

	const assignedSet = $derived(new Set(assignedIds));
	const visiblePlayers = $derived(
		hideAssigned ? players.results.filter((p) => !assignedSet.has(p._id)) : players.results
	);

	// Each opening starts fresh, whether from the trigger or from a bound `open`.
	$effect.pre(() => {
		if (!open) return;
		untrack(() => {
			selected.clear();
			players.query = "";
		});
	});

	function toggle(playerId: Id<"players">) {
		if (assignedSet.has(playerId)) return;
		if (selected.has(playerId)) selected.delete(playerId);
		else selected.add(playerId);
	}

	function confirm() {
		onAssign([...selected]);
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props} type="button" variant="secondary" size="sm" class="h-11 min-[900px]:h-8">
				<Icon name="plus" />
				Assign players
			</Button>
		{/snippet}
	</Dialog.Trigger>

	<Dialog.Content class="flex max-h-[85vh] flex-col gap-3 bg-layer-1 sm:max-w-3xl">
		<Dialog.Header>
			<Dialog.Title>Assign players to {skinName || "skin"}</Dialog.Title>
		</Dialog.Header>

		<SearchToolbar list={players} placeholder="Search players..." />

		<div class="flex gap-2">
			<button
				type="button"
				aria-pressed={hideAssigned}
				onclick={() => (hideAssigned = !hideAssigned)}
				class={cn(
					"flex h-11 items-center rounded-md px-2 text-caption transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-accent-color min-[900px]:h-7",
					hideAssigned
						? "bg-layer-3 text-text"
						: "bg-layer-2 text-text-muted hover:bg-layer-3 hover:text-text"
				)}
			>
				Hide assigned
			</button>
		</div>

		<Tooltip.Provider delayDuration={150}>
			<div class="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 py-1">
				{#if visiblePlayers.length === 0}
					<p class="py-10 text-center text-body text-text-muted">No players match.</p>
				{:else}
					<div class="grid grid-cols-3 gap-2 sm:grid-cols-5">
						{#each visiblePlayers as player (player._id)}
							{@const isAssigned = assignedSet.has(player._id)}
							{@const isSelected = selected.has(player._id)}
							<div
								class={cn(
									"relative overflow-hidden rounded-md bg-layer-2 transition-colors duration-fast",
									isSelected && "bg-layer-3 ring-2 ring-accent-color",
									!isAssigned && !isSelected && "hover:bg-layer-3"
								)}
							>
								<button
									type="button"
									class="flex w-full flex-col text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-color disabled:cursor-not-allowed"
									disabled={isAssigned}
									aria-pressed={isSelected}
									onclick={() => toggle(player._id)}
								>
									<img
										src={osuAvatar(player.osu_id)}
										alt=""
										class={cn("aspect-square w-full object-cover", isAssigned && "opacity-40")}
									/>
									<p class={cn("truncate p-2 text-caption", isAssigned && "opacity-50")}>
										{player.name}
									</p>
								</button>

								<span
									class={cn(
										"pointer-events-none absolute top-2 left-2 grid size-4 place-items-center rounded-sm border border-text/60 bg-overlay",
										isSelected && "border-accent-color bg-accent-color text-on-accent"
									)}
								>
									{#if isSelected}<Icon name="check" class="size-3" />{/if}
								</span>

								{#if isAssigned}
									<Badge variant="image" class="pointer-events-none absolute bottom-10 left-2"
										>Assigned</Badge
									>
								{/if}

								<Tooltip.Root>
									<Tooltip.Trigger
										type="button"
										class="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-overlay text-text transition-colors duration-fast hover:bg-layer-4 focus-visible:outline-2 focus-visible:outline-accent-color"
									>
										<Icon name="info" class="size-4" />
									</Tooltip.Trigger>
									<Tooltip.Content
										side="right"
										class="grid w-56 grid-cols-2 items-start gap-x-2 gap-y-1 bg-layer-2 p-2 text-caption text-text shadow-float"
										arrowClasses="bg-layer-2 fill-layer-2"
									>
										<p class="col-span-2 text-center text-label">{player.name}</p>
										{@render infoRow("osu! ID", String(player.osu_id))}
										{#if player.previous_usernames?.length}
											<p class="col-span-2 text-center text-text-muted">
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
			<span class="text-caption text-text-muted">
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
	<span class="text-right text-text-muted">{label}</span>
	<span class="truncate text-left">{value}</span>
{/snippet}
