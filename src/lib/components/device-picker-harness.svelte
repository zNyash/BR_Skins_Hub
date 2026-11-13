<script lang="ts">
	// Test-only: a tablet picker over two devices that shows the bound query.
	import type { Id } from "$convex/_generated/dataModel";
	import type { PickerDevice } from "$lib/device-catalog";
	import DevicePicker from "./device-picker.svelte";

	const devices: PickerDevice[] = [
		{ _id: "a" as Id<"devices">, name: "Wacom CTL-472" },
		{ _id: "b" as Id<"devices">, name: "Huion H420X" }
	];
	let query = $state("");
	let picked = $state("");
</script>

<DevicePicker
	type="tablet"
	{devices}
	bind:query
	onPick={(d) => (picked = d.name)}
	onKeepTyped={() => {}}
/>
<p data-testid="query">{query}</p>
<p data-testid="picked">{picked}</p>
