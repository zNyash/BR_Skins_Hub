<script lang="ts">
	import SearchSorted from "$comp/search-sorted.svelte";
	import SkinCard from "$comp/skin-card.svelte";
	import type { OrderBy, SortBy } from "$lib/constants.js";
	import { useFuzzyFilter } from "$lib/utils/fuzzyFilter.svelte.js";
	import { useSorted } from "$lib/utils/sorted.svelte.js";

	let { data } = $props();

	let inputValue = $state("");
	let sortBy = $state<SortBy>("date");
	let orderBy = $state<OrderBy>("desc");

	export const snapshot = {
		capture: () => ({ inputValue, sortBy, orderBy }),
		restore: (value) => {
			inputValue = value.inputValue;
			sortBy = value.sortBy;
			orderBy = value.orderBy;
		}
	};

	const filtered = useFuzzyFilter(
		() => data.skins,
		() => inputValue,
		{ keys: ["name"], threshold: 0.4 }
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
				placeholder="Search skins by name..."
				bind:sortBy
				bind:orderBy
				bind:inputValue
			/>
			<p class="text-xs">Loaded {data.skins.length} skins</p>
		</div>
		<div class="common-grid">
			{#each sorted.results as skin (skin._id)}
				<SkinCard {skin} />
			{/each}
		</div>
	</section>
</main>
