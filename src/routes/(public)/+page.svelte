<script lang="ts">
	import { resolve } from "$app/paths";
	import PlayerCard from "$comp/player-card.svelte";
	import SearchSorted from "$comp/search-sorted.svelte";
	import type { OrderBy, SortBy } from "$lib/constants.js";

	let { data } = $props();
	let sortBy = $state<SortBy>("name");
	let orderBy = $state<OrderBy>("asc");
</script>

<main class="main">
	<section class="section">
		<div class="flex w-full items-center justify-between">
			<SearchSorted placeholder="Search players by name or ID..." bind:sortBy bind:orderBy />
		</div>
		<div class="common-grid">
			{#each data.players as player (player._id)}
				<a href={resolve(`/(public)/player/[osuId]`, { osuId: String(player.osu_id) })}
					><PlayerCard {player} /></a
				>
			{/each}
		</div>
	</section>
	<div class="flex p-10">
		<div class="size-10 bg-background"></div>
		<div class="size-10 bg-card"></div>
		<div class="size-10 bg-popover"></div>
		<div class="size-10 bg-accent"></div>
		<div class="size-10 bg-layer-4"></div>
		<div class="size-10 bg-layer-5"></div>
	</div>
</main>
