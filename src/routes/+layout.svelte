<script lang="ts">
	import { Toaster } from "$comp/ui/sonner";
	import favicon from "$lib/assets/favicon.svg";
	import "./layout.css";

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Toaster />
{@render children()}
