<script lang="ts">
	import type { Doc } from "$convex/_generated/dataModel";
	import { useFuzzyFilter } from "$lib/utils/fuzzyFilter.svelte.js";
	import { Button } from "$comp/ui/button";
	import { Input } from "$comp/ui/input";
	import { invalidate } from "$app/navigation";
	import Icon from "$comp/icon.svelte";

	type SkinWithPlayers = Doc<"skins"> & { players: Doc<"players">[] };

	type Props = {
		player: Doc<"players">;
		allSkins: SkinWithPlayers[];
		onback: () => void;
	};

	let { player, allSkins, onback }: Props = $props();

	// svelte-ignore state_referenced_locally
	let selectedIds = $state<string[]>(
		allSkins.filter((s) => s.players.some((p) => p._id === player._id)).map((s) => s._id)
	);

	let searchValue = $state("");
	let saving = $state(false);

	const filtered = useFuzzyFilter(
		() => allSkins,
		() => searchValue,
		{
			keys: ["name", "author"],
			threshold: 0.4
		}
	);

	const assigned = $derived(allSkins.filter((s) => selectedIds.includes(s._id)));

	const unassigned = $derived(filtered.results.filter((s) => !selectedIds.includes(s._id)));

	async function save() {
		saving = true;
		await fetch(`/api/player-skins/${player._id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ skin_ids: selectedIds })
		});
		await Promise.all([invalidate("app:players"), invalidate("app:skins")]);
		saving = false;
		onback();
	}
</script>

<div class="flex items-center justify-between">
	<span class="flex flex-col">
		<h2 class="text-lg font-medium">Assign Skins</h2>
		<p class="text-xs font-normal">{player.name}</p>
	</span>
	<Button variant="ghost" onclick={onback}>
		<Icon name="arrow-left" />
		Back
	</Button>
</div>

<!-- svelte-ignore a11y_label_has_associated_control -->
<div class="flex flex-col gap-2">
	<label class="text-sm">Assigned</label>
	{#if assigned.length === 0}
		<p class="text-sm text-muted-foreground">No skins assigned</p>
	{:else}
		<div class="flex flex-wrap gap-1">
			{#each assigned as skin (skin._id)}
				<span class="flex items-center gap-1 rounded-full bg-layer-2 px-2 py-0.5 text-sm">
					{skin.name}
					<button
						type="button"
						class="text-muted-foreground hover:text-foreground"
						onclick={() => {
							selectedIds = selectedIds.filter((id) => id !== skin._id);
						}}
					>
						<Icon name="x" class="size-3" />
					</button>
				</span>
			{/each}
		</div>
	{/if}
</div>

<Input bind:value={searchValue} placeholder="Search skins..." />

<!-- svelte-ignore a11y_label_has_associated_control -->
<div class="flex flex-col gap-1">
	<label class="text-sm">Available</label>
	{#if unassigned.length === 0}
		<p class="text-sm text-muted-foreground">No more skins to add</p>
	{:else}
		<div class="flex max-h-64 flex-col gap-1 overflow-y-auto">
			{#each unassigned as skin (skin._id)}
				<button
					type="button"
					class="flex cursor-pointer items-center gap-2 rounded-lg bg-card p-1 hover:ring hover:ring-primary hover:ring-inset"
					onclick={() => {
						selectedIds = [...selectedIds, skin._id];
					}}
				>
					{#if skin.preview_images[0]}
						<img src={skin.preview_images[0]} alt={skin.name} class="size-8 rounded object-cover" />
					{:else}
						<div class="size-8 rounded bg-layer-1"></div>
					{/if}
					<span class="text-sm">{skin.name}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<Button variant="default" onclick={save} disabled={saving}>
	{saving ? "Saving..." : "Save"}
</Button>
