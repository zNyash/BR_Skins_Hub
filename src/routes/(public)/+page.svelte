<script lang="ts">
	import { resolve } from "$app/paths";
	import PlayerCard from "$comp/player-card.svelte";
	import SearchSorted from "$comp/search-sorted.svelte";
	import { PLAYER_SORT_OPTIONS, type OrderBy, type PlayerSortBy } from "$lib/constants";
	import { useFuzzyFilter } from "$lib/utils/fuzzyFilter.svelte";
	import { useSorted } from "$lib/utils/sorted.svelte";
	import PageHeading from "$comp/page-heading.svelte";

	let { data } = $props();
	let inputValue = $state("");
	let sortBy = $state<PlayerSortBy>("name");
	let orderBy = $state<OrderBy>("asc");

	export const snapshot = {
		capture: () => ({ inputValue, sortBy, orderBy }),
		restore: (value) => {
			inputValue = value.inputValue;
			sortBy = value.sortBy;
			orderBy = value.orderBy;
		}
	};

	const filtered = useFuzzyFilter(
		() => data.players,
		() => inputValue,
		{ keys: ["name", "osu_id", "previous_usernames", "tags"], threshold: 0.4 }
	);
	const sorted = useSorted(
		() => filtered.results,
		() => sortBy,
		() => orderBy,
		PLAYER_SORT_OPTIONS
	);
</script>

<PageHeading title="Players Listing" />
<main class="main">
	<section class="section">
		<div class="flex w-full items-center justify-between">
			<SearchSorted
				placeholder="Search players by name or ID..."
				sortOptions={PLAYER_SORT_OPTIONS}
				bind:sortBy
				bind:orderBy
				bind:inputValue
			/>
			<p class="text-xs">Loaded {data.players.length} players</p>
		</div>
		<div class="common-grid">
			{#each sorted.results as player (player._id)}
				<a href={resolve(`/(public)/player/[osuId]`, { osuId: String(player.osu_id) })}
					><PlayerCard {player} /></a
				>
			{/each}
		</div>
	</section>
</main>
