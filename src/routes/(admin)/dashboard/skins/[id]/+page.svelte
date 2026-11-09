<script lang="ts">
	import { getContext } from "svelte";
	import { page } from "$app/state";
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
	<div
		class="flex h-full flex-col items-center justify-center gap-4 rounded-2xl bg-layer-1 p-4 text-center"
	>
		<p class="text-text-muted">This skin doesn't exist anymore.</p>
		<!-- listHref() is resolve() plus ?filter. -->
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href={ctx.listHref()} class="text-accent-color hover:underline">Back to skins</a>
	</div>
{/if}
