<script lang="ts">
	import { getContext } from "svelte";
	import Icon from "$comp/icon.svelte";
	import type { SkinsContext } from "./+layout.svelte";

	const ctx = getContext<SkinsContext>("skins-list");
</script>

<div
	class="flex h-full flex-col items-center justify-center gap-4 rounded-2xl bg-layer-1 p-4 text-center"
>
	<p class="text-text-muted">Select a skin</p>
	<button
		type="button"
		class="flex h-11 items-center gap-2 rounded-lg bg-accent-color px-4 text-sm font-medium text-on-accent min-[900px]:h-9"
		onclick={ctx.openCreator}
	>
		<Icon name="plus" class="size-4" />
		New
	</button>
</div>
