<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "$lib/utils";

	let {
		href,
		current = false,
		backgroundImage,
		leading,
		children,
		trailing,
		class: className
	}: {
		href: string;
		current?: boolean;
		backgroundImage?: string;
		leading: Snippet;
		children: Snippet;
		trailing?: Snippet;
		class?: string;
	} = $props();
</script>

<!-- Callers pass an href they already built with resolve(). -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->
<a
	{href}
	aria-current={current ? "true" : undefined}
	class={cn(
		"relative isolate flex min-h-14 items-center gap-2 overflow-hidden rounded-lg p-2 transition-colors duration-fast",
		current ? "bg-layer-3" : "bg-layer-1 hover:bg-layer-2",
		className
	)}
>
	{#if backgroundImage}
		<img
			src={backgroundImage}
			alt=""
			class="pointer-events-none absolute inset-0 size-full object-cover opacity-20"
		/>
	{/if}
	<div class="relative z-10 flex min-w-0 flex-1 items-center gap-2">
		{@render leading()}
		<div class="min-w-0 flex-1">{@render children()}</div>
	</div>
	{#if trailing}
		<div class="relative z-10 shrink-0 text-right text-caption text-text-muted tabular-nums">
			{@render trailing()}
		</div>
	{/if}
</a>
