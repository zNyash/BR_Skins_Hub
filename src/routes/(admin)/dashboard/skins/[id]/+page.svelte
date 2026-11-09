<script lang="ts">
	import { getContext } from "svelte";
	import { page } from "$app/state";
	import EmptyState from "$comp/empty-state.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import type { SkinsContext } from "../+layout.svelte";
	import SkinForm from "./skin-form.svelte";

	let { data } = $props();

	const ctx = getContext<SkinsContext>("skins-list");

	// Looked up in the layout's data, so a deleted skin or a mistyped id lands on "not found".
	const skin = $derived(data.skins.find((s) => s._id === page.params.id));
</script>

{#if skin}
	<!-- A new skin gets a new form, so its draft starts from that skin. -->
	{#key skin._id}
		<SkinForm {skin} players={data.players} skins={data.skins} />
	{/key}
{:else}
	<div class="flex h-full items-center justify-center rounded-xl bg-layer-1">
		<EmptyState icon="search-x" title="This skin doesn't exist anymore">
			{#snippet action()}
				<Button variant="link" href={ctx.listHref()}>Back to skins</Button>
			{/snippet}
		</EmptyState>
	</div>
{/if}
