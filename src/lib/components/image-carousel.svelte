<script lang="ts">
	import { resolve } from "$app/paths";
	import type { Doc } from "$convex/_generated/dataModel";
	import Icon from "./icon.svelte";
	import Button from "./ui/button/button.svelte";

	let {
		skin,
		linked = true,
		radius = "top"
	}: {
		skin: Doc<"skins">;
		linked?: boolean;
		radius?: "top" | "bottom" | "left" | "right" | "full" | "none";
	} = $props();

	let currentIndex = $state(0);
	let totalImages = $derived(skin.preview_images.length);
	let isMoreThanOne = $derived(skin.preview_images.length > 1);

	const prev = () => {
		if (currentIndex > 0) {
			currentIndex = Math.max(0, currentIndex - 1);
		} else {
			currentIndex = totalImages - 1;
		}
	};

	const next = () => {
		if (currentIndex < totalImages - 1) {
			currentIndex = Math.min(totalImages - 1, currentIndex + 1);
		} else {
			currentIndex = 0;
		}
	};

	const RADIUS_MAP: Record<string, string> = {
		top: "radius-t-inherit",
		bottom: "radius-b-inherit",
		left: "radius-l-inherit",
		right: "radius-r-inherit",
		full: "radius-inherit",
		none: ""
	};
	let radiusClass = $derived(RADIUS_MAP[radius] ?? "radius-t-inherit");
</script>

<div class="relative aspect-video overflow-hidden {radiusClass}">
	<div
		class="flex size-full radius-t-inherit transition-transform duration-300 ease-in-out"
		style="transform: translateX(-{currentIndex * 100}%);"
	>
		<a
			href={linked ? resolve("/(public)/skins/[skinId]", { skinId: skin._id }) : undefined}
			class="contents"
		>
			{#each skin.preview_images as image (image)}
				<img
					src={image}
					alt={skin.name}
					class="size-full {linked ? 'cursor-pointer' : ''} radius-inherit object-cover"
				/>
			{/each}
		</a>
	</div>

	{#if isMoreThanOne}
		<!-- Indicators -->
		<div class="absolute bottom-0 left-1/2 flex w-full -translate-x-1/2">
			{#each skin.preview_images as image, i (image)}
				<button
					class="group/indicator flex h-3 w-full cursor-pointer items-end justify-center"
					aria-label="Go to slide {i + 1}"
					onclick={() => (currentIndex = i)}
				>
					<div
						class="flex h-0.5 w-full items-end justify-center bg-background duration-100 group-hover/indicator:h-3 group-hover/indicator:bg-popover/50"
					>
						<div
							class={`h-0.5 rounded-full transition-discrete duration-300 ${i === currentIndex ? "w-full bg-primary" : "w-1"}`}
						></div>
					</div>
				</button>
			{/each}
		</div>

		<!-- Buttons -->
		<span class="absolute top-1/2 left-1 -translate-y-1/2">
			<Button onclick={prev} variant="secondary" size="icon">
				<Icon name="chevron-left" class="size-6" />
			</Button>
		</span>
		<span class="absolute top-1/2 right-1 -translate-y-1/2">
			<Button onclick={next} variant="secondary" size="icon">
				<Icon name="chevron-right" class="size-6" />
			</Button>
		</span>
	{/if}
</div>
