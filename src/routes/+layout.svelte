<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import { Toaster } from "$comp/ui/sonner";
	import "./layout.css";

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Toaster />
{@render children()}
