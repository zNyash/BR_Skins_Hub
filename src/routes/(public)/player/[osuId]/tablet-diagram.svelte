<script lang="ts">
	import { tabletDiagram, type Setup } from "$lib/setup";

	let { tablet }: { tablet: NonNullable<Setup["tablet"]> } = $props();

	const box = $derived(tabletDiagram(tablet));
	const hasCentre = $derived(tablet.center_x !== undefined && tablet.center_y !== undefined);
	const size = $derived(`${tablet.full_w} × ${tablet.full_h} mm`);
	const caption = $derived(
		hasCentre
			? `Centre at X ${tablet.center_x} · Y ${tablet.center_y} mm, on a ${size} tablet`
			: `Centred on a ${size} tablet`
	);
</script>

{#if box}
	<div class="flex flex-col justify-center gap-2 rounded-lg bg-layer-2 px-3.5 py-3">
		<span class="text-xs text-text-muted">Position on the tablet</span>
		<div
			role="img"
			aria-label="Active area of {tablet.area_w} by {tablet.area_h} mm. {caption}"
			class="relative w-full self-center rounded-md border border-layer-5 bg-card"
			style:aspect-ratio="{tablet.full_w} / {tablet.full_h}"
		>
			<div
				class="absolute rounded-sm border-2 border-primary bg-primary/15"
				style:left="{box.left}%"
				style:top="{box.top}%"
				style:width="{box.width}%"
				style:height="{box.height}%"
			></div>
		</div>
		<span class="text-xs text-text-muted">{caption}</span>
	</div>
{/if}
