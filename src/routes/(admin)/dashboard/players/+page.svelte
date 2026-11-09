<script lang="ts">
	import { getContext } from "svelte";
	import EmptyState from "$comp/empty-state.svelte";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import type { PlayersContext } from "./+layout.svelte";

	const ctx = getContext<PlayersContext>("players-list");
</script>

<div class="flex h-full items-center justify-center rounded-xl bg-layer-1">
	<EmptyState icon="users" title="Select a player">
		{#snippet action()}
			<Button onclick={ctx.openCreator}>
				<Icon name="plus" />
				New
			</Button>
		{/snippet}
	</EmptyState>
</div>
