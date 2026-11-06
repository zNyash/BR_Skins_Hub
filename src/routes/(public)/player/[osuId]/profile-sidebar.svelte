<script lang="ts">
	import Icon from "$comp/icon.svelte";
	import * as Popover from "$comp/ui/popover";
	import { POPOVER_SETTINGS } from "$lib/constants";
	import { osuAvatar } from "$lib/osu";
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

<aside aria-label="Player" class="-mt-16 flex max-w-80 shrink-0 grow basis-64 flex-col gap-4">
	<div class="flex flex-col gap-3 px-2">
		<a href={`https://osu.ppy.sh/users/${player.osu_id}`} target="_blank" class="w-fit">
			<img
				src={osuAvatar(player.osu_id)}
				alt="{player.name} Profile Picture"
				class="size-32 shape-squircle rounded-[2rem] object-cover shadow-[0_0_0_5px_var(--surface)] drop-shadow-lg"
			/>
		</a>
		{#if player.previous_usernames && player.previous_usernames.length > 0}
			<Popover.Root>
				<Popover.Trigger {...POPOVER_SETTINGS} class="text-start">
					<h1 class="text-2xl font-bold">{player.name}</h1>
				</Popover.Trigger>
				<Popover.Content class="w-fit px-2 py-1 outline outline-border">
					<p class="text-sm">{player.previous_usernames.join(", ")}</p>
				</Popover.Content>
			</Popover.Root>
		{:else}
			<h1 class="text-2xl font-bold">{player.name}</h1>
		{/if}
	</div>

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
