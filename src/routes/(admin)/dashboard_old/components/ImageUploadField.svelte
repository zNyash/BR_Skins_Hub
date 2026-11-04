<script lang="ts">
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";

	type Props = {
		// Existing saved URLs — parent passes $formData.preview_images
		existingImages: string[];
		// Called when the user removes a saved image (parent updates $formData)
		onRemoveExisting: (i: number) => void;
		// $bindable — parent reads this in onUpdate, clears it after upload
		pendingFiles?: File[];
	};

	let { existingImages, onRemoveExisting, pendingFiles = $bindable([]) }: Props = $props();

	// Internal — blob URLs for display only, never leave this component
	let pendingPreviews = $state<string[]>([]);
	let isDragOver = $state(false);
	let fileInput = $state<HTMLInputElement | null>(null);

	// When the parent clears pendingFiles after upload, revoke and clear previews
	$effect(() => {
		if (pendingFiles.length === 0 && pendingPreviews.length > 0) {
			for (const url of pendingPreviews) URL.revokeObjectURL(url);
			pendingPreviews = [];
		}
	});

	// Revoke any remaining blob URLs on unmount
	$effect(() => {
		return () => {
			for (const url of pendingPreviews) URL.revokeObjectURL(url);
		};
	});

	function addFiles(files: FileList | File[] | null) {
		if (!files) return;
		for (const file of files) {
			pendingFiles = [...pendingFiles, file];
			pendingPreviews = [...pendingPreviews, URL.createObjectURL(file)];
		}
	}

	function removePending(i: number) {
		URL.revokeObjectURL(pendingPreviews[i]);
		pendingFiles = pendingFiles.filter((_, j) => j !== i);
		pendingPreviews = pendingPreviews.filter((_, j) => j !== i);
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		isDragOver = false;
		addFiles(e.dataTransfer?.files ?? null);
	}
</script>

<div class="flex flex-col gap-2">
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label class="text-sm">Preview Images</label>

	<!-- Thumbnail grid: existing (saved) + pending (local, not yet uploaded) -->
	{#if existingImages.length > 0 || pendingPreviews.length > 0}
		<div class="flex flex-wrap gap-2">
			{#each existingImages as url, i (url)}
				<div class="relative">
					<img src={url} alt="Preview {i + 1}" class="size-20 rounded-md object-cover" />
					<Button
						class="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full"
						size="icon"
						onclick={() => onRemoveExisting(i)}
					>
						<Icon name="x" class="size-3" />
					</Button>
				</div>
			{/each}

			<!-- Ring indicates these aren't saved yet -->
			{#each pendingPreviews as preview, i (preview)}
				<div class="relative">
					<img
						src={preview}
						alt="Pending {i + 1}"
						class="size-20 rounded-md object-cover ring-2 ring-primary ring-offset-2 ring-offset-card"
					/>
					<Button
						class="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full"
						size="icon"
						onclick={() => removePending(i)}
					>
						<Icon name="x" class="size-3" />
					</Button>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Drop zone — style this however you want.
	     Use data-dragover to style the active drag state, e.g.
	     data-[dragover=true]:border-primary data-[dragover=true]:bg-layer-1 -->
	<div
		role="button"
		tabindex="0"
		data-dragover={isDragOver}
		class="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-surface p-6 text-sm text-muted-foreground"
		onclick={() => fileInput?.click()}
		onkeydown={(e) => (e.key === "Enter" || e.key === " ") && fileInput?.click()}
		ondrop={onDrop}
		ondragover={(e) => {
			e.preventDefault();
			isDragOver = true;
		}}
		ondragleave={() => (isDragOver = false)}
	>
		<Icon name="image-up" class="size-6" />
		<p>Drop images here or click to browse</p>
		<input
			bind:this={fileInput}
			type="file"
			multiple
			accept="image/*"
			class="hidden"
			onchange={(e) => addFiles(e.currentTarget.files)}
		/>
	</div>
</div>
