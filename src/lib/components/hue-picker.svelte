<script lang="ts">
	import { Input } from "$comp/ui/input";
	import { parseHue } from "$lib/hue";
	import { cn } from "$lib/utils";

	let {
		value,
		onPreview,
		onPick,
		onSlide,
		label = "Profile color"
	}: {
		value: number;
		onPreview?: (hue: number) => void;
		onPick: (hue: number) => void;
		// Slider `change` (fires on every arrow-key step); falls back to `onPick`.
		onSlide?: (hue: number) => void;
		label?: string;
	} = $props();

	const SWATCHES = [0, 25, 60, 95, 140, 190, 230, 265, 300, 330];
	const TRACK = `linear-gradient(to right, ${[0, 60, 120, 180, 240, 300, 360]
		.map((h) => `oklch(70% 0.15 ${h})`)
		.join(", ")})`;

	function fromNumber(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const hue = parseHue(input.value);
		// Show what's actually used (999 → 360), even when it equals the current color.
		input.value = String(hue ?? value);
		if (hue !== null && hue !== value) onPick(hue);
	}
</script>

<span class="text-label">{label}</span>
<div role="radiogroup" aria-label={label} class="flex flex-wrap gap-2">
	{#each SWATCHES as hue (hue)}
		<button
			type="button"
			role="radio"
			aria-checked={value === hue}
			aria-label="Hue {hue}"
			class={cn(
				"size-11 rounded-full transition-shadow min-[900px]:size-8",
				value === hue && "shadow-[0_0_0_2px_var(--layer-1),0_0_0_4px_var(--text)]"
			)}
			style:background="oklch(70% 0.15 {hue})"
			onclick={() => onPick(hue)}
		></button>
	{/each}
</div>
<div class="flex items-center gap-3">
	<input
		type="range"
		min="0"
		max="360"
		step="1"
		aria-label="Hue"
		{value}
		class="h-3 min-w-0 flex-1 cursor-pointer appearance-none rounded-full accent-accent-color"
		style:background={TRACK}
		oninput={(e) => onPreview?.(Number(e.currentTarget.value))}
		onchange={(e) => (onSlide ?? onPick)(Number(e.currentTarget.value))}
	/>
	<Input
		type="number"
		min="0"
		max="360"
		aria-label="Hue value"
		class="h-11 w-20 bg-layer-2 min-[900px]:h-9"
		{value}
		onchange={fromNumber}
	/>
</div>
