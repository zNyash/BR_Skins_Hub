<script lang="ts">
	import LinksEditor from "$comp/links-editor.svelte";
	import type { PlayerDraft } from "./player-fields";

	let { draft = $bindable() }: { draft: PlayerDraft } = $props();
</script>

<div class="flex flex-col gap-3">
	<LinksEditor bind:links={draft.player.links} />
</div>
