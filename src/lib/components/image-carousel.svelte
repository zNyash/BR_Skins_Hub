<script lang="ts">
	import { resolve } from "$app/paths";
	import type { Doc } from "$convex/_generated/dataModel";
	import Button from "./ui/button/button.svelte";

	let { skin }: { skin: Doc<"skins"> } = $props();

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
</script>

<div class="relative aspect-video overflow-hidden radius-t-inherit">
	<div
		class="flex size-full radius-t-inherit transition-transform duration-300 ease-in-out"
		style="transform: translateX(-{currentIndex * 100}%);"
	>
		<a href={resolve("/(public)/skins/[skinId]", { skinId: skin._id })} class="contents">
			{#each skin.preview_images as image (image)}
				<img
					src={image}
					alt={skin.name}
					class="size-full cursor-pointer radius-inherit object-cover"
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
		<Button
			onclick={prev}
			class="absolute top-1/2 left-1 -translate-y-1/2"
			variant="secondary"
			size="icon"
		>
			<span class="icon-[lucide--chevron-left] size-6"></span>
		</Button>
		<Button
			onclick={next}
			class="absolute top-1/2 right-1 -translate-y-1/2"
			variant="secondary"
			size="icon"
		>
			<span class="icon-[lucide--chevron-right] size-6"></span>
		</Button>
	{/if}
</div>
