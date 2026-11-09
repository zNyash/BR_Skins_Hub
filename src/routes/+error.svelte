<script lang="ts">
	import { page } from "$app/state";
	import Icon from "$comp/icon.svelte";
	import PageHeading from "$comp/page-heading.svelte";
	import Button from "$comp/ui/button/button.svelte";

	const isNotFound = $derived(page.status === 404);
	// SvelteKit's own message for unknown urls is just "Not Found"; ours (e.g. "Player not found") say more.
	const detail = $derived(page.error?.message === "Not Found" ? null : page.error?.message);
</script>

<PageHeading title={String(page.status)} />

<header class="flex h-11 items-center justify-center bg-card">
	<Button variant="ghost" href="/">
		<Icon name="user-round" />
		Players
	</Button>
	<Button variant="ghost" href="/skins">
		<Icon name="brush" />
		Skins
	</Button>
</header>

<main class="flex flex-col items-center gap-3 px-4 py-24 text-center">
	<p class="text-6xl font-bold text-primary">{page.status}</p>
	<h1 class="text-xl font-medium">
		{isNotFound ? "This page doesn't exist" : "Something went wrong"}
	</h1>
	{#if detail}
		<p class="text-text-muted">{detail}</p>
	{/if}
	{#if page.error?.errorId}
		<p class="text-xs text-text-muted">Reference: {page.error.errorId}</p>
	{/if}
	<Button href="/" class="mt-4">
		<Icon name="arrow-left" />
		Back to players
	</Button>
</main>
