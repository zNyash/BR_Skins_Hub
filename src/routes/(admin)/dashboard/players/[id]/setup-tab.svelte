<script lang="ts">
	import { resolve } from "$app/paths";
	import type { Doc } from "$convex/_generated/dataModel";
	import { CARD_IDS, presentCards, type CardId } from "$lib/setup";

	/** Read-only: the setup is edited on the player's own profile. */
	let { player }: { player: Doc<"players"> } = $props();

	const TITLES: Record<CardId, string> = {
		keyboard: "Keyboard",
		tablet: "Tablet",
		mouse: "Mouse",
		monitor: "Monitor",
		in_game: "In-game",
		pc: "PC"
	};

	const present = $derived(presentCards(player.setup));
	const cards = $derived(
		CARD_IDS.filter((id) => present.has(id)).map((id) => {
			const card = player.setup?.[id];
			const model = card && "model" in card ? card.model : undefined;
			return { id, title: TITLES[id], model: model || "–" };
		})
	);

	const profileSetup = $derived(
		resolve("/(public)/player/[osuId]", { osuId: String(player.osu_id) }) + "?tab=setup"
	);
</script>

<div class="flex flex-col gap-4">
	{#if cards.length > 0}
		<ul class="flex flex-col gap-2">
			{#each cards as card (card.id)}
				<li class="flex items-center justify-between gap-3 rounded-md bg-layer-2 p-3 text-body">
					<span class="text-text-muted">{card.title}</span>
					<span class="min-w-0 truncate">{card.model}</span>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-body text-text-muted">No setup yet.</p>
	{/if}
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() plus ?tab -->
	<a href={profileSetup} target="_blank" class="text-body text-accent-color hover:underline">
		Edit on profile ↗
	</a>
</div>
