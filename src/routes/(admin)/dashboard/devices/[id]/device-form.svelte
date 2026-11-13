<script lang="ts">
	import { getContext } from "svelte";
	import { toast } from "svelte-sonner";
	import { goto, invalidate } from "$app/navigation";
	import Icon from "$comp/icon.svelte";
	import { Input } from "$comp/ui/input";
	import { request } from "$lib/api";
	import type { Device } from "$lib/types";
	import { DEVICE_ICONS, DEVICE_LABELS } from "$lib/devices";
	import { formatArea } from "../../derive";
	import DeleteDialog from "../../dialogs/delete-dialog.svelte";
	import EditorFrame from "../../editor-frame.svelte";
	import { registerEditor } from "../../unsaved.svelte";
	import type { DevicesContext } from "../+layout.svelte";
	import TypeSelect from "../type-select.svelte";
	import { createDeviceDraft } from "./device-draft.svelte";
	import ImageField from "./image-field.svelte";

	/** The editor for one existing device: frame, one form, and the draft it edits. */
	let { device }: { device: Device } = $props();

	const ctx = getContext<DevicesContext>("devices-list");

	const editor = createDeviceDraft(() => device);
	registerEditor(editor);
	const draft = $derived(editor.draft);

	let deleteOpen = $state(false);

	const imported = $derived(device.otd_path !== undefined);

	async function remove() {
		// Rejections are shown by the dialog, which then stays open.
		await request(`/api/devices/${device._id}`, { method: "DELETE" });
		toast.success("Device deleted");
		editor.reset();
		await goto(ctx.listHref());
		await invalidate("app:devices");
	}

	const field = "h-11 bg-layer-2 min-[900px]:h-9";
</script>

<EditorFrame
	title={device.name}
	subtitle={(device.type === "tablet" && formatArea(device)) || DEVICE_LABELS[device.type].one}
	menu={[
		imported
			? {
					label: "Delete…",
					onSelect: () => {},
					destructive: true,
					disabled: true,
					hint: "Imported tablets can't be deleted; the next sync would bring them back"
				}
			: { label: "Delete…", onSelect: () => (deleteOpen = true), destructive: true }
	]}
>
	{#snippet avatar()}
		<div
			class="flex size-10 items-center justify-center overflow-hidden rounded-md bg-layer-3 text-text-muted"
		>
			{#if device.image_url}
				<img src={device.image_url} alt="" class="size-full object-cover" />
			{:else}
				<Icon name={DEVICE_ICONS[device.type]} class="size-5" />
			{/if}
		</div>
	{/snippet}

	<div class="form-grid">
		<div class="full flex flex-col gap-2">
			<label for="device-name" class="text-label">Name</label>
			<Input id="device-name" class={field} bind:value={draft.name} />
		</div>

		<div class="full flex flex-col gap-2">
			<label for="device-type" class="text-label">Type</label>
			<TypeSelect id="device-type" class={field} bind:value={draft.type} disabled={imported} />
			{#if imported}
				<p class="text-caption text-text-muted">Imported tablets stay tablets.</p>
			{/if}
		</div>

		{#if draft.type === "tablet"}
			<div class="flex flex-col gap-2">
				<label for="device-width" class="text-label">Width (mm)</label>
				<Input id="device-width" inputmode="decimal" class={field} bind:value={draft.full_w} />
			</div>
			<div class="flex flex-col gap-2">
				<label for="device-height" class="text-label">Height (mm)</label>
				<Input id="device-height" inputmode="decimal" class={field} bind:value={draft.full_h} />
			</div>
		{/if}

		<div class="full">
			<ImageField bind:image={draft.image} deviceName={draft.name} />
		</div>

		{#if imported}
			<p class="full text-caption text-text-muted">
				Imported from OpenTabletDriver (<code>{device.otd_path}</code>). Edits stay until OTD
				changes this file.
			</p>
		{/if}
	</div>
</EditorFrame>

<DeleteDialog bind:open={deleteOpen} name={device.name} kind="device" onConfirm={remove} />

<style>
	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;
	}

	.full {
		grid-column: 1 / -1;
	}
</style>
