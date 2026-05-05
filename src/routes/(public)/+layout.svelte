<script lang="ts">
	import Navbar from "$comp/navbar.svelte";
	import { ScrollState } from "runed";

	let { children } = $props();

	const scroll = new ScrollState({ element: () => window });
	let isHidden = $state(false);
	const isFloating = $derived(scroll.y > 60);

	$effect(() => {
		if (scroll.y <= 60) {
			// Back near the top — always show
			isHidden = false;
		} else if (scroll.directions.bottom) {
			// Actively scrolling down — hide
			isHidden = false;
		} else if (scroll.directions.top) {
			// Actively scrolling up — show
			isHidden = false;
		}
		// Neither branch fires when scroll is idle → isHidden keeps its last value
	});
</script>

<!-- Spacer keeps content from jumping under the fixed navbar -->
<div class="h-11"></div>

<header
	class="fixed top-0 right-0 left-0 z-50 flex justify-center transition-transform duration-300 ease-in-out"
	class:-translate-y-full={isHidden}
>
	<Navbar {isFloating} />
</header>

{@render children()}
