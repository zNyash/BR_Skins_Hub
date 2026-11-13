<script lang="ts">
	import Icon from "$comp/icon.svelte";
	import * as Select from "$comp/ui/select";
	import { DEVICE_TYPES, type DeviceType } from "$convex/validators";
	import { cn } from "$lib/utils";
	import { DEVICE_ICONS, DEVICE_LABELS } from "$lib/devices";

	let {
		value = $bindable(),
		id,
		disabled = false,
		class: className
	}: { value: DeviceType; id?: string; disabled?: boolean; class?: string } = $props();
</script>

<Select.Root type="single" bind:value {disabled}>
	<Select.Trigger
		{id}
		class={cn("w-full bg-layer-2 hover:bg-layer-3 data-[state=open]:bg-layer-3", className)}
	>
		<span class="flex items-center gap-2">
			<Icon name={DEVICE_ICONS[value]} class="size-4" />
			{DEVICE_LABELS[value].one}
		</span>
	</Select.Trigger>
	<Select.Content>
		{#each DEVICE_TYPES as type (type)}
			<Select.Item value={type}>
				<Icon name={DEVICE_ICONS[type]} class="size-4" />
				{DEVICE_LABELS[type].one}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
