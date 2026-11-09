<script lang="ts">
	import { unsaved } from "./unsaved.svelte";
</script>

{#if unsaved.dirty}
	<div
		role="status"
		class="absolute bottom-6 left-1/2 z-40 flex w-[min(640px,calc(100%-48px))] -translate-x-1/2 animate-in items-center gap-3 rounded-xl bg-layer-2 p-3 pl-5 shadow-lg slide-in-from-bottom-4"
		class:unsaved-shake={unsaved.shaking}
		class:ring-2={unsaved.shaking}
		class:ring-error={unsaved.shaking}
	>
		<p class="flex-1 text-sm">Careful — you have unsaved changes!</p>
		<button
			type="button"
			class="min-h-11 rounded-lg px-4 text-sm text-text-muted hover:bg-layer-3"
			disabled={unsaved.saving}
			onclick={() => unsaved.reset()}
		>
			Reset
		</button>
		<button
			type="button"
			class="min-h-11 rounded-lg bg-success px-4 text-sm font-medium text-on-success disabled:opacity-60"
			disabled={unsaved.saving}
			onclick={() => unsaved.save()}
		>
			Save changes
		</button>
	</div>
{/if}
