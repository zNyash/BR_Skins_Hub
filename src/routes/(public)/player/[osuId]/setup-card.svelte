<script lang="ts">
	import type { Snippet } from "svelte";
	import Icon from "$comp/icon.svelte";
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
	const id = $props.id();
</script>

<article
	aria-labelledby={id}
	class={cn(
		"@container flex min-w-0 flex-col gap-3 rounded-xl bg-card px-4 py-4 sm:px-5",
		className
	)}
>
	<div class="flex flex-wrap items-center gap-2.5">
		<span
			class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"
		>
			<Icon name={icon} class="size-5" />
		</span>
		<h3 {id} class="text-base font-bold text-primary">{title}</h3>
		{#if mainInput}
			<span
				class="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground"
			>
				Main input
			</span>
		{/if}
		<div class="ml-auto flex items-center gap-2">
			{@render badge?.()}
			{#if canEdit}
				<button
					type="button"
					class="flex size-9 items-center justify-center rounded-lg text-text-muted hover:bg-layer-2 hover:text-foreground"
					aria-label="Edit {title.toLowerCase()}"
					title="Edit"
					onclick={onEdit}
				>
					<Icon name="pencil" class="size-4" />
				</button>
			{/if}
		</div>
	</div>
	{@render children()}
</article>
