<script lang="ts">
	import PageHeading from "$comp/page-heading.svelte";
	import SearchSorted from "$comp/search-sorted.svelte";
	import SkinCard from "$comp/skin-card.svelte";
	import { SKIN_LIST, useListQuery } from "$lib/hooks/list-query.svelte";

	let { data } = $props();

	const skins = useListQuery(() => data.skins, SKIN_LIST);

	export const snapshot = {
		capture: () => ({ query: skins.query, sortBy: skins.sortBy, orderBy: skins.orderBy }),
		restore: (value) => Object.assign(skins, value)
	};
</script>

<PageHeading title="Skins Listing" />
<main class="main">
	<section class="section">
		<div class="flex w-full items-center justify-between">
			<SearchSorted list={skins} placeholder="Search skins by name..." />
			<p class="text-xs">Loaded {data.skins.length} skins</p>
		</div>
		<div class="common-grid">
			{#each skins.results as skin (skin._id)}
				<SkinCard {skin} />
			{/each}
		</div>
	</section>
</main>
