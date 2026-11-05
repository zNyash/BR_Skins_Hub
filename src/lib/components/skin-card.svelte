<script lang="ts">
	import Time from "svelte-time/Time.svelte";
	import Icon from "$comp/icon.svelte";
	import ImageCarousel from "$comp/image-carousel.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import * as Popover from "$comp/ui/popover";
	import Separator from "$comp/ui/separator/separator.svelte";
	import type { Doc } from "$convex/_generated/dataModel";
	import { POPOVER_SETTINGS } from "$lib/constants";
	import { useCopyLink } from "$lib/hooks/copy-link.svelte";
	import { cn } from "$lib/utils";

	/** `hidden`: the player hid this skin from their page; shown dimmed when revealed. */
	let { skin, hidden = false }: { skin: Doc<"skins">; hidden?: boolean } = $props();

	const clipboard = useCopyLink();
</script>

<div
	class="relative flex flex-col items-center justify-center overflow-clip rounded-lg bg-card outline outline-transparent hover:outline-primary"
>
	<div class={cn("w-full", hidden && "brightness-60 grayscale")}>
		<ImageCarousel {skin} />
	</div>

	{#if hidden}
		<span
			title="Hidden by the player"
			class="pointer-events-none absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-black/60 text-white"
		>
			<Icon name="eye-off" class="size-3.5" />
		</span>
	{/if}

	<div class={cn("flex w-full flex-col p-1 px-2 pb-1", hidden && "opacity-60")}>
		<!-- Skin Name -->
		<Popover.Root>
			<Popover.Trigger {...POPOVER_SETTINGS} class="w-fit max-w-full text-start">
				<p class="truncate">{skin.name}</p>
			</Popover.Trigger>
			<Popover.Content class="w-fit px-2 py-1 outline outline-border">
				<p>{skin.name}</p>
			</Popover.Content>
		</Popover.Root>

		<Separator class="mt-1 mb-2 bg-border" />

		<span class="flex items-center gap-1">
			<!-- Download Count -->
			<span class="flex gap-1">
				<Icon name="arrow-down-to-line" class="size-4 text-text-muted" />
				<p class="text-xs text-text-muted">{skin.download_count}</p>
			</span>

			<!-- Created At -->
			<Popover.Root>
				<Popover.Trigger {...POPOVER_SETTINGS} class="ml-auto text-start leading-0">
					<Time class="text-xs text-text-muted" live relative timestamp={skin._creationTime} />
				</Popover.Trigger>
				<Popover.Content class="w-fit px-2 py-1 outline outline-border">
					<p>{new Date(skin._creationTime).toLocaleString()}</p>
				</Popover.Content>
			</Popover.Root>

			<Button
				onclick={() => clipboard.copy(`${window.location.origin}/skins/${skin._id}`)}
				variant="navigation"
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
