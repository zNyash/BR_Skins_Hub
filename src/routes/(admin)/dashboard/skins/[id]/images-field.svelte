<script lang="ts">
	import { flip } from "svelte/animate";
	import Icon from "$comp/icon.svelte";
	import { SORTABLE_GHOST_CLASS, moveItem, sortable } from "$lib/sortable";
	import { cn } from "$lib/utils";
	import type { ImageItem } from "../../skin-images";

	/** The skin's preview images: drag to reorder (first is the thumbnail), add files, remove. */
	let { images = $bindable(), skinName }: { images: ImageItem[]; skinName: string } = $props();

	let fileInput = $state<HTMLInputElement | null>(null);
	let isFileDragOver = $state(false);

	function addFiles(files: FileList | null | undefined) {
		if (!files) return;
		for (const file of files) {
			if (!file.type.startsWith("image/")) continue;
			const preview = URL.createObjectURL(file);
			images.push({ id: preview, kind: "file", file, preview });
		}
	}

	function removeImage(index: number) {
		const item = images[index];
		if (item.kind === "file") URL.revokeObjectURL(item.preview);
		images.splice(index, 1);
	}

	// Dropping files from the computer anywhere on the page adds them while this editor is open.
	// Reordering uses pointer events (sortable), not HTML5 drag, so only real file drags get here.
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

	const iconButton =
		"flex size-11 shrink-0 items-center justify-center rounded-lg min-[900px]:size-8";
</script>

<svelte:window
	ondragenter={handleWindowDragOver}
	ondragover={handleWindowDragOver}
	ondragleave={handleWindowDragLeave}
	ondrop={handleWindowDrop}
/>

{#if isFileDragOver}
	<div class="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-surface/80 p-8">
		<div
			class="flex size-full flex-col items-center justify-center gap-3 rounded-2xl text-lg outline-2 outline-accent-color outline-dashed"
		>
			<Icon name="image-up" class="size-10 text-accent-color" />
			Drop images to add them to {skinName || "this skin"}
		</div>
	</div>
{/if}

<section class="flex flex-col gap-4" aria-label="Images">
	<div class="flex items-center justify-between gap-3">
		<div class="flex min-w-0 flex-col gap-1">
			<span class="text-sm leading-tight">Images · {images.length}</span>
			<span class="text-xs leading-tight text-text-muted">
				Drag to reorder · first is the thumbnail · drop files anywhere to add
			</span>
		</div>
		<button
			type="button"
			class="flex h-11 shrink-0 items-center gap-2 rounded-lg bg-layer-2 px-3 text-sm hover:bg-layer-3 min-[900px]:h-8"
			onclick={() => fileInput?.click()}
		>
			<Icon name="image-up" class="size-4" />
			Add images
		</button>
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
	</div>

	{#if images.length === 0}
		<p class="rounded-xl bg-layer-2 p-4 text-center text-sm text-text-muted">No images yet.</p>
	{/if}
	<div
		class="images-grid grid gap-4"
		use:sortable={{ onMove: (from, to) => (images = moveItem(images, from, to)) }}
	>
		{#each images as item, i (item.id)}
			<div
				data-sortable-item
				animate:flip={{ duration: 150 }}
				class={cn(
					"group relative aspect-video cursor-grab touch-manipulation overflow-hidden rounded-xl bg-layer-2 select-none",
					SORTABLE_GHOST_CLASS,
					item.kind === "file" && "outline-2 outline-offset-2 outline-accent-color outline-dashed"
				)}
			>
				<img
					src={item.kind === "url" ? item.url : item.preview}
					alt="Image {i + 1}"
					draggable="false"
					class="pointer-events-none size-full object-cover"
				/>
				{#if i === 0}
					<span
						class="absolute top-2 left-2 rounded-md bg-accent-color px-2 text-xs font-medium text-on-accent"
					>
						Thumbnail
					</span>
				{/if}
				{#if item.kind === "file"}
					<span class="absolute bottom-2 left-2 rounded-md bg-surface/80 px-2 text-xs">
						not uploaded
					</span>
				{/if}
				<button
					type="button"
					class={cn(
						iconButton,
						"absolute top-1 right-1 bg-surface/80 text-text-muted opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 hover:text-text max-[899px]:opacity-100 [@media(hover:none)]:opacity-100"
					)}
					aria-label="Remove image {i + 1}"
					onclick={() => removeImage(i)}
				>
					<Icon name="x" class="size-4" />
				</button>
			</div>
		{/each}
	</div>
</section>

<style>
	.images-grid {
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	}
</style>
