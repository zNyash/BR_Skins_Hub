<script lang="ts">
	// Test-only: a ListPane whose breakpoint the test flips, with a plain input as the editor.
	import { setContext } from "svelte";
	import { DEFAULT_LAYOUT } from "$lib/dashboard-layout";
	import ListPane from "./list-pane.svelte";

	let { isDesktop }: { isDesktop: boolean } = $props();

	const layout = $state({ ...DEFAULT_LAYOUT });
	setContext("dashboard-layout", {
		layout,
		get isDesktop() {
			return isDesktop;
		},
		setEditor: () => {}
	});
</script>

<ListPane hasItem onClose={() => {}}>
	{#snippet list()}
		<p>List</p>
	{/snippet}
	{#snippet editor()}
		<input aria-label="Draft" />
	{/snippet}
</ListPane>
