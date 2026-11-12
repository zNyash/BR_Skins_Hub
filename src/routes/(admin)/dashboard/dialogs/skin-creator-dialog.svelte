<script lang="ts">
	import { untrack } from "svelte";
	import { toast } from "svelte-sonner";
	import { invalidate } from "$app/navigation";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import * as Dialog from "$comp/ui/dialog";
	import { Input } from "$comp/ui/input";
	import type { Id } from "$convex/_generated/dataModel";
	import { request } from "$lib/api";
	import { uploadOsk } from "$lib/drive-upload";
	import { readOsk } from "$lib/osk";
	import OskDropzone from "../osk-dropzone.svelte";

	type Props = {
		open: boolean;
		onCreated: (skinId: Id<"skins">) => void;
	};

	let { open = $bindable(), onCreated }: Props = $props();

	const emptyForm = { name: "", author: "", download_url: "" };
	let form = $state({ ...emptyForm });
	let isCreating = $state(false);
	/** A dropped .osk: uploaded to Google Drive on create, replacing the download URL field. */
	let osk = $state<File | null>(null);
	/** Upload progress in %, or null when not uploading. */
	let progress = $state<number | null>(null);

	const nameValid = $derived(form.name.trim().length > 0);
	const urlValid = $derived(URL.canParse(form.download_url.trim()));

	// Each opening starts fresh, whether from a trigger or from a bound `open`.
	$effect.pre(() => {
		if (open)
			untrack(() => {
				form = { ...emptyForm };
				osk = null;
				progress = null;
			});
	});

	async function fillFromOsk(file: File) {
		try {
			const info = await readOsk(file);
			form.name = info.name;
			form.author = info.author ?? "";
		} catch (e) {
			osk = null;
			toast.error((e as Error).message);
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!nameValid || (!osk && !urlValid) || isCreating) return;

		isCreating = true;

		try {
			const download_url = osk
				? await uploadOsk(osk, form.name.trim(), (p) => (progress = p))
				: form.download_url.trim();
			const { id } = await request<{ id: Id<"skins"> }>("/api/skins", {
				method: "POST",
				body: {
					name: form.name.trim(),
					author: form.author.trim() || undefined,
					download_url,
					preview_images: []
				}
			});
			toast.success("Skin created");

			// Reload the skin list first, so the editor can find the new skin.
			await invalidate("app:skins");

			open = false;
			onCreated(id);
		} catch (e) {
			toast.error((e as Error).message);
		} finally {
			isCreating = false;
			progress = null;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="bg-layer-1 sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>New skin</Dialog.Title>
			<Dialog.Description>
				Images, tags and players can be added in the editor right after.
			</Dialog.Description>
		</Dialog.Header>

		<form id="skin-creator-form" class="flex flex-col gap-3" onsubmit={handleSubmit}>
			<OskDropzone bind:file={osk} onpick={fillFromOsk} />

			<div class="grid grid-cols-2 gap-3">
				<div class="flex flex-col gap-2">
					<label for="create_skin_name" class="text-label">Name</label>
					<Input
						id="create_skin_name"
						class="bg-layer-2"
						autocomplete="off"
						bind:value={form.name}
					/>
				</div>
				<div class="flex flex-col gap-2">
					<label for="create_skin_author" class="text-label">
						Author <span class="text-caption text-text-muted">(optional)</span>
					</label>
					<Input
						id="create_skin_author"
						class="bg-layer-2"
						autocomplete="off"
						bind:value={form.author}
					/>
				</div>
			</div>

			{#if osk}
				<p class="text-caption text-text-muted">Uploads to Google Drive on create.</p>
			{:else}
				<div class="flex flex-col gap-2">
					<label for="create_skin_url" class="text-label">Download URL</label>
					<Input
						id="create_skin_url"
						class="bg-layer-2"
						placeholder="https://..."
						autocomplete="off"
						bind:value={form.download_url}
					/>
					{#if form.download_url && !urlValid}
						<p class="text-caption text-text-muted">That doesn't look like a valid URL.</p>
					{/if}
				</div>
			{/if}
		</form>

		<Dialog.Footer>
			<Dialog.Close>
				{#snippet child({ props })}
					<Button {...props} type="button" variant="secondary">Cancel</Button>
				{/snippet}
			</Dialog.Close>
			<Button
				form="skin-creator-form"
				type="submit"
				disabled={!nameValid || (!osk && !urlValid) || isCreating}
			>
				{#if isCreating}
					<Icon name="loader-circle" class="animate-spin" />
					{progress === null ? "Creating" : `Uploading ${progress}%`}
				{:else}
					<Icon name="plus" />
					Create
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
