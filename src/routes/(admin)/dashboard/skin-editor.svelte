<script lang="ts">
	import { onDestroy } from "svelte";
	import { toast } from "svelte-sonner";
	import { flip } from "svelte/animate";
	import { dndzone } from "svelte-dnd-action";
	import { invalidate } from "$app/navigation";
	import HoldButton from "$comp/hold-button.svelte";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import { Input } from "$comp/ui/input";
	import type { Doc, Id } from "$convex/_generated/dataModel";
	import { request } from "$lib/api";
	import { DND_FLIP_MS, GHOST_CLASS, dndOptions, isGhost } from "$lib/dnd";
	import { osuAvatar } from "$lib/osu";
	import type { SkinWithPlayers } from "$lib/types";
	import { createUploadThing } from "$lib/uploadthing";
	import { cn, formatDate } from "$lib/utils";
	import AssignPlayersDialog from "./assign-players-dialog.svelte";
	import { resolveImageUrls, type ImageItem } from "./skin-images";
	import TagInput from "./tag-input.svelte";

	type Props = {
		skin: SkinWithPlayers;
		allPlayers: Doc<"players">[];
		/** Every tag already used on any player or skin, offered as autocomplete. */
		tagSuggestions: string[];
		onSave: () => void;
		/** Asks the page to confirm and delete this skin. */
		onDelete: () => void;
	};

	let { skin, allPlayers, tagSuggestions, onSave, onDelete }: Props = $props();

	// --- Draft ---
	// svelte-ignore state_referenced_locally
	const initialDraft = {
		skin: {
			name: skin.name,
			author: skin.author ?? "",
			download_url: skin.download_url,
			tags: skin.tags ?? []
		},
		images: skin.preview_images.map((url): ImageItem => ({ id: url, kind: "url", url })),
		playerIds: skin.players.map((p) => p._id)
	};
	let draft = $state(structuredClone(initialDraft));

	let isSaving = $state(false);

	const isDirty = $derived.by(() => {
		const current = $state.snapshot(draft);
		return (
			JSON.stringify(current.skin) !== JSON.stringify(initialDraft.skin) ||
			// Files can't be JSON-compared, so images are compared by id (url or blob preview).
			JSON.stringify(current.images.map((i) => i.id)) !==
				JSON.stringify(initialDraft.images.map((i) => i.id)) ||
			JSON.stringify([...current.playerIds].sort()) !==
				JSON.stringify([...initialDraft.playerIds].sort())
		);
	});

	const canSave = $derived(
		isDirty && draft.skin.name.trim() !== "" && URL.canParse(draft.skin.download_url.trim())
	);

	const assignedPlayers = $derived(allPlayers.filter((p) => draft.playerIds.includes(p._id)));

	// --- Saving ---
	const { startUpload } = createUploadThing("imageUploader", {
		onUploadError: (error) => console.error("[uploadthing]", error)
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!canSave || isSaving) return;

		isSaving = true;

		try {
			// 1. Upload new files (in their current order), then swap them for their urls.
			const files = draft.images.flatMap((item) => (item.kind === "file" ? [item.file] : []));
			let uploadedUrls: string[] = [];
			if (files.length > 0) {
				const uploaded = await startUpload(files);
				if (!uploaded) throw new Error("Image upload failed");
				uploadedUrls = uploaded.map((file) => file.ufsUrl);
			}
			const preview_images = resolveImageUrls(draft.images, uploadedUrls);

			// 2. Save the skin and who uses it, in one transaction.
			//    The server deletes images that were removed from the list.
			await request(`/api/skins/${skin._id}`, {
				method: "PATCH",
				body: {
					name: draft.skin.name.trim(),
					author: draft.skin.author.trim(),
					download_url: draft.skin.download_url.trim(),
					tags: draft.skin.tags,
					preview_images,
					player_ids: draft.playerIds
				}
			});
			toast.success("Skin saved");

			onSave();
			await invalidate("app:skins");
		} catch (e) {
			toast.error((e as Error).message);
		} finally {
			isSaving = false;
		}
	}

	// --- Images ---
	// Blob urls hold the file in memory until revoked, so free them whenever a pending image goes away.
	function revokePreviews(items: ImageItem[]) {
		for (const item of items) if (item.kind === "file") URL.revokeObjectURL(item.preview);
	}
	onDestroy(() => revokePreviews(draft.images));

	function discard() {
		revokePreviews(draft.images);
		draft = structuredClone(initialDraft);
	}

	let fileInput = $state<HTMLInputElement | null>(null);
	let isFileDragOver = $state(false);

	function addFiles(files: FileList | null | undefined) {
		if (!files) return;
		for (const file of files) {
			if (!file.type.startsWith("image/")) continue;
			const preview = URL.createObjectURL(file);
			draft.images.push({ id: preview, kind: "file", file, preview });
		}
	}

	function removeImage(index: number) {
		revokePreviews(draft.images.slice(index, index + 1));
		draft.images.splice(index, 1);
	}

	// Dropping files from the computer anywhere on the page adds them while this editor is open.
	// Reordering uses pointer events (svelte-dnd-action), not HTML5 drag, so only real file drags get here.
	const hasFiles = (event: DragEvent) => event.dataTransfer?.types.includes("Files") ?? false;

	function handleWindowDragOver(event: DragEvent) {
		if (!hasFiles(event)) return;
		event.preventDefault();
		isFileDragOver = true;
	}
	function handleWindowDragLeave(event: DragEvent) {
		// relatedTarget is null only when the pointer leaves the window, not when it moves between elements.
		if (event.relatedTarget === null) isFileDragOver = false;
	}
	function handleWindowDrop(event: DragEvent) {
		if (!hasFiles(event)) return;
		event.preventDefault();
		isFileDragOver = false;
		addFiles(event.dataTransfer?.files);
	}

	// --- Players ---
	function addPlayers(playerIds: Id<"players">[]) {
		for (const id of playerIds) {
			if (!draft.playerIds.includes(id)) draft.playerIds.push(id);
		}
	}
	function removePlayer(playerId: Id<"players">) {
		draft.playerIds = draft.playerIds.filter((id) => id !== playerId);
	}
