<script lang="ts">
	import type { Doc } from "$convex/_generated/dataModel";
	import { osuAvatar } from "$lib/osu";
	import { setupFilled, timeAgo } from "../derive";

	let {
		player,
		href,
		skinCount,
		current
	}: { player: Doc<"players">; href: string; skinCount: number; current: boolean } = $props();

	const filled = $derived(setupFilled(player));
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
	<img
		src={osuAvatar(player.osu_id)}
		alt=""
		class="size-10 shrink-0 rounded-full bg-layer-3 object-cover"
	/>
	<span class="min-w-0 flex-1 truncate leading-tight font-medium">{player.name}</span>

	<div class="flex shrink-0 flex-col items-end gap-1 text-xs leading-tight text-text-muted">
		<div class="flex items-center gap-2">
			<span>{skinCount} {skinCount === 1 ? "skin" : "skins"}</span>
			<span class="flex gap-1" role="img" aria-label="Setup {filled}/6">
				{#each { length: 6 }, i (i)}
					<span class="size-2 rounded-full {i < filled ? 'bg-accent-color' : 'bg-layer-4'}"></span>
				{/each}
			</span>
		</div>
		{#if player.updated_at !== undefined}
			<span>{timeAgo(player.updated_at, Date.now())}</span>
		{/if}
	</div>
</a>
