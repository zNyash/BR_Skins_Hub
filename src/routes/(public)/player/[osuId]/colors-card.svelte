<script lang="ts">
	import { toast } from "svelte-sonner";
	import HuePicker from "$comp/hue-picker.svelte";
	import { huePreview } from "$lib/hue-preview.svelte";
	import type { PlayerWithSkins } from "$lib/types";
	import { errorMessage, saveProfile } from "./save-profile";
	import SettingsCard from "./settings-card.svelte";

	let { player }: { player: PlayerWithSkins } = $props();

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

	// The slider fires `change` on every arrow-key step, so a pick waits until the value has
	// settled. The preview (set on `input`) still follows every step.
	const SLIDER_SAVE_DELAY_MS = 500;
	let saveTimer: ReturnType<typeof setTimeout> | undefined;

	function saveSoon(hue: number) {
		clearTimeout(saveTimer);
		huePreview.value = hue;
		saveTimer = setTimeout(() => save(hue), SLIDER_SAVE_DELAY_MS);
	}
</script>

<SettingsCard title="Colors">
	<HuePicker value={shown} onPreview={(hue) => (huePreview.value = hue)} onPick={saveSoon} />
	<p class="text-xs text-text-muted">
		Saved as soon as you pick one. Visitors see your page in this color.
	</p>
</SettingsCard>
