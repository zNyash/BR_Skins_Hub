<script lang="ts">
	import type { SkinWithPlayers } from "$lib/types";
	import { timeAgo } from "../derive";

	let { skin, href, current }: { skin: SkinWithPlayers; href: string; current: boolean } = $props();

	const players = $derived(skin.players.length);
	const images = $derived(skin.preview_images.length);
</script>

<!-- The list builds href with resolve() plus the ?filter query. -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->
<a
	{href}
	class="flex min-h-16 items-center gap-3 rounded-xl p-3 {current
		? 'bg-layer-3'
		: 'bg-layer-1 hover:bg-layer-2'}"
	aria-current={current ? "true" : undefined}
>
	<div class="h-10 w-16 shrink-0 overflow-hidden rounded-lg bg-layer-3">
		{#if skin.preview_images[0]}
			<img src={skin.preview_images[0]} alt="" class="size-full object-cover" />
		{/if}
	</div>
	<div class="flex min-w-0 flex-1 flex-col gap-1">
		<span class="truncate leading-tight font-medium">{skin.name}</span>
		<span class="truncate text-xs leading-tight text-text-muted">
			{players}
			{players === 1 ? "player" : "players"} · {images}
			{images === 1 ? "image" : "images"}
		</span>
	</div>
	{#if skin.updated_at !== undefined}
		<span class="shrink-0 text-xs leading-tight text-text-muted">
			{timeAgo(skin.updated_at, Date.now())}
		</span>
	{/if}
</a>
