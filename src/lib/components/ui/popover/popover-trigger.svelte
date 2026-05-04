<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Popover as PopoverPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: PopoverPrimitive.TriggerProps = $props();
</script>

<PopoverPrimitive.Trigger
	bind:ref
	data-slot="popover-trigger"
	class={cn(
		"cursor-pointer border-0 bg-transparent p-0 text-left font-[inherit] data-[state=open]:outline data-[state=open]:outline-primary data-[state=open]:outline-dashed",
		className
	)}
	{...restProps}
/>