</script>

<svelte:window
	ondragenter={handleWindowDragOver}
	ondragover={handleWindowDragOver}
	ondragleave={handleWindowDragLeave}
	ondrop={handleWindowDrop}
/>

{#if isFileDragOver}
	<div
		class="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-background/80 p-8 backdrop-blur-sm"
	>
		<div
			class="flex size-full flex-col items-center justify-center gap-3 rounded-xl text-lg outline-2 outline-primary outline-dashed"
		>
			<Icon name="image-up" class="size-10 text-primary" />
			Drop images to add them to {draft.skin.name || "this skin"}
		</div>
	</div>
{/if}

<div class="flex flex-col gap-2">
	<span class="flex items-center justify-between">
		<div class="flex flex-col">
			<p class="text-lg font-medium">Editing skin</p>
			<p class="text-xs font-normal">
				{skin.name} · updated {formatDate(skin.updated_at ?? skin._creationTime)}
			</p>
		</div>

		<div class="flex gap-2">
			<HoldButton
				variant="destructive"
				duration={1500}
				fillColor="bg-black/40"
				size="icon"
				title="Hold to delete"
				onComplete={onDelete}
			>
				<Icon name="trash" />
			</HoldButton>
			{#if isDirty}
				<Button type="button" variant="secondary" onclick={discard}>
					<Icon name="brush-cleaning" />
					Discard
				</Button>
			{/if}
			<Button form="skin-form" type="submit" disabled={!canSave || isSaving}>
				{#if isSaving}
					<Icon name="loader-circle" class="animate-spin" />
					Saving
				{:else}
					<Icon name="save" />
					Save changes
				{/if}
			</Button>
		</div>
	</span>

	<form onsubmit={handleSubmit} id="skin-form" class="flex flex-col gap-2">
		<span class="grid grid-cols-2 gap-2">
			<div class="flex flex-col">
				<label for="skin_name" class="text-sm">Name</label>
				<Input id="skin_name" bind:value={draft.skin.name} />
			</div>
			<div class="flex flex-col">
				<label for="skin_author" class="text-sm">Author</label>
				<Input id="skin_author" bind:value={draft.skin.author} />
			</div>
		</span>

		<div class="flex flex-col">
			<label for="skin_url" class="text-sm">Download URL</label>
			<Input id="skin_url" bind:value={draft.skin.download_url} />
			{#if !URL.canParse(draft.skin.download_url.trim())}
				<p class="text-xs text-red-400">Enter a valid URL.</p>
			{/if}
		</div>

		<TagInput id="skin-tags" bind:tags={draft.skin.tags} suggestions={tagSuggestions} />

		<!-- Preview images -->
		<section
			class="mt-2 flex flex-col gap-2 border-t border-border pt-3"
			aria-label="Preview images"
		>
			<span class="flex items-center justify-between">
				<span class="flex items-center gap-2 text-sm font-medium">
					Preview images
					<span class="rounded-full bg-primary/20 px-2 text-xs">{draft.images.length}</span>
				</span>
				<Button type="button" variant="outline" size="sm" onclick={() => fileInput?.click()}>
					<Icon name="image-up" />
					Add images
				</Button>
				<input
					bind:this={fileInput}
					type="file"
					multiple
					accept="image/*"
					class="hidden"
					onchange={(e) => {
						addFiles(e.currentTarget.files);
						e.currentTarget.value = ""; // allow picking the same file again
					}}
				/>
			</span>
			<p class="text-xs text-muted-foreground">
				Drag to reorder · first is the thumbnail · drop files anywhere to add
			</p>

			{#if draft.images.length === 0}
				<p class="py-4 text-center text-sm text-muted-foreground">No images yet.</p>
			{/if}
			<div
				class="grid grid-cols-2 gap-2 sm:grid-cols-4"
				use:dndzone={dndOptions(draft.images)}
				onconsider={(e) => (draft.images = e.detail.items)}
				onfinalize={(e) => (draft.images = e.detail.items)}
			>
				{#each draft.images as item, i (item.id)}
					<div
						animate:flip={{ duration: DND_FLIP_MS }}
						class={cn(
							"group/img relative aspect-video cursor-grab overflow-hidden rounded-md bg-layer-2",
							item.kind === "file" && "outline-2 outline-offset-2 outline-primary outline-dashed",
							isGhost(item) && GHOST_CLASS
						)}
					>
						<img
							src={item.kind === "url" ? item.url : item.preview}
							alt="Preview {i + 1}"
							draggable="false"
							class="pointer-events-none size-full object-cover"
						/>

						{#if i === 0}
							<span
								class="absolute top-1.5 left-1.5 rounded bg-primary px-1.5 text-[10px] font-bold text-primary-foreground"
							>
								THUMBNAIL
							</span>
						{:else}
							<span class="absolute top-1.5 left-1.5 rounded bg-black/60 px-1 text-[10px]">
								<Icon name="grip-vertical" class="size-3" />
							</span>
						{/if}

						{#if item.kind === "file"}
							<span class="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1 text-[10px]">
								not uploaded
							</span>
						{/if}

						<button
							type="button"
							aria-label="Remove image {i + 1}"
							class="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-black/60 hover:bg-white hover:text-black"
							onclick={() => removeImage(i)}
						>
							<Icon name="x" class="size-3" />
						</button>
					</div>
				{/each}
			</div>
		</section>

		<!-- Players -->
		<div class="mt-2 flex flex-col gap-2 border-t border-border pt-3">
			<span class="flex items-center justify-between">
				<span class="flex items-center gap-2 text-sm font-medium">
					Players
					<span class="rounded-full bg-primary/20 px-2 text-xs">{assignedPlayers.length}</span>
				</span>
				<AssignPlayersDialog
					{allPlayers}
					assignedIds={draft.playerIds}
					skinName={draft.skin.name}
					onAssign={addPlayers}
				/>
			</span>

			{#if assignedPlayers.length === 0}
				<p class="py-4 text-center text-sm text-muted-foreground">No players use this skin yet.</p>
			{:else}
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
					{#each assignedPlayers as player (player._id)}
						<div
							class="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md bg-layer-2 p-1.5"
						>
							<img src={osuAvatar(player.osu_id)} alt="" class="size-9 rounded-md object-cover" />
							<div class="min-w-0">
								<p class="truncate text-sm">{player.name}</p>
								<p class="truncate text-xs text-muted-foreground">osu! #{player.osu_id}</p>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label="Remove {player.name}"
								onclick={() => removePlayer(player._id)}
							>
								<Icon name="x" />
							</Button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</form>
</div>
