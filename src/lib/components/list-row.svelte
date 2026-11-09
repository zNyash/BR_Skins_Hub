<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "$lib/utils";

	let {
		href,
		current = false,
		leading,
		children,
		trailing
	}: {
		href: string;
		current?: boolean;
		leading: Snippet;
		children: Snippet;
		trailing?: Snippet;
	} = $props();
</script>

<!-- Callers pass an href they already built with resolve(). -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->
<a
	{href}
	aria-current={current ? "true" : undefined}
	class={cn(
		"flex min-h-16 items-center gap-3 rounded-lg p-3 transition-colors duration-fast",
		current ? "bg-layer-3" : "bg-layer-1 hover:bg-layer-2"
	)}
>
	{@render leading()}
	<div class="min-w-0 flex-1">{@render children()}</div>
	{#if trailing}
		<div class="shrink-0 text-right text-caption text-text-muted tabular-nums">
			{@render trailing()}
		</div>
	{/if}
</a>
