<script lang="ts">
	import { page } from "$app/state";
	import { Toaster } from "$comp/ui/sonner";
	import favicon from "$lib/assets/favicon.svg";
	import { clampHue } from "$lib/hue";
	import "./layout.css";

	let { data, children } = $props();

	// A player's page uses their color; every other page uses the logged-in player's.
	// clampHue makes it a plain number, so it's safe to write into the style below.
	// `html:root` outranks layout.css's `:root, .dark { --hue: 0 }` (<html> has class="dark"),
	// whichever stylesheet the browser loads last.
	const hue = $derived(clampHue(page.data.pageHue ?? data.user?.hue));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#if hue !== null}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html `<style>html:root{--hue:${hue}}</style>`}
	{/if}
</svelte:head>
<Toaster />
{@render children()}
