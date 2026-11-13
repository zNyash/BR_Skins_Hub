<script lang="ts">
	import { untrack } from "svelte";
	import { toast } from "svelte-sonner";
	import { invalidate } from "$app/navigation";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import * as Dialog from "$comp/ui/dialog";
	import { Input } from "$comp/ui/input";
	import type { Id } from "$convex/_generated/dataModel";
	import type { DeviceType } from "$convex/validators";
	import { request } from "$lib/api";
	import TypeSelect from "../devices/type-select.svelte";

	type Props = {
		open: boolean;
		onCreated: (deviceId: Id<"devices">) => void;
		/** Fills the form on open instead of the blank defaults, e.g. from a setup group. */
		initial?: { name: string; type: DeviceType };
	};

	let { open = $bindable(), onCreated, initial }: Props = $props();

	let name = $state("");
	let type = $state<DeviceType>("tablet");
	let isCreating = $state(false);

	const nameValid = $derived(name.trim().length > 0);

	// Each opening starts fresh, whether from a trigger or from a bound `open`.
	$effect.pre(() => {
		if (open)
			untrack(() => {
				name = initial?.name ?? "";
				type = initial?.type ?? "tablet";
			});
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!nameValid || isCreating) return;

		isCreating = true;
		try {
			const { id } = await request<{ id: Id<"devices"> }>("/api/devices", {
				method: "POST",
				body: { name: name.trim(), type }
			});
			toast.success("Device created");
			// Reload the list first, so the editor can find the new device.
			await invalidate("app:devices");
			open = false;
			onCreated(id);
		} catch (e) {
			// A duplicate name (409) lands here; the dialog stays open to fix it.
			toast.error((e as Error).message);
		} finally {
			isCreating = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="bg-layer-1 sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>New device</Dialog.Title>
			<Dialog.Description>Size and image can be added in the editor right after.</Dialog.Description
			>
		</Dialog.Header>

		<form id="device-creator-form" class="grid grid-cols-2 gap-3" onsubmit={handleSubmit}>
			<div class="flex flex-col gap-2">
				<label for="create_device_name" class="text-label">Name</label>
				<Input id="create_device_name" class="bg-layer-2" autocomplete="off" bind:value={name} />
			</div>
			<div class="flex flex-col gap-2">
				<label for="create_device_type" class="text-label">Type</label>
				<TypeSelect id="create_device_type" bind:value={type} />
			</div>
		</form>

		<Dialog.Footer>
			<Dialog.Close>
				{#snippet child({ props })}
					<Button {...props} type="button" variant="secondary">Cancel</Button>
				{/snippet}
			</Dialog.Close>
			<Button form="device-creator-form" type="submit" disabled={!nameValid || isCreating}>
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
