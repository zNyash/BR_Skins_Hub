<script lang="ts">
	import Icon from "$comp/icon.svelte";
	import { hasDescription } from "$lib/profile-tabs";
	import type { PlayerWithSkins } from "$lib/types";
	import LinkButton from "./link-button.svelte";

	let {
		player,
		isOwner,
		onEdit,
		onReadMore
	}: {
		player: PlayerWithSkins;
		isOwner: boolean;
		onEdit: () => void;
		onReadMore: () => void;
	} = $props();

	const links = $derived(player.links ?? []);
</script>

<aside aria-label="Player" class="flex max-w-80 shrink-0 grow basis-64 flex-col gap-4 pt-4">
	{#if player.bio || hasDescription(player.description)}
		<section class="flex flex-col gap-2 rounded-xl bg-card px-4 py-3">
			<h2 class="text-xs font-semibold tracking-wider text-text-muted uppercase">About</h2>
			{#if player.bio}
				<p class="text-sm leading-relaxed whitespace-pre-line">{player.bio}</p>
			{/if}
			{#if hasDescription(player.description)}
				<button
					type="button"
					class="w-fit text-sm font-medium text-primary hover:underline"
					onclick={onReadMore}
				>
					Read more
				</button>
			{/if}
		</section>
	{/if}

	{#if links.length > 0}
		<ul aria-label="Links" class="flex flex-wrap gap-1.5">
			{#each links as link, i (i)}
				<li><LinkButton type={link.type} value={link.value} /></li>
			{/each}
		</ul>
	{/if}

	{#if isOwner}
		<div class="flex flex-col items-start gap-1">
			{#if !player.bio}
				<button
					type="button"
					class="text-sm text-text-muted hover:text-foreground"
					onclick={onEdit}
				>
					Add a short bio
				</button>
			{/if}
			<button
				type="button"
				class="flex items-center gap-1.5 text-sm text-text-muted hover:text-foreground"
				onclick={onEdit}
			>
				<Icon name="pencil" class="size-4" />
				Edit profile
			</button>
		</div>
	{/if}
</aside>
