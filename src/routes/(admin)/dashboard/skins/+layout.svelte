<script module lang="ts">
	import type { SkinWithPlayers } from "$lib/types";

	/** What the editor pages read from this layout (the stepper walks the filtered, sorted list). */
	export type SkinsContext = {
		results: SkinWithPlayers[];
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
	import { DASHBOARD_SKIN_LIST, useListQuery } from "$lib/hooks/list-query.svelte";
	import { SKIN_FILTERS, parseFilter, setParam } from "../derive";
	import SkinCreatorDialog from "../dialogs/skin-creator-dialog.svelte";
	import ListPane from "../list-pane.svelte";
	import { unsaved } from "../unsaved.svelte";
	import SkinRow from "./skin-row.svelte";

	let { data, children } = $props();

	let creatorOpen = $state(false);

	// Opening the creator would navigate away from unsaved changes: point at the bar instead.
	function openCreator() {
		if (unsaved.dirty || unsaved.saving) unsaved.shake();
		else creatorOpen = true;
	}

	const filter = $derived(parseFilter("skins", page.url.searchParams.get("filter")));

	// Chip counts and the filtered list share one pass over the filters.
	const chips = $derived(
		SKIN_FILTERS.map((f) => ({ id: f.id, label: f.label, matches: data.skins.filter(f.test) }))
	);
	const filtered = $derived(chips.find((c) => c.id === filter)?.matches ?? data.skins);

	const listQuery = useListQuery(() => filtered, {
		...DASHBOARD_SKIN_LIST,
		defaultSort: "updated",
		defaultOrder: "desc"
	});

	// --- URLs ---
	// The filter follows you between skins. Only a known filter is carried over.
	function filterQuery(): string {
		return filter ? `?filter=${filter}` : "";
	}

	// FilterChips already turns "All" and a re-click of the selected chip into null.
	function chipHref(id: string | null): string {
		return page.url.pathname + setParam(page.url.searchParams, "filter", id);
	}

	function skinHref(id: string): string {
		return resolve(`/dashboard/skins/${id}`) + filterQuery();
	}

	setContext<SkinsContext>("skins-list", {
		get results() {
			return listQuery.results;
		},
		openCreator,
		listHref: () => resolve("/dashboard/skins") + filterQuery()
	});
</script>

<!-- URLs here are resolve() plus a query string (or the current path with a new query), which the rule can't follow. -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->

<ListPane
	hasItem={page.params.id !== undefined}
	onClose={() => goto(resolve("/dashboard/skins") + filterQuery())}
>
	{#snippet list()}
		{@render header()}
		<ul class="scroll-list flex min-h-0 flex-1 flex-col gap-2">
			{#each listQuery.results as skin (skin._id)}
				<li>
					<SkinRow {skin} href={skinHref(skin._id)} current={skin._id === page.params.id} />
				</li>
			{:else}
				<li class="p-4 text-center text-body text-text-muted">No skins match.</li>
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
			<h1 class="text-page-title">Skins</h1>
			<Button onclick={openCreator}>
				<Icon name="plus" />
				New
			</Button>
		</div>
		<SearchToolbar list={listQuery} placeholder="Search skins" total={data.skins.length}>
			<FilterChips
				label="Filter skins"
				chips={chips.map((c) => ({ id: c.id, label: c.label, count: c.matches.length }))}
				value={filter}
				total={data.skins.length}
				onchange={(id) =>
					goto(chipHref(id), { replaceState: true, noScroll: true, keepFocus: true })}
			/>
		</SearchToolbar>
	</div>
{/snippet}

<SkinCreatorDialog
	bind:open={creatorOpen}
	onCreated={(id) => goto(resolve(`/dashboard/skins/${id}`) + filterQuery())}
/>
