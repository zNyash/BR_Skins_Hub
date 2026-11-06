<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import Icon from "$comp/icon.svelte";
	import SearchSorted from "$comp/search-sorted.svelte";
	import SkinCard from "$comp/skin-card.svelte";
	import { PLAYER_SKIN_LIST, useListQuery } from "$lib/hooks/list-query.svelte";
	import {
		hasDescription,
		pickTab,
		resolveTabs,
		visibleTabs,
		type ProfileTab
	} from "$lib/profile-tabs";
	import type { PlayerWithSkins } from "$lib/types";

	let {
		player,
		isOwner,
		onEdit
	}: { player: PlayerWithSkins; isOwner: boolean; onEdit: () => void } = $props();

	const LABELS: Record<ProfileTab, string> = { skins: "Skins", about: "About", setup: "Setup" };

	const order = $derived(resolveTabs(player.tab_order));
	// Setup isn't built yet (part 3 of the redesign), so it never shows.
	const visible = $derived(
		visibleTabs(
			order,
			{ skins: true, about: hasDescription(player.description), setup: false },
			isOwner
		).filter((tab) => tab !== "setup")
	);
	const active = $derived(pickTab(page.url.searchParams.get("tab"), visible));

	function select(tab: ProfileTab) {
		const url = new URL(page.url);
		url.searchParams.set("tab", tab);
		goto(url, { replaceState: true, noScroll: true, keepFocus: true });
	}

	// Skins the player hid only show up (dimmed, in their place) after "Show hidden skins".
	// Filtering before the list query keeps search from finding them while they're hidden.
	let showHidden = $state(false);
	const hiddenCount = $derived(player.skins.filter((s) => s.hidden).length);
	const skins = useListQuery(
		() => (showHidden ? player.skins : player.skins.filter((s) => !s.hidden)),
		PLAYER_SKIN_LIST
	);
</script>

<section aria-label="Profile content" class="flex min-w-0 flex-[999_1_560px] flex-col gap-5 pt-4">
	<div
		role="tablist"
		aria-label="Profile sections"
		class="flex flex-wrap gap-1 border-b border-layer-2"
	>
		{#each visible as tab (tab)}
			<button
				type="button"
				role="tab"
				aria-selected={tab === active}
				class="min-h-11 px-4 font-semibold transition-colors {tab === active
					? 'text-foreground shadow-[inset_0_-2px_0_var(--accent-color)]'
					: 'text-text-muted hover:text-foreground'}"
				onclick={() => select(tab)}
			>
				{LABELS[tab]}
				{#if tab === "skins"}
					<span class="font-medium text-text-muted">{player.skins.length - hiddenCount}</span>
				{/if}
			</button>
		{/each}
	</div>

	{#if active === "skins"}
		<div role="tabpanel" class="flex flex-col gap-4">
			<div class="flex w-full items-center justify-between gap-3">
				<SearchSorted list={skins} placeholder="Search skins by name..." />
				<div class="flex flex-col items-end gap-0.5">
					<p class="text-xs">
						Loaded {skins.results.length}
						{skins.results.length === 1 ? "skin" : "skins"}
					</p>
					{#if hiddenCount > 0}
						<button
							type="button"
							class="flex items-center gap-1 text-xs text-text-muted hover:text-foreground"
							aria-pressed={showHidden}
							onclick={() => (showHidden = !showHidden)}
						>
							<Icon name={showHidden ? "eye-off" : "eye"} class="size-3.5" />
							{showHidden ? "Hide hidden skins" : `Show hidden skins (${hiddenCount})`}
						</button>
					{/if}
				</div>
			</div>
			<div class="common-grid">
				{#each skins.results as skin (skin._id)}
					<SkinCard {skin} hidden={skin.hidden} />
				{/each}
			</div>
		</div>
	{:else if active === "about"}
		<div role="tabpanel" class="max-w-3xl rounded-xl bg-card px-7 py-6">
			{#if hasDescription(player.description)}
				<p class="leading-relaxed whitespace-pre-wrap">{player.description}</p>
			{:else}
				<button type="button" class="text-text-muted hover:text-foreground" onclick={onEdit}>
					Add a description
				</button>
			{/if}
		</div>
	{/if}
</section>
