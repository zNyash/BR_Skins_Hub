<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const badgeVariants = tv({
		base: "h-6 gap-1 rounded-full px-2 text-xs font-semibold transition-colors duration-fast has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 [&>svg]:size-3! group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap outline-none focus-visible:outline-2 focus-visible:outline-accent-color [&>svg]:pointer-events-none",
		variants: {
			variant: {
				accent: "bg-accent-color text-on-accent",
				success: "bg-success text-on-success",
				warning: "bg-warning text-on-warning",
				soft: "bg-layer-2 text-text-muted",
				image: "rounded-sm bg-overlay text-text"
			}
		},
		defaultVariants: {
			variant: "accent"
		}
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAnchorAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = "accent",
		children,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		variant?: BadgeVariant;
	} = $props();
</script>

<svelte:element
	this={href ? "a" : "span"}
	bind:this={ref}
	data-slot="badge"
	{href}
	class={cn(badgeVariants({ variant }), className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
