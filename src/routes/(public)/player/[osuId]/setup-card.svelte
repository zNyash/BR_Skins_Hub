<script lang="ts">
	import type { Snippet } from "svelte";
	import Card from "$comp/card.svelte";
	import Icon from "$comp/icon.svelte";
	import { Badge } from "$comp/ui/badge";
	import Button from "$comp/ui/button/button.svelte";
	import { cn } from "$lib/utils";

	let {
		title,
		icon,
		mainInput = false,
		canEdit,
		onEdit,
		badge,
		class: className = "",
		children
	}: {
		title: string;
		icon: string;
		mainInput?: boolean;
		canEdit: boolean;
		onEdit: () => void;
		badge?: Snippet;
		class?: string;
		children: Snippet;
	} = $props();
</script>

<Card {title} {icon} class={cn("@container min-w-0", className)}>
	{#snippet trailing()}
		<!-- Wraps on narrow cards, where the keyboard's two badges don't fit next to the title. -->
		<div class="flex flex-wrap items-center justify-end gap-2">
			{#if mainInput}
				<Badge variant="accent">Main input</Badge>
			{/if}
			{@render badge?.()}
			{#if canEdit}
				<Button
					variant="ghost"
					size="icon"
					aria-label="Edit {title.toLowerCase()}"
					title="Edit"
					onclick={onEdit}
				>
					<Icon name="pencil" />
				</Button>
			{/if}
		</div>
	{/snippet}
	{@render children()}
</Card>
