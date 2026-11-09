<script lang="ts">
	import Time from "svelte-time/Time.svelte";
	import Icon from "$comp/icon.svelte";
	import ImageCarousel from "$comp/image-carousel.svelte";
	import Popover from "$comp/popover.svelte";
	import Badge from "$comp/ui/badge/badge.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import Separator from "$comp/ui/separator/separator.svelte";
	import type { Doc } from "$convex/_generated/dataModel";
	import { useCopyLink } from "$lib/hooks/copy-link.svelte";
	import { cn } from "$lib/utils";

	/** `hidden`: the player hid this skin from their page; shown dimmed when revealed. */
	let { skin, hidden = false }: { skin: Doc<"skins">; hidden?: boolean } = $props();

	const clipboard = useCopyLink();
</script>

<div
	class="relative flex flex-col items-center justify-center overflow-clip rounded-lg bg-layer-1 duration-fast hover:bg-layer-2"
>
	<div class={cn("w-full", hidden && "brightness-60 grayscale")}>
		<ImageCarousel {skin} />
	</div>

	{#if hidden}
		<Badge
			variant="image"
			title="Hidden by the player"
			class="pointer-events-none absolute top-2 right-2"
		>
			<Icon name="eye-off" />
		</Badge>
	{/if}

	<div class={cn("flex w-full flex-col p-1 px-2 pb-1", hidden && "opacity-60")}>
		<!-- Skin Name -->
		<Popover class="px-2 py-1">
			{#snippet trigger(props)}
				<button {...props} type="button" class="w-fit max-w-full text-start">
					<p class="truncate">{skin.name}</p>
				</button>
			{/snippet}
			<p>{skin.name}</p>
		</Popover>

		<Separator class="mt-1 mb-2 bg-layer-5" />

		<span class="flex items-center gap-1">
			<!-- Download Count -->
			<span class="flex gap-1">
				<Icon name="arrow-down-to-line" class="size-4 text-text-muted" />
				<p class="text-xs text-text-muted">{skin.download_count}</p>
			</span>

			<!-- Created At -->
			<Popover class="px-2 py-1">
				{#snippet trigger(props)}
					<button {...props} type="button" class="ml-auto text-start leading-0">
						<Time class="text-xs text-text-muted" live relative timestamp={skin._creationTime} />
					</button>
				{/snippet}
				<p>{new Date(skin._creationTime).toLocaleString()}</p>
			</Popover>

			<Button
				onclick={() => clipboard.copy(`${window.location.origin}/skins/${skin._id}`)}
				variant="ghost"
				size="icon-xs"
				class={clipboard.copied
					? "bg-success/20 text-success hover:bg-success/20 hover:text-success"
					: "text-text-muted"}
			>
				<Icon name={clipboard.copied ? "check" : "copy"} class="size-4" />
			</Button>
		</span>
	</div>
</div>
