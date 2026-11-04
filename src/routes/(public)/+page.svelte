<script lang="ts">
	import { resolve } from "$app/paths";
	import PlayerCard from "$comp/player-card.svelte";
	import SearchSorted from "$comp/search-sorted.svelte";
	import { PLAYER_LIST, useListQuery } from "$lib/hooks/list-query.svelte";
	import PageHeading from "$comp/page-heading.svelte";

	let { data } = $props();
	const players = useListQuery(() => data.players, PLAYER_LIST);

	export const snapshot = {
		capture: () => ({ query: players.query, sortBy: players.sortBy, orderBy: players.orderBy }),
		restore: (value) => Object.assign(players, value)
	};
</script>

<PageHeading title="Players Listing" />
<main class="main">
	<section class="section">
		<div class="flex w-full items-center justify-between">
			<SearchSorted list={players} placeholder="Search players by name or ID..." />
			<p class="text-xs">Loaded {data.players.length} players</p>
		</div>
		<div class="common-grid">
			{#each players.results as player (player._id)}
				<a href={resolve(`/(public)/player/[osuId]`, { osuId: String(player.osu_id) })}
					><PlayerCard {player} /></a
				>
			{/each}
		</div>
	</section>
</main>
