<script lang="ts">
	import { resolve } from "$app/paths";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import type { Doc } from "$convex/_generated/dataModel";

	type Radius = "top" | "bottom" | "left" | "right" | "full" | "none";

	const RADIUS_CLASS: Record<Radius, string> = {
		top: "radius-t-inherit",
		bottom: "radius-b-inherit",
		left: "radius-l-inherit",
		right: "radius-r-inherit",
		full: "radius-inherit",
		none: ""
	};

	let {
		skin,
		linked = true,
		radius = "top"
	}: {
		skin: Doc<"skins">;
		linked?: boolean;
		radius?: Radius;
	} = $props();

	let currentIndex = $state(0);
	const total = $derived(skin.preview_images.length);

	// Both wrap around: previous from the first image goes to the last, and vice versa.
	const prev = () => (currentIndex = (currentIndex - 1 + total) % total);
	const next = () => (currentIndex = (currentIndex + 1) % total);
</script>

<div class="relative aspect-video overflow-hidden {RADIUS_CLASS[radius]}">
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
					class="size-full shrink-0 {linked ? 'cursor-pointer' : ''} radius-inherit object-cover"
				/>
			{/each}
		</a>
	</div>

	{#if total > 1}
		<!-- Indicators -->
		<div class="absolute bottom-0 left-1/2 flex w-full -translate-x-1/2">
			{#each skin.preview_images as image, i (image)}
				<button
					class="group/indicator flex h-3 w-full cursor-pointer items-end justify-center"
					aria-label="Go to slide {i + 1}"
					onclick={() => (currentIndex = i)}
				>
					<div
						class="flex h-0.5 w-full items-end justify-center bg-surface duration-100 group-hover/indicator:h-3 group-hover/indicator:bg-overlay"
					>
						<div
							class={`h-0.5 rounded-full transition-discrete duration-300 ${i === currentIndex ? "w-full bg-accent-color" : "w-1"}`}
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
