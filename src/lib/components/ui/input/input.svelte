<script lang="ts">
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	type InputType = Exclude<HTMLInputTypeAttribute, "file">;

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, "type"> &
			({ type: "file"; files?: FileList } | { type?: InputType; files?: undefined })
	>;

	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		files = $bindable(),
		class: className,
		"data-slot": dataSlot = "input",
		...restProps
	}: Props = $props();
</script>

{#if type === "file"}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			"h-11 w-full min-w-0 rounded-md border-transparent bg-layer-1 px-3 py-1 text-body transition-colors duration-fast outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-body-strong file:text-text placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-accent-color disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:outline-2 aria-invalid:outline-destructive min-[900px]:h-9",
			className
		)}
		type="file"
		bind:files
		bind:value
		{...restProps}
	/>
{:else}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			"h-11 w-full min-w-0 rounded-md border-transparent bg-layer-1 px-3 py-1 text-body transition-colors duration-fast outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-body-strong file:text-text placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-accent-color disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:outline-2 aria-invalid:outline-destructive min-[900px]:h-9",
			className
		)}
		{type}
		bind:value
		{...restProps}
	/>
{/if}
