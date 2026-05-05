<script lang="ts">
	import Icon from "$comp/icon.svelte";
	import ImageCarousel from "$comp/image-carousel.svelte";
	import * as Popover from "$comp/ui/popover/index.js";
	import Separator from "$comp/ui/separator/separator.svelte";
	import type { Doc } from "$convex/_generated/dataModel";
	import { POPOVER_SETTINGS } from "$lib/constants";
	import Time from "svelte-time/Time.svelte";
	import Button from "./ui/button/button.svelte";

	let { skin }: { skin: Doc<"skins"> } = $props();

	let copied = $state(false);

	function copyLink() {
		navigator.clipboard.writeText(`${window.location.origin}/skins/${skin._id}`);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div
	class="flex flex-col items-center justify-center overflow-clip rounded-lg bg-card outline outline-transparent hover:outline-primary"
>
	<ImageCarousel {skin} />

	<div class="flex w-full flex-col p-1 px-2 pb-1">
		<!-- Skin Name -->
		<Popover.Root>
			<Popover.Trigger {...POPOVER_SETTINGS} class="w-fit text-start">
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
				onclick={copyLink}
				variant="navigation"
				size="icon-xs"
				class={copied
					? "bg-success/20 text-success hover:bg-success/20 hover:text-success"
					: "text-text-muted"}
			>
				<Icon name={copied ? "check" : "copy"} class="size-4" />
			</Button>
		</span>
	</div>
</div>
