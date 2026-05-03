<script lang="ts">
	let { data } = $props();
	console.log(() => data.player);
</script>

<main class="main">
	<p>page for the player {data.player.name}</p>
</main>
