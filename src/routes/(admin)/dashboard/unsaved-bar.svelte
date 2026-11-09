<script lang="ts">
	import Button from "$comp/ui/button/button.svelte";
	import { unsaved } from "./unsaved.svelte";
</script>

{#if unsaved.dirty}
	<div
		role="status"
		class="absolute bottom-6 left-1/2 z-40 flex w-[min(640px,calc(100%-48px))] -translate-x-1/2 animate-in items-center gap-3 rounded-lg bg-layer-2 p-3 shadow-float slide-in-from-bottom-4"
		class:unsaved-shake={unsaved.shaking}
		class:ring-2={unsaved.shaking}
		class:ring-error={unsaved.shaking}
	>
		<p class="flex-1 text-body">Careful — you have unsaved changes!</p>
		<Button variant="ghost" disabled={unsaved.saving} onclick={() => unsaved.reset()}>Reset</Button>
		<Button disabled={unsaved.saving} onclick={() => unsaved.save()}>Save changes</Button>
	</div>
{/if}
