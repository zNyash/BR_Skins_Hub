<script lang="ts">
	import { afterNavigate } from "$app/navigation";
	import { page } from "$app/state";
	import ConfirmDialog from "$comp/confirm-dialog.svelte";
	import { Toaster } from "$comp/ui/sonner";
	import favicon from "$lib/assets/favicon.svg";
	import { pickHue } from "$lib/hue";
	import { huePreview } from "$lib/hue-preview.svelte";
	import "./layout.css";

	let { data, children } = $props();

	// While the owner tries a color in Settings, that preview wins. Otherwise a player's page uses
	// their color, and every other page uses the logged-in player's,
	// unless they turned "My color everywhere" off (see pickHue).
	// pickHue only ever returns a plain number, so it's safe to write into the style below.
	// `html:root` outranks layout.css's `:root, .dark { --hue: 0 }` (<html> has class="dark"),
	// whichever stylesheet the browser loads last.
	const hue = $derived(
		pickHue(page.data.pageHue, data.user?.hue, data.user?.useMyColor ?? false, huePreview.value)
	);

	// A color the owner was trying out never follows them to another page.
	afterNavigate(() => (huePreview.value = null));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#if hue !== null}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html `<style>html:root{--hue:${hue}}</style>`}
	{/if}
</svelte:head>
<Toaster toastOptions={{ class: "shadow-float" }} />
<ConfirmDialog />
{@render children()}
