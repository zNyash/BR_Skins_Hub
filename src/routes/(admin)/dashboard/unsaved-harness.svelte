<script lang="ts">
	// Test-only: registers an editor whose dirty flag and callbacks the test controls.
	import { registerEditor } from "./unsaved.svelte";
	import UnsavedBar from "./unsaved-bar.svelte";

	let {
		save,
		reset = () => {},
		dirty = true
	}: { save: () => Promise<void>; reset?: () => void; dirty?: boolean } = $props();

	registerEditor({ isDirty: () => dirty, reset: () => reset(), save: () => save() });
</script>

<UnsavedBar />
