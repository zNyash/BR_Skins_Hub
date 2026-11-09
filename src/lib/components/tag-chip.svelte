<script lang="ts">
	import type { Snippet } from "svelte";
	import Icon from "$comp/icon.svelte";

	let {
		children,
		onremove,
		removeLabel
	}: { children: Snippet; onremove?: () => void; removeLabel?: string } = $props();
</script>

<span class="inline-flex h-7 items-center gap-1 rounded-md bg-layer-2 px-2 text-caption text-text">
	{@render children()}
	{#if onremove}
		<button
			type="button"
			aria-label={removeLabel}
			onclick={onremove}
			class="flex size-11 items-center justify-center rounded-md transition-colors duration-fast hover:bg-layer-3 focus-visible:outline-2 focus-visible:outline-accent-color min-[900px]:size-5"
		>
			<Icon name="x" class="size-4" />
		</button>
	{/if}
</span>
