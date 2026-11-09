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
	import FilterChips from "$comp/filter-chips.svelte";
	import Icon from "$comp/icon.svelte";
	import SearchToolbar from "$comp/search-toolbar.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import { PLAYER_LIST, useListQuery } from "$lib/hooks/list-query.svelte";
	import { PLAYER_FILTERS, parseFilter, setParam, skinCountByPlayer } from "../derive";
	import PlayerCreatorDialog from "../dialogs/player-creator-dialog.svelte";
	import ListPane from "../list-pane.svelte";
	import { unsaved } from "../unsaved.svelte";
	import PlayerRow from "./player-row.svelte";

	let { data, children } = $props();

	let creatorOpen = $state(false);

	// Opening the creator would navigate away from unsaved changes: point at the bar instead.
	function openCreator() {
		if (unsaved.dirty || unsaved.saving) unsaved.shake();
		else creatorOpen = true;
	}

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

	// --- URLs ---
	// The filter follows you between players; the tab resets so a new player opens on Profile.

	// Only a known filter is carried over; an unknown value means no filter.
	function filterQuery(): string {
		return filter ? `?filter=${filter}` : "";
	}

	// FilterChips already turns "All" and a re-click of the selected chip into null.
	function chipHref(id: string | null): string {
		return page.url.pathname + setParam(page.url.searchParams, "filter", id);
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
		openCreator,
		listHref: () => resolve("/dashboard/players") + filterQuery()
	});
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
				<li class="p-4 text-center text-body text-text-muted">No players match.</li>
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
			<h1 class="text-page-title">Players</h1>
			<Button onclick={openCreator}>
				<Icon name="plus" />
				New
			</Button>
		</div>
		<SearchToolbar list={listQuery} placeholder="Search players" total={data.players.length}>
			<FilterChips
				label="Filter players"
				chips={chips.map((c) => ({ id: c.id, label: c.label, count: c.matches.length }))}
				value={filter}
				total={data.players.length}
				onchange={(id) =>
					goto(chipHref(id), { replaceState: true, noScroll: true, keepFocus: true })}
			/>
		</SearchToolbar>
	</div>
{/snippet}

<PlayerCreatorDialog
	bind:open={creatorOpen}
	onCreated={(id) => goto(resolve(`/dashboard/players/${id}`) + filterQuery())}
/>
