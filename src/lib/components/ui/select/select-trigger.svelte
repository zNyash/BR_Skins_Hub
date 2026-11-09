<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";
	import { cn, type WithoutChild } from "$lib/utils.js";
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";

	let {
		ref = $bindable(null),
		class: className,
		children,
		size = "default",
		...restProps
	}: WithoutChild<SelectPrimitive.TriggerProps> & {
		size?: "sm" | "default";
	} = $props();
</script>

<SelectPrimitive.Trigger
	bind:ref
	data-slot="select-trigger"
	data-size={size}
	class={cn(
		"flex w-fit items-center justify-between gap-2 rounded-md bg-layer-1 px-3 pr-2 text-body whitespace-nowrap transition-colors duration-fast outline-none hover:bg-layer-2 focus-visible:outline-2 focus-visible:outline-accent-color disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:outline-2 aria-invalid:outline-destructive data-placeholder:text-text-muted data-[size=default]:h-11 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 data-[state=open]:bg-layer-2 data-[size=default]:min-[900px]:h-9 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<ChevronDownIcon class="pointer-events-none size-4 text-text-muted" />
</SelectPrimitive.Trigger>
