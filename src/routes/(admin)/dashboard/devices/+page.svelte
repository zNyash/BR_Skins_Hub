<script lang="ts">
	import { getContext } from "svelte";
	import EmptyState from "$comp/empty-state.svelte";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import type { DevicesContext } from "./+layout.svelte";

	const ctx = getContext<DevicesContext>("devices-list");
</script>

<div class="flex h-full items-center justify-center rounded-xl bg-layer-1">
	<EmptyState icon="cpu" title="Select a device">
		{#snippet action()}
			<Button onclick={ctx.openCreator}>
				<Icon name="plus" />
				New
			</Button>
		{/snippet}
	</EmptyState>
</div>
