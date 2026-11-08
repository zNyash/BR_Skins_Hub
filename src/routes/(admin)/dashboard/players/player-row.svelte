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

	// Per cover URL, so editing the cover starts over instead of keeping the old state.
	let loadedCover = $state<string | null>(null);
	let failedCover = $state<string | null>(null);

	const cover = $derived(player.cover_url);
	const status = $derived(
		!cover
			? "none"
			: cover === failedCover
				? "failed"
				: cover === loadedCover
					? "loaded"
					: "loading"
	);
	const filled = $derived(setupFilled(player));

	// A server-rendered image can finish before hydration, so its load/error has already happened.
	function checkComplete(img: HTMLImageElement) {
		if (!img.complete || !cover) return;
		if (img.naturalWidth > 0) loadedCover = cover;
		else failedCover = cover;
	}

	const MASK = "linear-gradient(90deg, #000 15%, transparent)";
</script>

<!-- The list builds href with resolve() plus the ?filter query. -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->
<a
	{href}
	class="relative flex min-h-16 items-center gap-3 overflow-hidden rounded-xl p-3 {current
		? 'bg-layer-3'
		: 'bg-layer-1 hover:bg-layer-2'}"
	aria-current={current ? "true" : undefined}
>
	{#if cover && status !== "failed"}
		<div class="absolute inset-y-0 left-0 w-3/5" style:mask-image={MASK}>
			{#if status === "loading"}
				<div class="absolute inset-0 animate-pulse bg-layer-4"></div>
			{/if}
			<img
				src={cover}
				alt=""
				class="size-full object-cover transition-opacity {status === 'loaded'
					? 'opacity-100'
					: 'opacity-0'}"
				onload={() => (loadedCover = cover ?? null)}
				onerror={() => (failedCover = cover ?? null)}
				{@attach checkComplete}
			/>
		</div>
	{/if}

	<img
		src={osuAvatar(player.osu_id)}
		alt=""
		class="relative size-10 shrink-0 rounded-full bg-layer-3 object-cover"
	/>
	<div class="relative flex min-w-0 flex-1 flex-col gap-1">
		<span class="truncate leading-tight font-medium text-shadow-sm">{player.name}</span>
		{#if status === "failed"}
			<span class="text-xs leading-tight text-error">cover failed to load</span>
		{/if}
	</div>

	<div
		class="relative flex shrink-0 flex-col items-end gap-1 text-xs leading-tight text-text-muted"
	>
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
