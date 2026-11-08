<script module lang="ts">
	import type { Doc, Id } from "$convex/_generated/dataModel";

	/** What the editor pages read from this layout (the stepper walks the filtered, sorted list). */
	export type PlayersContext = {
		results: Doc<"players">[];
		skinCounts: Map<Id<"players">, number>;
		openCreator: () => void;
		listHref: () => string;
	};
</script>

<script lang="ts">
	import { setContext } from "svelte";
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import Icon from "$comp/icon.svelte";
	import { Input } from "$comp/ui/input";
	import { PLAYER_LIST, useListQuery } from "$lib/hooks/list-query.svelte";
	import { PLAYER_FILTERS, parseFilter, setParam, skinCountByPlayer } from "../derive";
	import PlayerCreatorDialog from "../dialogs/player-creator-dialog.svelte";
	import ListPane from "../list-pane.svelte";
	import PlayerRow from "./player-row.svelte";

	let { data, children } = $props();

	let creatorOpen = $state(false);

	const filter = $derived(parseFilter("players", page.url.searchParams.get("filter")));
	const skinCounts = $derived(skinCountByPlayer(data.skins));

	// Chip counts and the filtered list share one pass over the filters.
	const chips = $derived.by(() => {
		const ctx = { skinCounts, now: Date.now() };
		return PLAYER_FILTERS.map((f) => {
			const matches = data.players.filter((p) => f.test(p, ctx));
			return { id: f.id, label: f.label, matches };
		});
	});
	const filtered = $derived(chips.find((c) => c.id === filter)?.matches ?? data.players);

	const listQuery = useListQuery(() => filtered, {
		...PLAYER_LIST,
		defaultSort: "updated",
		defaultOrder: "desc"
	});

	const SORTS = [
		{ value: "updated", label: "Last edited", order: "desc" },
		{ value: "name", label: "A–Z", order: "asc" }
	] as const;

	function setSort(value: string) {
		const sort = SORTS.find((s) => s.value === value) ?? SORTS[0];
		listQuery.sortBy = sort.value;
		listQuery.orderBy = sort.order;
	}

	// --- URLs ---
	// The filter follows you between players; the tab resets so a new player opens on Profile.

	// Only a known filter is carried over; an unknown value means no filter.
	function filterQuery(): string {
		return filter ? `?filter=${filter}` : "";
	}

	function chipHref(id: string): string {
		return page.url.pathname + setParam(page.url.searchParams, "filter", filter === id ? null : id);
	}

	function playerHref(id: string): string {
		return resolve(`/dashboard/players/${id}`) + filterQuery();
	}

	setContext<PlayersContext>("players-list", {
		get results() {
			return listQuery.results;
		},
		get skinCounts() {
			return skinCounts;
		},
		openCreator: () => (creatorOpen = true),
		listHref: () => resolve("/dashboard/players") + filterQuery()
	});

	const field = "h-11 min-[900px]:h-9";
</script>

<!-- URLs here are resolve() plus a query string (or the current path with a new query), which the rule can't follow. -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->

<ListPane
	hasItem={page.params.id !== undefined}
	onClose={() => goto(resolve("/dashboard/players") + filterQuery())}
>
	{#snippet list()}
		{@render header()}
		<ul class="scroll-list flex min-h-0 flex-1 flex-col gap-2">
			{#each listQuery.results as player (player._id)}
				<li>
					<PlayerRow
						{player}
						href={playerHref(player._id)}
						skinCount={skinCounts.get(player._id) ?? 0}
						current={player._id === page.params.id}
					/>
				</li>
			{:else}
				<li class="p-4 text-center text-sm text-text-muted">No players match.</li>
			{/each}
		</ul>
	{/snippet}
	{#snippet editor()}
		{@render children()}
	{/snippet}
</ListPane>

{#snippet header()}
	<div class="flex shrink-0 flex-col gap-3">
		<div class="flex items-center justify-between gap-3">
			<h1 class="text-xl font-semibold">Players</h1>
			<button
				type="button"
				class="flex {field} items-center gap-2 rounded-lg bg-accent-color px-4 text-sm font-medium text-on-accent"
				onclick={() => (creatorOpen = true)}
			>
				<Icon name="plus" class="size-4" />
				New
			</button>
		</div>
		<Input
			type="search"
			placeholder="Search players"
			aria-label="Search players"
			class="{field} px-3"
			bind:value={listQuery.query}
		/>
		<div
			class="-mx-4 no-scrollbar flex gap-2 overflow-x-auto px-4 min-[900px]:mx-0 min-[900px]:px-0"
		>
			{#each chips as chip (chip.id)}
				<a
					href={chipHref(chip.id)}
					data-sveltekit-noscroll
					data-sveltekit-replacestate
					class="flex {field} shrink-0 items-center gap-2 rounded-full px-4 text-sm {filter ===
					chip.id
						? 'bg-layer-4 text-text'
						: 'bg-layer-2 text-text-muted hover:bg-layer-3'}"
					aria-current={filter === chip.id ? "true" : undefined}
				>
					{chip.label}
					<span class="text-xs">{chip.matches.length}</span>
				</a>
			{/each}
		</div>
		<div class="flex items-center justify-between gap-3 text-sm text-text-muted">
			<span>{listQuery.results.length} of {data.players.length} shown</span>
			<select
				aria-label="Sort"
				class="{field} rounded-lg bg-layer-2 px-3 text-text"
				value={listQuery.sortBy}
				onchange={(e) => setSort(e.currentTarget.value)}
			>
				{#each SORTS as sort (sort.value)}
					<option value={sort.value}>{sort.label}</option>
				{/each}
			</select>
		</div>
	</div>
{/snippet}

<PlayerCreatorDialog
	bind:open={creatorOpen}
	onCreated={(id) => goto(resolve(`/dashboard/players/${id}`) + filterQuery())}
/>
