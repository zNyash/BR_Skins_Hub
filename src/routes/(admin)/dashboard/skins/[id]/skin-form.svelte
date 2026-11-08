<script lang="ts">
	import { getContext } from "svelte";
	import { toast } from "svelte-sonner";
	import { goto, invalidate } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import Icon from "$comp/icon.svelte";
	import { Input } from "$comp/ui/input";
	import type { Doc, Id } from "$convex/_generated/dataModel";
	import { request } from "$lib/api";
	import { osuAvatar } from "$lib/osu";
	import type { SkinWithPlayers } from "$lib/types";
	import { pickParams, step, stepPosition } from "../../derive";
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

	/** Next/previous skin in the filtered, sorted list, keeping the filter. */
	function go(delta: 1 | -1) {
		const id = step(ctx.results, skin._id, delta);
		if (!id) return;
		const target = resolve(`/dashboard/skins/${id}`);
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() plus a query string
		goto(target + pickParams(page.url.searchParams, ["filter"]));
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

	const field = "h-11 min-[900px]:h-9";
</script>

<EditorFrame
	title={skin.name}
	subtitle={skin.author ? `by ${skin.author}` : "No author"}
	position={stepPosition(ctx.results, skin._id)}
	total={ctx.results.length}
	onPrev={() => go(-1)}
	onNext={() => go(1)}
	menu={[{ label: "Delete…", onSelect: () => (deleteOpen = true), destructive: true }]}
>
	{#snippet avatar()}
		<div class="h-10 w-16 overflow-hidden rounded-lg bg-layer-3">
			{#if skin.preview_images[0]}
				<img src={skin.preview_images[0]} alt="" class="size-full object-cover" />
			{/if}
		</div>
	{/snippet}

	<div class="form-grid">
		<div class="flex flex-col gap-2">
			<label for="skin-name" class="text-sm">Name</label>
			<Input id="skin-name" class={field} bind:value={draft.skin.name} />
		</div>

		<div class="flex flex-col gap-2">
			<label for="skin-author" class="text-sm">Author</label>
			<Input id="skin-author" class={field} bind:value={draft.skin.author} />
		</div>

		<div class="full flex flex-col gap-2">
			<label for="skin-url" class="text-sm">Download link</label>
			<Input
				id="skin-url"
				type="url"
				class={field}
				aria-invalid={!urlValid}
				bind:value={draft.skin.download_url}
			/>
			{#if !urlValid}
				<p class="text-xs text-error">Enter a valid URL.</p>
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
				<span class="text-sm">Used by · {assigned.length}</span>
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
				<div class="flex flex-col gap-4 rounded-xl bg-layer-2 p-4">
					<p class="text-sm text-text-muted">
						Nobody uses this skin. Assign it to a player, or delete it to free up space.
					</p>
					<div class="flex flex-wrap gap-3">
						<button
							type="button"
							class="flex h-11 items-center gap-2 rounded-lg bg-layer-3 px-3 text-sm hover:bg-layer-4 min-[900px]:h-8"
							onclick={() => (assignOpen = true)}
						>
							<Icon name="user-plus" class="size-4" />
							Assign
						</button>
						<button
							type="button"
							class="flex h-11 items-center gap-2 rounded-lg px-3 text-sm text-error hover:bg-layer-3 min-[900px]:h-8"
							onclick={() => (deleteOpen = true)}
						>
							<Icon name="trash" class="size-4" />
							Delete
						</button>
					</div>
				</div>
			{:else}
				<ul class="flex flex-wrap gap-3">
					{#each assigned as player (player._id)}
						<li class="flex h-11 items-center gap-2 rounded-full bg-layer-2 pl-2 min-[900px]:h-9">
							<img
								src={osuAvatar(player.osu_id)}
								alt=""
								class="size-6 rounded-full bg-layer-3 object-cover"
							/>
							<span class="text-sm">{player.name}</span>
							<button
								type="button"
								class="flex size-11 items-center justify-center rounded-full text-text-muted hover:bg-layer-3 hover:text-text min-[900px]:size-9"
								aria-label="Unassign {player.name}"
								onclick={() => removePlayer(player._id)}
							>
								<Icon name="x" class="size-4" />
							</button>
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
