<script lang="ts">
	import { ScrollState } from "runed";
	import { resolve } from "$app/paths";
	import Navbar from "$comp/navbar.svelte";
	import { CREATOR } from "$lib/constants";

	let { children } = $props();

	const scroll = new ScrollState({ element: () => window });
	const isFloating = $derived(scroll.y > 60);
</script>

<!-- Spacer keeps content from jumping under the fixed navbar -->
<div class="h-11"></div>

<header class="fixed top-0 right-0 left-0 z-50 flex justify-center">
	<Navbar {isFloating} />
</header>

<!-- The content always fills at least the screen (minus the navbar spacer), and long pages keep
     some room below their last element instead of ending flush against the window's edge. -->
<div class="flex min-h-[calc(100dvh-2.75rem)] flex-col pb-24">
	{@render children()}
</div>

<footer class="border-t border-layer-2 py-6 text-center text-sm text-text-muted">
	Made by
	<a
		href={resolve("/(public)/player/[osuId]", { osuId: String(CREATOR.osuId) })}
		class="font-medium text-foreground hover:text-primary"
	>
		{CREATOR.name}
	</a>
</footer>
