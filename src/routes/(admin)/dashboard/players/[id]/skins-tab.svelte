<script lang="ts">
	import { flip } from "svelte/animate";
	import Icon from "$comp/icon.svelte";
	import type { Id } from "$convex/_generated/dataModel";
	import { SORTABLE_GHOST_CLASS, moveItem, sortable } from "$lib/sortable";
	import type { SkinWithPlayers } from "$lib/types";
	import { cn } from "$lib/utils";
	import AssignSkinsDialog from "../../dialogs/assign-skins-dialog.svelte";
	import type { PlayerDraft } from "./player-fields";

	let { draft = $bindable(), allSkins }: { draft: PlayerDraft; allSkins: SkinWithPlayers[] } =
		$props();

	// Newly assigned skins go on top, like on the profile page.
	function addSkins(skinIds: Id<"skins">[]) {
		const assigned = new Set(draft.skins.map((s) => s.id));
		const added = allSkins.filter((skin) => skinIds.includes(skin._id) && !assigned.has(skin._id));
		draft.skins = [...added.map((skin) => ({ id: skin._id, hidden: false, skin })), ...draft.skins];
	}

	function removeSkin(skinId: Id<"skins">) {
		draft.skins = draft.skins.filter((s) => s.id !== skinId);
	}

	// Icon buttons: 44px on the phone layout, smaller next to a mouse.
	const iconButton =
		"flex size-11 shrink-0 items-center justify-center rounded-lg min-[900px]:size-8";
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between gap-3">
		<p class="text-sm text-text-muted">
			{draft.skins.length === 0 ? "No skins assigned yet." : "Drag to reorder · first shows first"}
		</p>
		<AssignSkinsDialog
			{allSkins}
			assignedIds={draft.skins.map((s) => s.id)}
			playerName={draft.player.name}
			onAssign={addSkins}
		/>
	</div>

	<div
		class="skins-grid grid gap-4"
		use:sortable={{ onMove: (from, to) => (draft.skins = moveItem(draft.skins, from, to)) }}
	>
		{#each draft.skins as item, i (item.id)}
			<div
				data-sortable-item
				animate:flip={{ duration: 150 }}
				class={cn(
					"group flex cursor-grab touch-manipulation flex-col gap-3 rounded-xl bg-layer-2 p-3 select-none",
					SORTABLE_GHOST_CLASS
				)}
			>
				<div class="relative">
					<img
						src={item.skin.preview_images[0]}
						alt=""
						draggable="false"
						class={cn(
							"aspect-video w-full rounded-lg bg-layer-3 object-cover",
							item.hidden && "brightness-60 grayscale"
						)}
					/>
					<span class="absolute top-2 left-2 rounded-md bg-surface/80 px-2 text-xs tabular-nums">
						#{i + 1}
					</span>
					<button
						type="button"
						class={cn(
							iconButton,
							"absolute top-1 right-1 bg-surface/80 text-text-muted opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 hover:text-text max-[899px]:opacity-100 [@media(hover:none)]:opacity-100"
						)}
						aria-label="Remove {item.skin.name}"
						onclick={() => removeSkin(item.id)}
					>
						<Icon name="x" class="size-4" />
					</button>
				</div>
				<div class="flex items-center gap-2">
					<div class={cn("min-w-0 flex-1", item.hidden && "opacity-50")}>
						<p class="truncate text-sm">{item.skin.name}</p>
						<p class="truncate text-xs text-text-muted">
							{item.hidden ? "hidden from profile" : `by ${item.skin.author ?? "Unknown"}`}
						</p>
					</div>
					<button
						type="button"
						class={cn(
							iconButton,
							"hover:bg-layer-3",
							item.hidden ? "text-accent-color" : "text-text-muted"
						)}
						aria-pressed={item.hidden}
						aria-label={item.hidden ? "Show on profile" : "Hide from profile"}
						title={item.hidden ? "Show on profile" : "Hide from profile"}
						onclick={() => (item.hidden = !item.hidden)}
					>
						<Icon name={item.hidden ? "eye-off" : "eye"} class="size-4" />
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.skins-grid {
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	}
</style>
