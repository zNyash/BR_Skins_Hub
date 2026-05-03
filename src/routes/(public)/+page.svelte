<script lang="ts">
	import { resolve } from "$app/paths";
	import PlayerCard from "$comp/player-card.svelte";

	let { data } = $props();
</script>

<main class="main">
	<div class="grid w-full max-w-5xl grid-cols-1 gap-2 p-2 md:grid-cols-2 lg:grid-cols-3">
		{#each data.players as player (player._id)}
			<a href={resolve(`/(public)/player/[osuId]`, { osuId: String(player.osu_id) })}
				><PlayerCard {player} /></a
			>
		{/each}
	</div>
	<div class="flex p-10">
		<div class="size-10 bg-background"></div>
		<div class="size-10 bg-card"></div>
		<div class="size-10 bg-popover"></div>
		<div class="size-10 bg-accent"></div>
		<div class="size-10 bg-layer-4"></div>
		<div class="size-10 bg-layer-5"></div>
	</div>
</main>
