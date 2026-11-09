<script lang="ts" module>
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { cn, tv, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
	import { type VariantProps } from "tailwind-variants";

	export const buttonVariants = tv({
		base: "rounded-md text-body-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-color aria-invalid:outline-2 aria-invalid:outline-destructive [&_svg:not([class*='size-'])]:size-4 group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-colors duration-fast outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		variants: {
			variant: {
				default: "bg-accent-color text-on-accent hover:brightness-110",
				secondary: "bg-layer-2 text-text hover:bg-layer-3",
				ghost: "bg-transparent text-text-muted hover:bg-layer-2 hover:text-text",
				destructive: "bg-destructive text-on-error hover:brightness-110",
				link: "text-accent-color underline-offset-4 hover:underline"
			},
			size: {
				default: "h-11 min-[900px]:h-9 gap-2 px-3",
				xs: "h-6 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
				sm: "h-8 gap-2 px-3",
				lg: "h-10 gap-2 px-4",
				icon: "size-11 min-[900px]:size-9",
				"icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
				"icon-sm": "size-8",
				"icon-lg": "size-10"
			}
		},
		defaultVariants: {
			variant: "default",
			size: "default"
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
	export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = "default",
		size = "default",
		ref = $bindable(null),
		href = undefined,
		type = "button",
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? "link" : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
