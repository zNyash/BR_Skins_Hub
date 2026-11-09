<script lang="ts">
	import PageHeading from "$comp/page-heading.svelte";
	import SearchToolbar from "$comp/search-toolbar.svelte";
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
		<SearchToolbar list={skins} placeholder="Search skins by name..." total={data.skins.length} />
		<div class="common-grid">
			{#each skins.results as skin (skin._id)}
				<SkinCard {skin} />
			{/each}
		</div>
	</section>
</main>
