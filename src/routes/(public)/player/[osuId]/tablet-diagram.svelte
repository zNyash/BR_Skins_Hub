<script lang="ts">
	import Popover from "$comp/popover.svelte";
	import { diagramRatio, tabletDiagram, type Setup } from "$lib/setup";
	import { cn } from "$lib/utils";

	/**
	 * Fills whatever slot it's given and never decides the card's height: the drawing keeps the
	 * tablet's ratio and fits the slot in both directions (container query units).
	 */
	let { tablet, class: className = "" }: { tablet: NonNullable<Setup["tablet"]>; class?: string } =
		$props();

	const box = $derived(tabletDiagram(tablet));
	const ratio = $derived(diagramRatio(tablet));
	const hasArea = $derived(Boolean(tablet.area_w && tablet.area_h));
	const hasCentre = $derived(tablet.center_x !== undefined && tablet.center_y !== undefined);
	const size = $derived(`${tablet.full_w} × ${tablet.full_h} mm`);
	const caption = $derived(
		hasCentre
			? `Centre at X ${tablet.center_x} · Y ${tablet.center_y} mm, on a ${size} tablet`
			: `Centred on a ${size} tablet`
	);
	const fitStyle = $derived(`aspect-ratio: ${ratio}; width: min(100cqw, calc(100cqh * ${ratio}))`);
</script>

<div class={cn("flex min-h-0 flex-col gap-3 rounded-md bg-layer-2 p-3", className)}>
	{#if box}
		<div class="[container-type:size] flex min-h-0 flex-1 items-center justify-center">
			<Popover class="px-2 py-1">
				{#snippet trigger(props)}
					<div
						{...props}
						role="img"
						aria-label="Active area of {tablet.area_w} by {tablet.area_h} mm. {caption}"
						class="relative rounded-md border border-layer-5 bg-layer-3"
						style={fitStyle}
					>
						<div
							class="absolute rounded-sm border-2 border-accent-color bg-accent-color/15"
							style:left="{box.left}%"
							style:top="{box.top}%"
							style:width="{box.width}%"
							style:height="{box.height}%"
							style:rotate={tablet.rotation ? `${tablet.rotation}deg` : undefined}
						></div>
					</div>
				{/snippet}
				{caption}
			</Popover>
		</div>
	{:else if hasArea}
		<!-- No full size: the area alone, unrotated so it can't spill out of the slot. -->
		<div class="[container-type:size] flex min-h-0 flex-1 items-center justify-center">
			<div
				role="img"
				aria-label="Active area of {tablet.area_w} by {tablet.area_h} mm"
				class="rounded-sm border-2 border-accent-color bg-accent-color/15"
				style={fitStyle}
			></div>
		</div>
		<span class="text-center text-caption trim text-text-muted">Full tablet size not set</span>
	{:else}
		<span class="m-auto text-value-lg text-text-muted">–</span>
	{/if}
</div>
