<script lang="ts">
	import { untrack } from "svelte";
	import { SvelteSet } from "svelte/reactivity";
	import Icon from "$comp/icon.svelte";
	import SearchToolbar from "$comp/search-toolbar.svelte";
	import Button from "$comp/ui/button/button.svelte";
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
