<script lang="ts">
	import { resolve } from "$app/paths";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import Separator from "$comp/ui/separator/separator.svelte";

	let { children } = $props();
</script>

<div class="flex h-screen flex-col overflow-hidden bg-surface">
	<header
		class="flex h-11 w-full items-center justify-start gap-3 border-b border-popover bg-card px-1"
	>
		<Button variant="navigation" class="-mr-3" href={resolve("/")}>
			<Icon name="arrow-left" class="size-4" />
			Back to website
		</Button>
		<Separator orientation="vertical" class="h-4!" />
		<span class="text-sm font-medium text-text">Dashboard</span>
	</header>
	<div class="flex-1 overflow-hidden">
		{@render children()}
	</div>
</div>
