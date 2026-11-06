<script lang="ts">
	import Icon from "$comp/icon.svelte";
	import { LINK_ICONS, linkTarget, type LinkType } from "$lib/links";

	let { type, value }: { type: LinkType; value: string } = $props();

	const target = $derived(linkTarget(type, value));
	let copied = $state(false);

	async function copy() {
		await navigator.clipboard.writeText(target.label);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	const classes =
		"flex min-h-9 items-center gap-2 rounded-lg border border-layer-2 bg-card py-1 pr-3 pl-2.5 text-sm transition-colors hover:bg-layer-2";
</script>

{#snippet content()}
	<Icon name={LINK_ICONS[type]} class="size-4 shrink-0 text-primary" />
	<span class="truncate">{copied ? "Copied" : target.label}</span>
{/snippet}

{#if type === "discord"}
	<button type="button" class={classes} title="Copy Discord username" onclick={copy}>
		{@render content()}
	</button>
{:else if target.href}
	<a href={target.href} target="_blank" rel="noopener noreferrer" class={classes}>
		{@render content()}
	</a>
{:else}
	<span class={classes}>{@render content()}</span>
{/if}
