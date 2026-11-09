<script lang="ts">
	import { getContext } from "svelte";
	import { page } from "$app/state";
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
	<div
		class="flex h-full flex-col items-center justify-center gap-4 rounded-2xl bg-layer-1 p-4 text-center"
	>
		<p class="text-text-muted">This player doesn't exist anymore.</p>
		<!-- listHref() is resolve() plus ?filter. -->
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href={ctx.listHref()} class="text-accent-color hover:underline">Back to players</a>
	</div>
{/if}
