<script lang="ts">
	import type { Snippet } from "svelte";

	let { title, children }: { title: string; children: Snippet } = $props();
	const id = $props.id();
</script>

<section aria-labelledby={id} class="flex flex-col gap-3 rounded-xl bg-card px-5 py-4">
	<h2 {id} class="text-base font-bold text-primary">{title}</h2>
	{@render children()}
</section>
