<script lang="ts">
	import type { Doc } from "$convex/_generated/dataModel";

	let { player }: { player: Doc<"players"> } = $props();
	let isCoverLoaded = $state(true);

	function handleImageError(e: Event) {
		(e.currentTarget as HTMLImageElement).style.display = "none";
		isCoverLoaded = false;
	}
</script>

<div
	class="group/card relative flex items-center justify-start gap-2 rounded-lg p-2 outline outline-transparent hover:outline-primary"
>
	<img src={`https://a.ppy.sh/${player.osu_id}`} alt={player.name} class="size-11 rounded-md" />

	<img
		src={player.cover_url}
		alt={player.name}
		class="absolute top-0 left-0 -z-10 size-full rounded-[calc(var(--radius-lg)+2px)] bg-card object-cover"
		onerror={handleImageError}
	/>
	<div
		class={`absolute inset-0 -z-10 size-full rounded-lg backdrop-blur-[2px] group-hover/card:backdrop-blur-none ${isCoverLoaded ? "bg-black/70" : "bg-card"}`}
	></div>

	<p class="text-lg font-medium text-text">{player.name}</p>
</div>
