<script lang="ts">
	import { resolve } from "$app/paths";
	import PlayerCard from "$comp/player-card.svelte";
	import SearchSorted from "$comp/search-sorted.svelte";
	import type { OrderBy, SortBy } from "$lib/constants.js";
	import { useFuzzyFilter } from "$lib/utils/fuzzyFilter.svelte.js";
	import { useSorted } from "$lib/utils/sorted.svelte.js";

	let { data } = $props();
	let inputValue = $state("");
	let sortBy = $state<SortBy>("name");
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
		{ keys: ["name", "osu_id", "previous_usernames"], threshold: 0.4 }
	);
	const sorted = useSorted(
		() => filtered.results,
		() => sortBy,
		() => orderBy
	);
</script>

<main class="main">
	<section class="section">
		<div class="flex w-full items-center justify-between">
			<SearchSorted
				placeholder="Search players by name or ID..."
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

	<div class="flex p-10">
		<div class="bg-crust size-10"></div>
		<div class="size-10 bg-background"></div>
		<div class="size-10 bg-card"></div>
		<div class="size-10 bg-popover"></div>
		<div class="size-10 bg-accent"></div>
		<div class="size-10 bg-layer-4"></div>
		<div class="size-10 bg-layer-5"></div>
	</div>
</main>
