<script lang="ts">
	import { superForm, defaults } from "sveltekit-superforms";
	import { valibot } from "sveltekit-superforms/adapters";
	import { invalidate } from "$app/navigation";
	import { skinSchema } from "../schemas";
	import type { Doc } from "$convex/_generated/dataModel";
	import { Input } from "$comp/ui/input";
	import { Button } from "$comp/ui/button";
	import type { InferInput } from "valibot";
	import Icon from "$comp/icon.svelte";
	import { untrack } from "svelte";
	import { createUploadThing } from "$lib/utils/uploadthing";
	import ImageUploadField from "./ImageUploadField.svelte";
	import HoldButton from "$comp/ui/hold-button/hold-button.svelte";

	type Props = {
		skin?: Doc<"skins"> | null;
		onsave?: () => void;
		ondelete?: () => void;
	};

	let { skin = null, onsave = () => {}, ondelete = () => {} }: Props = $props();

	const save = untrack(() => onsave);
	const deleteSkin = untrack(() => ondelete);

	// Owned here — child writes to it, parent reads + clears after upload
	let pendingFiles = $state<File[]>([]);
	let uploading = $state(false);

	let statusMessage = $state<string | null>(null);

	const { startUpload } = createUploadThing("imageUploader", {
		onUploadError: (error) => console.error("[uploadthing]", error)
	});

	// ---------- Form ----------
	// svelte-ignore state_referenced_locally
	const skinData = skin
		? ({
				name: skin.name,
				author: skin.author,
				download_url: skin.download_url,
				preview_images: skin.preview_images
			} satisfies InferInput<typeof skinSchema>)
		: {};

	let saved = $state(false);

	const {
		form: formData,
		allErrors,
		errors,
		isTainted,
		tainted,
		enhance,
		reset,
		submitting
	} = superForm(defaults(skinData, valibot(skinSchema)), {
		SPA: true,
		validators: valibot(skinSchema),
		resetForm: false,
		onUpdate: async ({ form }) => {
			statusMessage = null;
			statusMessage = "checking if form is valid";
			if (!form.valid) return;

			uploading = true;
			let finalImages = [...form.data.preview_images];

			try {
				if (pendingFiles.length > 0) {
					statusMessage = "uploading images";
					const uploaded = await startUpload(pendingFiles);
					if (uploaded) {
						finalImages = [...finalImages, ...uploaded.map((f) => f.ufsUrl)];
					}
					// Clearing this triggers ImageUploadField to revoke blob URLs
					pendingFiles = [];
				}
			} finally {
				uploading = false;
			}

			statusMessage = skin ? "updating skin" : "creating skins";
			await fetch(skin ? `/api/skins/${skin._id}` : "/api/skins", {
				method: skin ? "PATCH" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...form.data, preview_images: finalImages })
			});
			statusMessage = "invalidating app:skins (refreshing ui)";
			await invalidate("app:skins");
			statusMessage = "resetting form";
			reset({ data: { ...form.data, preview_images: finalImages } });
			saved = true;
			setTimeout(() => (saved = false), 2000);
			statusMessage = "running onsave callback";
			save();
			statusMessage = null;
		}
	});

	const isDirty = $derived(($tainted && isTainted()) || pendingFiles.length > 0);

	async function handleDelete() {
		if (!skin) return;
		await fetch(`/api/skins/${skin._id}`, { method: "DELETE" });
		await invalidate("app:skins");
		deleteSkin();
	}
</script>

<div class="flex items-center justify-between">
	<span class="flex flex-col">
		<h2 class="text-lg font-medium">{skin ? "Editing Skin" : "New Skin"}</h2>
		{#if skin}<p class="text-xs font-normal">{skin.name}</p>{/if}
	</span>
	<span class="flex gap-2">
		{#if skin}
			<HoldButton
				variant="destructive"
				duration={1500}
				fillColor="bg-black/40"
				size="icon"
				onComplete={handleDelete}
			>
				<Icon name="trash" />
			</HoldButton>
		{/if}
		<Button
			form="skin-editor"
			type="submit"
			disabled={!isDirty || $submitting || uploading || $allErrors.length > 0}
		>
			{#if uploading}
				Uploading...
			{:else if $submitting}
				Saving...
			{:else if saved}
				Saved!
			{:else}
				{skin ? "Save changes" : "Create skin"}
			{/if}
		</Button>
	</span>
</div>

<form id="skin-editor" use:enhance class="flex flex-1 flex-col gap-2">
	<div class="flex flex-col">
		<label for="name" class="text-sm">Name</label>
		<Input id="name" bind:value={$formData.name} />
		{#if $errors.name}<p class="text-sm text-destructive">{$errors.name[0]}</p>{/if}
	</div>

	<div class="flex flex-col">
		<label for="author" class="text-sm">Author</label>
		<Input id="author" bind:value={$formData.author} />
	</div>

	<div class="flex flex-col">
		<label for="url" class="text-sm">Download URL</label>
		<Input id="url" bind:value={$formData.download_url} />
		{#if $errors.download_url}<p class="text-sm text-destructive">{$errors.download_url[0]}</p>{/if}
	</div>

	<ImageUploadField
		existingImages={$formData.preview_images}
		onRemoveExisting={(i) =>
			($formData.preview_images = $formData.preview_images.filter((_, j) => j !== i))}
		bind:pendingFiles
	/>

	<p class="text-sm text-text-muted">{statusMessage}</p>
</form>
