<script lang="ts">
	import { getContext } from "svelte";
	import { toast } from "svelte-sonner";
	import { goto, invalidate } from "$app/navigation";
	import EmptyState from "$comp/empty-state.svelte";
	import Icon from "$comp/icon.svelte";
	import TagChip from "$comp/tag-chip.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import { Input } from "$comp/ui/input";
	import type { Doc, Id } from "$convex/_generated/dataModel";
	import { request } from "$lib/api";
	import type { SkinWithPlayers } from "$lib/types";
	import AssignPlayersDialog from "../../dialogs/assign-players-dialog.svelte";
	import DeleteDialog from "../../dialogs/delete-dialog.svelte";
	import TagInput from "../../dialogs/tag-input.svelte";
	import EditorFrame from "../../editor-frame.svelte";
	import { registerEditor } from "../../unsaved.svelte";
	import type { SkinsContext } from "../+layout.svelte";
	import ImagesField from "./images-field.svelte";
	import { createSkinDraft } from "./skin-draft.svelte";

	/** The editor for one existing skin: frame, one scrolling form, and the draft it edits. */
	let {
		skin,
		players,
		skins
	}: { skin: SkinWithPlayers; players: Doc<"players">[]; skins: SkinWithPlayers[] } = $props();

	const ctx = getContext<SkinsContext>("skins-list");

	const editor = createSkinDraft(() => skin);
	registerEditor(editor);
	const draft = $derived(editor.draft);

	let deleteOpen = $state(false);
	let assignOpen = $state(false);

	const tagSuggestions = $derived(
		[...new Set([...players, ...skins].flatMap((doc) => doc.tags ?? []))].sort()
	);

	// In the draft's order, so newly assigned players show up at the end.
	const assigned = $derived(
		draft.playerIds.flatMap((id) => players.find((p) => p._id === id) ?? [])
	);

	const urlValid = $derived(URL.canParse(draft.skin.download_url.trim()));

	function addPlayers(ids: Id<"players">[]) {
		for (const id of ids) if (!draft.playerIds.includes(id)) draft.playerIds.push(id);
	}

	function removePlayer(id: Id<"players">) {
		draft.playerIds = draft.playerIds.filter((p) => p !== id);
	}

	async function remove() {
		// Rejections are shown by the dialog, which then stays open.
		await request(`/api/skins/${skin._id}`, { method: "DELETE" });
		toast.success("Skin deleted");
		// Edits to a deleted skin have nowhere to go; dropping them lets the navigation through.
		editor.reset();
		// Leave first, so the editor doesn't flash "doesn't exist anymore" once the list reloads.
		await goto(ctx.listHref());
		await Promise.all([invalidate("app:skins"), invalidate("app:players")]);
	}

	const field = "h-11 bg-layer-2 min-[900px]:h-9";
</script>

<EditorFrame
	title={skin.name}
	subtitle={skin.author ? `by ${skin.author}` : "No author"}
	menu={[{ label: "Delete…", onSelect: () => (deleteOpen = true), destructive: true }]}
>
	{#snippet avatar()}
		<div class="h-10 w-16 overflow-hidden rounded-md bg-layer-3">
			{#if skin.preview_images[0]}
				<img src={skin.preview_images[0]} alt="" class="size-full object-cover" />
			{/if}
		</div>
	{/snippet}

	<div class="form-grid">
		<div class="flex flex-col gap-2">
			<label for="skin-name" class="text-label">Name</label>
			<Input id="skin-name" class={field} bind:value={draft.skin.name} />
		</div>

		<div class="flex flex-col gap-2">
			<label for="skin-author" class="text-label">Author</label>
			<Input id="skin-author" class={field} bind:value={draft.skin.author} />
		</div>

		<div class="full flex flex-col gap-2">
			<label for="skin-url" class="text-label">Download link</label>
			<Input
				id="skin-url"
				type="url"
				class={field}
				aria-invalid={!urlValid}
				bind:value={draft.skin.download_url}
			/>
			{#if !urlValid}
				<p class="text-caption text-error">Enter a valid URL.</p>
			{/if}
		</div>

		<div class="full">
			<TagInput id="skin-tags" bind:tags={draft.skin.tags} suggestions={tagSuggestions} />
		</div>

		<div class="full">
			<ImagesField bind:images={draft.images} skinName={draft.skin.name} />
		</div>

		<section class="full flex flex-col gap-4" aria-label="Used by">
			<div class="flex items-center justify-between gap-3">
				<span class="text-label">Used by · {assigned.length}</span>
				<!-- Always mounted here (never moved), so it can't unmount while open. -->
				<AssignPlayersDialog
					bind:open={assignOpen}
					allPlayers={players}
					assignedIds={draft.playerIds}
					skinName={draft.skin.name}
					onAssign={addPlayers}
				/>
			</div>

			{#if assigned.length === 0}
				<EmptyState
					icon="users"
					title="Nobody uses this skin"
					text="Assign it to a player, or delete it to free up space."
				>
					{#snippet action()}
						<div class="flex flex-wrap justify-center gap-3">
							<Button
								variant="secondary"
								class="bg-layer-3 hover:bg-layer-4"
								onclick={() => (assignOpen = true)}
							>
								<Icon name="user-plus" />
								Assign
							</Button>
							<Button
								variant="ghost"
								class="text-error hover:bg-layer-3 hover:text-error"
								onclick={() => (deleteOpen = true)}
							>
								<Icon name="trash" />
								Delete
							</Button>
						</div>
					{/snippet}
				</EmptyState>
			{:else}
				<!-- The x buttons are 44px tall inside 28px chips on phones: the row gap keeps them apart. -->
				<ul class="flex flex-wrap gap-x-2 gap-y-4 min-[900px]:gap-y-2">
					{#each assigned as player (player._id)}
						<li>
							<TagChip
								onremove={() => removePlayer(player._id)}
								removeLabel="Unassign {player.name}"
							>
								{player.name}
							</TagChip>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
</EditorFrame>

<DeleteDialog bind:open={deleteOpen} name={skin.name} kind="skin" onConfirm={remove} />

<style>
	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;
	}

	.full {
		grid-column: 1 / -1;
	}

	/* Measured on the editor's content box (its column is the nearest size container). */
	@container (max-width: 560px) {
		.form-grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
