<script lang="ts">
	import { ScrollState } from "runed";
	import Navbar from "$comp/navbar.svelte";

	let { children } = $props();

	const scroll = new ScrollState({ element: () => window });
	const isFloating = $derived(scroll.y > 60);
</script>

<!-- Spacer keeps content from jumping under the fixed navbar -->
<div class="h-11"></div>

<header class="fixed top-0 right-0 left-0 z-50 flex justify-center">
	<Navbar {isFloating} />
</header>

{@render children()}
