<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: CommandPrimitive.ItemProps = $props();
</script>

<CommandPrimitive.Item
	bind:ref
	data-slot="command-item"
	class={cn(
		"group/command-item relative flex cursor-default items-center gap-3 rounded-md p-2 text-body outline-hidden select-none data-selected:bg-layer-3 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		"data-disabled:pointer-events-none data-disabled:opacity-50",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.Item>
