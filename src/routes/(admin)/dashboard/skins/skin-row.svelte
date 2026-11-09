<script lang="ts">
	import ListRow from "$comp/list-row.svelte";
	import type { SkinWithPlayers } from "$lib/types";
	import { timeAgo } from "../derive";

	let { skin, href, current }: { skin: SkinWithPlayers; href: string; current: boolean } = $props();

	const players = $derived(skin.players.length);
	const images = $derived(skin.preview_images.length);
</script>

<ListRow {href} {current}>
	{#snippet leading()}
		<div class="h-10 w-16 shrink-0 overflow-hidden rounded-md bg-layer-3">
			{#if skin.preview_images[0]}
				<img src={skin.preview_images[0]} alt="" class="size-full object-cover" />
			{/if}
		</div>
	{/snippet}
	<div class="flex flex-col gap-1">
		<p class="truncate text-body-strong">{skin.name}</p>
		<p class="truncate text-caption text-text-muted">
			{players}
			{players === 1 ? "player" : "players"} · {images}
			{images === 1 ? "image" : "images"}
		</p>
	</div>
	{#snippet trailing()}
		{#if skin.updated_at !== undefined}
			{timeAgo(skin.updated_at, Date.now())}
		{/if}
	{/snippet}
</ListRow>
