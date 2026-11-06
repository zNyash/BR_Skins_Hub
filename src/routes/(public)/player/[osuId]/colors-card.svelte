<script lang="ts">
	import { toast } from "svelte-sonner";
	import { Input } from "$comp/ui/input";
	import { parseHue } from "$lib/hue";
	import { huePreview } from "$lib/hue-preview.svelte";
	import type { PlayerWithSkins } from "$lib/types";
	import { cn } from "$lib/utils";
	import { errorMessage, saveProfile } from "./save-profile";
	import SettingsCard from "./settings-card.svelte";

	let { player }: { player: PlayerWithSkins } = $props();

	const SWATCHES = [0, 25, 60, 95, 140, 190, 230, 265, 300, 330];
	const TRACK = `linear-gradient(to right, ${[0, 60, 120, 180, 240, 300, 360]
		.map((h) => `oklch(70% 0.15 ${h})`)
		.join(", ")})`;

	// What the controls show: the color being tried, else the saved one.
	const shown = $derived(huePreview.value ?? player.hue ?? 0);

	async function save(hue: number) {
		huePreview.value = hue;
		try {
			await saveProfile(player.osu_id, { hue });
		} catch (err) {
			toast.error(errorMessage(err, "Couldn't save your color"));
		} finally {
			// After the reload the saved color comes from the player data; on failure it snaps back.
			huePreview.value = null;
		}
	}

	function fromSlider(event: Event) {
		huePreview.value = Number((event.currentTarget as HTMLInputElement).value);
	}

	function fromNumber(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const hue = parseHue(input.value);
		if (hue === null) input.value = String(shown);
		else save(hue);
	}
</script>

<SettingsCard title="Colors">
	<span class="text-sm">Profile color</span>
	<div role="radiogroup" aria-label="Profile color" class="flex flex-wrap gap-2">
		{#each SWATCHES as hue (hue)}
			<button
				type="button"
				role="radio"
				aria-checked={shown === hue}
				aria-label="Hue {hue}"
				class={cn(
					"size-8 rounded-full transition-shadow",
					shown === hue && "shadow-[0_0_0_2px_var(--card),0_0_0_4px_var(--text)]"
				)}
				style:background="oklch(70% 0.15 {hue})"
				onclick={() => save(hue)}
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
			value={shown}
			class="h-3 min-w-0 flex-1 cursor-pointer appearance-none rounded-full accent-foreground"
			style:background={TRACK}
			oninput={fromSlider}
			onchange={(e) => save(Number(e.currentTarget.value))}
		/>
		<Input
			type="number"
			min="0"
			max="360"
			aria-label="Hue value"
			class="w-20"
			value={shown}
			onchange={fromNumber}
		/>
	</div>
	<p class="text-xs text-text-muted">
		Saved as soon as you pick one. Visitors see your page in this color.
	</p>
</SettingsCard>
