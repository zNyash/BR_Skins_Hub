<script lang="ts">
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: TabsPrimitive.TriggerProps = $props();
</script>

<TabsPrimitive.Trigger
	bind:ref
	data-slot="tabs-trigger"
	class={cn(
		"relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-2 rounded-md px-3 text-body-strong whitespace-nowrap text-text-muted transition-colors duration-fast outline-none group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-color disabled:pointer-events-none disabled:opacity-50 data-active:text-text [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		"group-data-[variant=default]/tabs-list:data-active:bg-layer-3",
		"group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:px-0 group-data-[variant=line]/tabs-list:data-active:bg-transparent",
		"after:absolute after:bg-accent-color after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-0 group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
		className
	)}
	{...restProps}
/>
