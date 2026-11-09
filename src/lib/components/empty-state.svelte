<script lang="ts">
	import type { Snippet } from "svelte";
	import Icon from "$comp/icon.svelte";

	let {
		icon,
		title,
		text,
		action
	}: { icon: string; title: string; text?: string; action?: Snippet } = $props();
</script>

<div class="flex flex-col items-center justify-center gap-3 p-8 text-center">
	<div class="flex size-10 items-center justify-center rounded-md bg-layer-2 text-text-muted">
		<Icon name={icon} class="size-5" />
	</div>
	<p class="text-body-strong">{title}</p>
	{#if text}
		<p class="text-caption text-text-muted">{text}</p>
	{/if}
	{@render action?.()}
</div>
