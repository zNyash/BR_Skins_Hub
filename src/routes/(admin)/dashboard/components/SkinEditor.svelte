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

	type Props = {
		skin?: Doc<"skins"> | null;
		onsave?: () => void;
	};

	let { skin = null, onsave = () => {} }: Props = $props();

	const save = untrack(() => onsave);

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
		onUpdate: async ({ form }) => {
			if (!form.valid) return;
			await fetch(skin ? `/api/skins/${skin._id}` : "/api/skins", {
				method: skin ? "PATCH" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form.data)
			});
			await invalidate("app:skins");
			reset({ data: form.data });
			saved = true;
			setTimeout(() => (saved = false), 2000);
			save();
		}
	});
</script>

<div class="flex items-center justify-between">
	<span class="flex flex-col">
		<h2 class="text-lg font-medium">Editing Skin</h2>
		<p class="text-xs font-normal">{skin?.name}</p>
	</span>
	<Button variant="destructive">
		<Icon name="trash" />
		<p>Delete Skin</p>
	</Button>
</div>
<form use:enhance class="flex flex-1 flex-col gap-2">
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
		{#if $errors.download_url}<p class="text-sm text-destructive">
				{$errors.download_url[0]}
			</p>{/if}
	</div>
	<Button
		type="submit"
		disabled={!($tainted && isTainted()) || $submitting || $allErrors.length > 0}
	>
		{#if $submitting}
			<p>Saving...</p>
		{:else if saved}
			<p>Saved!</p>
		{:else}
			{skin ? "Save changes" : "Create skin"}
		{/if}
	</Button>
</form>
