<script lang="ts">
	import type { Snippet } from "svelte";
	import Icon from "$comp/icon.svelte";
	import { cn } from "$lib/utils";

	let {
		title,
		icon,
		level = 3,
		trailing,
		class: className,
		children
	}: {
		title?: string;
		icon?: string;
		level?: 2 | 3;
		trailing?: Snippet;
		class?: string;
		children: Snippet;
	} = $props();

	const titleId = $props.id();
</script>

<section
	aria-labelledby={title ? titleId : undefined}
	class={cn("flex flex-col gap-3 rounded-lg bg-layer-1 p-4", className)}
>
	{#if title || trailing}
		<div class="flex items-center gap-3">
			{#if icon}
				<div
					class="flex size-8 shrink-0 items-center justify-center rounded-md bg-layer-2 text-accent-color"
				>
					<Icon name={icon} class="size-4" />
				</div>
			{/if}
			{#if title}
				<svelte:element this={`h${level}`} id={titleId} class="text-card-title text-accent-color">
					{title}
				</svelte:element>
			{/if}
			{#if trailing}
				<div class="ml-auto flex items-center gap-2">{@render trailing()}</div>
			{/if}
		</div>
	{/if}
	{@render children()}
</section>
