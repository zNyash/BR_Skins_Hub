<script lang="ts">
	import { getContext } from "svelte";
	import { page } from "$app/state";
	import EmptyState from "$comp/empty-state.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import type { PlayersContext } from "../+layout.svelte";
	import PlayerForm from "./player-form.svelte";

	let { data } = $props();

	const ctx = getContext<PlayersContext>("players-list");

	// Looked up in the layout's data, so a deleted player or a mistyped id lands on "not found".
	const player = $derived(data.players.find((p) => p._id === page.params.id));
</script>

{#if player}
	<!-- A new player gets a new form, so its draft starts from that player. -->
	{#key player._id}
		<PlayerForm {player} players={data.players} skins={data.skins} />
	{/key}
{:else}
	<div class="flex h-full items-center justify-center rounded-xl bg-layer-1">
		<EmptyState icon="search-x" title="This player doesn't exist anymore">
			{#snippet action()}
				<Button variant="link" href={ctx.listHref()}>Back to players</Button>
			{/snippet}
		</EmptyState>
	</div>
{/if}
