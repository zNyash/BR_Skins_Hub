<script lang="ts">
	import { untrack } from "svelte";
	import { toast } from "svelte-sonner";
	import { invalidate } from "$app/navigation";
	import DevicePicker from "$comp/device-picker.svelte";
	import * as Dialog from "$comp/ui/dialog";
	import { request } from "$lib/api";
	import type { PickerDevice } from "$lib/device-catalog";
	import { DEVICE_LABELS } from "$lib/devices";
	import type { Device } from "$lib/types";
	import type { LinkGroup } from "../setup-link-groups";

	type Props = {
		group: LinkGroup | null;
		devices: Device[];
		onClose: () => void;
	};

	let { group, devices, onClose }: Props = $props();

	let query = $state("");
	let isLinking = $state(false);

	const ofType = $derived(group ? devices.filter((d) => d.type === group.type) : []);
	const count = $derived(group?.cards.length ?? 0);

	// Each opening starts with an empty search.
	$effect.pre(() => {
		if (group)
			untrack(() => {
				query = "";
			});
	});

	async function link(device: PickerDevice) {
		if (!group || isLinking) return;
		isLinking = true;
		try {
			await request("/api/setup-links", {
				method: "POST",
				body: { device_id: device._id, cards: group.cards }
			});
			toast.success(`Linked ${count} ${count === 1 ? "setup" : "setups"} to ${device.name}`);
			await invalidate("app:players");
			onClose();
		} catch (e) {
			toast.error((e as Error).message);
		} finally {
			isLinking = false;
		}
	}
</script>

<Dialog.Root
	open={group !== null}
	onOpenChange={(next) => {
		if (!next) onClose();
	}}
>
	<Dialog.Content class="bg-layer-1 sm:max-w-md">
		{#if group}
			<Dialog.Header>
				<Dialog.Title>Link {group.label}</Dialog.Title>
				<Dialog.Description>
					{count}
					{count === 1 ? "setup" : "setups"} · {DEVICE_LABELS[group.type].one.toLowerCase()}
				</Dialog.Description>
			</Dialog.Header>

			<DevicePicker
				type={group.type}
				devices={ofType}
				bind:query
				inline={false}
				inputClass="bg-layer-2"
				pinned={group.closest?._id}
				onPick={link}
			/>
		{/if}
	</Dialog.Content>
</Dialog.Root>
