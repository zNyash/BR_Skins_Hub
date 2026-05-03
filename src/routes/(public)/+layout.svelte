<script lang="ts">
	import Navbar from "$comp/navbar.svelte";

	let { children } = $props();
</script>

<Navbar />
{@render children()}
