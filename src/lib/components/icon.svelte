<script lang="ts">
	import Iconify from "@iconify/svelte";
	import { cn } from "$lib/utils";

	let {
		name,
		set = "lucide",
		class: className = ""
	}: {
		name: string;
		set?: string;
		class?: string;
	} = $props();

	const icon = $derived(name.includes(":") ? name : `${set}:${name}`);
</script>

<Iconify {icon} class={cn("size-5", className)} />
