<script lang="ts">
	import type { Snippet } from "svelte";
	import type { Attachment } from "svelte/attachments";
	import { cn } from "$lib/utils";
	import Popover from "./popover.svelte";

	/**
	 * One line of text that never wraps. When it doesn't fit, it fades out at the right edge and
	 * hovering (or tapping) it shows the full text. `children` render after the text (e.g. a unit).
	 */
	let {
		text,
		class: className = "",
		children
	}: { text: string; class?: string; children?: Snippet } = $props();

	let overflowing = $state(false);

	const watch: Attachment<HTMLElement> = (node) => {
		void text; // re-measure when the text changes
		const measure = () => (overflowing = node.scrollWidth > node.clientWidth + 1);
		const observer = new ResizeObserver(measure);
		observer.observe(node);
		measure();
		return () => observer.disconnect();
	};
</script>

<Popover hover={overflowing} pin={overflowing} class="max-w-80 px-2 py-1">
	{#snippet trigger(props)}
		<span
			{...props}
			{...overflowing ? { role: "button", tabindex: 0 } : {}}
			{@attach watch}
			class={cn(
				"block min-w-0 overflow-hidden whitespace-nowrap",
				overflowing && "cursor-default fade",
				className
			)}
		>
			{text}{@render children?.()}
		</span>
	{/snippet}
	{text}
</Popover>
