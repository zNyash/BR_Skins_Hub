<script lang="ts">
	let { data } = $props();
</script>

<main class="flex w-full flex-col items-center justify-center">
	<div class="grid w-full max-w-5xl grid-cols-1 gap-2 p-2 md:grid-cols-2 lg:grid-cols-3">
		{#each data.players as player (player._id)}
			<div
				class="relative flex items-center justify-start gap-2 overflow-hidden rounded-lg p-2 outline outline-transparent hover:outline-primary"
			>
				<img
					src={`https://a.ppy.sh/${player.osu_id}`}
					alt={player.name}
					class="size-11 rounded-md"
				/>
				<img
					src={player.cover_url}
					alt={player.name}
					class="absolute inset-0 -z-10 size-full bg-card object-cover"
				/>
				<div class="absolute inset-0 -z-10 size-full bg-black/70"></div>
				<p class="text-lg font-medium text-text">{player.name}</p>
			</div>
		{/each}
	</div>
</main>
