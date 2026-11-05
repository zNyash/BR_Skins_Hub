<script lang="ts">
	import { toast } from "svelte-sonner";
	import { invalidate } from "$app/navigation";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import * as Dialog from "$comp/ui/dialog";
	import { Input } from "$comp/ui/input";
	import type { Id } from "$convex/_generated/dataModel";
	import { request } from "$lib/api";

	type Props = {
		open: boolean;
		onCreated: (skinId: Id<"skins">) => void;
	};

	let { open = $bindable(), onCreated }: Props = $props();

	const emptyForm = { name: "", author: "", download_url: "" };
	let form = $state({ ...emptyForm });
	let isCreating = $state(false);

	const nameValid = $derived(form.name.trim().length > 0);
	const urlValid = $derived(URL.canParse(form.download_url.trim()));

	function handleOpenChange(isOpen: boolean) {
		if (isOpen) {
			form = { ...emptyForm };
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!nameValid || !urlValid || isCreating) return;

		isCreating = true;

		try {
			const { id } = await request<{ id: Id<"skins"> }>("/api/skins", {
				method: "POST",
				body: {
					name: form.name.trim(),
					author: form.author.trim() || undefined,
					download_url: form.download_url.trim(),
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
		}
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Content class="bg-layer-1 sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>New skin</Dialog.Title>
			<Dialog.Description>
				Images, tags and players can be added in the editor right after.
			</Dialog.Description>
		</Dialog.Header>

		<form id="skin-creator-form" class="flex flex-col gap-3" onsubmit={handleSubmit}>
			<div class="grid grid-cols-2 gap-2">
				<div class="flex flex-col gap-1">
					<label for="create_skin_name" class="text-sm">Name</label>
					<Input id="create_skin_name" autocomplete="off" bind:value={form.name} />
				</div>
				<div class="flex flex-col gap-1">
					<label for="create_skin_author" class="text-sm">
						Author <span class="text-xs text-muted-foreground">(optional)</span>
					</label>
					<Input id="create_skin_author" autocomplete="off" bind:value={form.author} />
				</div>
			</div>

			<div class="flex flex-col gap-1">
				<label for="create_skin_url" class="text-sm">Download URL</label>
				<Input
					id="create_skin_url"
					placeholder="https://..."
					autocomplete="off"
					bind:value={form.download_url}
				/>
				{#if form.download_url && !urlValid}
					<p class="text-xs text-muted-foreground">That doesn't look like a valid URL.</p>
				{/if}
			</div>
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
				disabled={!nameValid || !urlValid || isCreating}
			>
				{#if isCreating}
					<Icon name="loader-circle" class="animate-spin" />
					Creating
				{:else}
					<Icon name="plus" />
					Create
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
