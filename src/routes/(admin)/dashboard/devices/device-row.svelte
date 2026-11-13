<script lang="ts">
	import Icon from "$comp/icon.svelte";
	import ListRow from "$comp/list-row.svelte";
	import { Badge } from "$comp/ui/badge";
	import type { Device } from "$lib/types";
	import { DEVICE_ICONS, DEVICE_LABELS } from "$lib/devices";
	import { formatArea } from "../derive";

	let { device, href, current }: { device: Device; href: string; current: boolean } = $props();

	const detail = $derived(
		(device.type === "tablet" && formatArea(device)) || DEVICE_LABELS[device.type].one
	);
</script>

<ListRow {href} {current}>
	{#snippet leading()}
		<div
			class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-layer-3 text-text-muted"
		>
			{#if device.image_url}
				<img src={device.image_url} alt="" class="size-full object-cover" />
			{:else}
				<Icon name={DEVICE_ICONS[device.type]} class="size-5" />
			{/if}
		</div>
	{/snippet}
	<div class="flex flex-col gap-1">
		<p class="truncate text-body-strong">{device.name}</p>
		<p class="truncate text-caption text-text-muted">{detail}</p>
	</div>
	{#snippet trailing()}
		{#if device.otd_path}
			<Badge variant="soft">OTD</Badge>
		{/if}
	{/snippet}
</ListRow>
