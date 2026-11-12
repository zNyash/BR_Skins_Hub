<script lang="ts">
	import Avatar from "$comp/avatar.svelte";
	import ListRow from "$comp/list-row.svelte";
	import type { Doc } from "$convex/_generated/dataModel";
	import { setupFilled, timeAgo } from "../derive";

	let {
		player,
		href,
		skinCount,
		current
	}: { player: Doc<"players">; href: string; skinCount: number; current: boolean } = $props();

	const filled = $derived(setupFilled(player));
</script>

<ListRow {href} {current}>
	{#snippet leading()}
		<Avatar osuId={player.osu_id} size="sm" />
	{/snippet}
	<p class="truncate text-body-strong">{player.name}</p>
	{#snippet trailing()}
		<div class="flex flex-col items-end gap-1">
			<div class="flex items-center gap-2">
				<span>{skinCount} {skinCount === 1 ? "skin" : "skins"}</span>
				<span class="flex gap-1" role="img" aria-label="Setup {filled}/6">
					{#each { length: 6 }, i (i)}
						<span class="size-2 rounded-full {i < filled ? 'bg-accent-color' : 'bg-layer-4'}"
						></span>
					{/each}
				</span>
			</div>
			{#if player.updated_at !== undefined}
				<span>{timeAgo(player.updated_at, Date.now())}</span>
			{/if}
		</div>
	{/snippet}
</ListRow>
