<script lang="ts">
	import { toast } from "svelte-sonner";
	import Icon from "$comp/icon.svelte";
	import { LINK_ICONS, linkTarget, type LinkType } from "$lib/links";
	import { cn } from "$lib/utils";

	let { type, value }: { type: LinkType; value: string } = $props();

	const target = $derived(linkTarget(type, value));

	// Discord copies the username instead of linking. "copied"/"failed" show briefly, then reset.
	let copyState = $state<"idle" | "copied" | "failed">("idle");
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		clearTimeout(resetTimer);
		try {
			await navigator.clipboard.writeText(target.label);
			copyState = "copied";
		} catch {
			copyState = "failed";
			toast.error("Couldn't copy the Discord username", {
				description: "Your browser blocked clipboard access. Check its permissions for this site."
			});
		}
		resetTimer = setTimeout(() => (copyState = "idle"), 2000);
	}

	const classes =
		"flex h-11 items-center gap-2 rounded-md bg-layer-1 px-3 text-body transition-colors duration-fast hover:bg-layer-2 focus-visible:outline-2 focus-visible:outline-accent-color min-[900px]:h-9";
</script>

{#snippet content(icon: string, label: string, iconClass = "text-accent-color")}
	<Icon name={icon} class={cn("size-4 shrink-0", iconClass)} />
	<span class="truncate">{label}</span>
{/snippet}

{#if type === "discord"}
	<button
		type="button"
		class={cn(classes, copyState === "failed" && "bg-error/15 hover:bg-error/20")}
		title="Copy Discord username"
		onclick={copy}
	>
		{#if copyState === "failed"}
			{@render content("circle-alert", "Couldn't copy", "text-error")}
		{:else}
			{@render content(LINK_ICONS.discord, copyState === "copied" ? "Copied" : target.label)}
		{/if}
	</button>
{:else if target.href}
	<!-- External profile link; resolve() is only for routes in this app. -->
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a href={target.href} target="_blank" rel="noopener noreferrer" class={classes}>
		{@render content(LINK_ICONS[type], target.label)}
	</a>
{:else}
	<span class={classes}>{@render content(LINK_ICONS[type], target.label)}</span>
{/if}
