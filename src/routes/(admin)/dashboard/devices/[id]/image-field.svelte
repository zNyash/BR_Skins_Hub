<script lang="ts">
	import Icon from "$comp/icon.svelte";
	import { Badge } from "$comp/ui/badge";
	import Button from "$comp/ui/button/button.svelte";
	import type { ImageItem } from "../../skin-images";

	/** The device's one image: pick or drop a file to set (or replace) it, or remove it. */
	let { image = $bindable(), deviceName }: { image: ImageItem | null; deviceName: string } =
		$props();

	let fileInput = $state<HTMLInputElement | null>(null);
	let isFileDragOver = $state(false);

	function setFile(files: FileList | null | undefined) {
		const file = [...(files ?? [])].find((f) => f.type.startsWith("image/"));
		if (!file) return;
		if (image?.kind === "file") URL.revokeObjectURL(image.preview);
		const preview = URL.createObjectURL(file);
		image = { id: preview, kind: "file", file, preview };
	}

	function remove() {
		if (image?.kind === "file") URL.revokeObjectURL(image.preview);
		image = null;
	}

	// Dropping a file anywhere on the page sets it while this editor is open.
	const hasFiles = (event: DragEvent) => event.dataTransfer?.types.includes("Files") ?? false;

	function handleWindowDragOver(event: DragEvent) {
		if (!hasFiles(event)) return;
		event.preventDefault();
		isFileDragOver = true;
	}
	function handleWindowDragLeave(event: DragEvent) {
		if (event.relatedTarget === null) isFileDragOver = false;
	}
	function handleWindowDrop(event: DragEvent) {
		if (!hasFiles(event)) return;
		event.preventDefault();
		isFileDragOver = false;
		setFile(event.dataTransfer?.files);
	}
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
			class="flex size-full flex-col items-center justify-center gap-3 rounded-xl text-section-title outline-2 outline-accent-color outline-dashed"
		>
			<Icon name="image-up" class="size-10 text-accent-color" />
			Drop an image for {deviceName || "this device"}
		</div>
	</div>
{/if}

<section class="flex flex-col gap-4" aria-label="Image">
	<div class="flex items-center justify-between gap-3">
		<div class="flex min-w-0 flex-col gap-1">
			<span class="text-label">Image</span>
			<span class="text-caption text-text-muted">Drop a file anywhere to set it</span>
		</div>
		<div class="flex items-center gap-2">
			{#if image}
				<Button
					variant="ghost"
					class="text-error hover:text-error min-[900px]:h-8"
					onclick={remove}
				>
					<Icon name="trash" class="size-4" />
					Remove
				</Button>
			{/if}
			<Button variant="secondary" class="min-[900px]:h-8" onclick={() => fileInput?.click()}>
				<Icon name="image-up" class="size-4" />
				{image ? "Replace" : "Add image"}
			</Button>
		</div>
		<input
			bind:this={fileInput}
			type="file"
			accept="image/*"
			class="hidden"
			onchange={(e) => {
				setFile(e.currentTarget.files);
				e.currentTarget.value = ""; // allow picking the same file again
			}}
		/>
	</div>

	{#if image}
		<div
			class="relative aspect-video max-w-80 overflow-hidden rounded-md bg-layer-2 {image.kind ===
			'file'
				? 'outline-2 outline-offset-2 outline-accent-color outline-dashed'
				: ''}"
		>
			<img
				src={image.kind === "url" ? image.url : image.preview}
				alt={deviceName}
				class="size-full object-contain"
			/>
			{#if image.kind === "file"}
				<Badge variant="image" class="absolute bottom-2 left-2">not uploaded</Badge>
			{/if}
		</div>
	{:else}
		<p class="rounded-md bg-layer-2 p-4 text-center text-body text-text-muted">
			No image yet. The type icon is shown instead.
		</p>
	{/if}
</section>
