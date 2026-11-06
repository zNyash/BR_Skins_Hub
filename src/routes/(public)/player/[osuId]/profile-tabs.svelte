<script lang="ts">
	import { flip } from "svelte/animate";
	import { toast } from "svelte-sonner";
	import { page } from "$app/state";
	import Icon from "$comp/icon.svelte";
	import SearchSorted from "$comp/search-sorted.svelte";
	import SkinCard from "$comp/skin-card.svelte";
	import { request } from "$lib/api";
	import { PLAYER_SKIN_LIST, useListQuery } from "$lib/hooks/list-query.svelte";
	import {
		hasDescription,
		moveVisibleTab,
		pickTab,
		resolveTabs,
		visibleTabs,
		withSettings,
		type ProfileTab,
		type TabId
	} from "$lib/profile-tabs";
	import { SORTABLE_GHOST_CLASS, sortable } from "$lib/sortable";
	import type { PlayerWithSkins } from "$lib/types";
	import { cn } from "$lib/utils";
	import AboutPanel from "./about-panel.svelte";
	import { openTab } from "./open-tab";
	import SettingsTab from "./settings-tab.svelte";

	let { player, isOwner }: { player: PlayerWithSkins; isOwner: boolean } = $props();

	const LABELS: Record<ProfileTab, string> = { skins: "Skins", about: "About", setup: "Setup" };

	// A local copy so dragging can reorder the bar right away; it follows the saved order whenever
	// that changes (after a save or a reload).
	// svelte-ignore state_referenced_locally
	let order = $state(resolveTabs(player.tab_order));
	$effect(() => {
		order = resolveTabs(player.tab_order);
	});
	// Setup isn't built yet (part 3 of the redesign), so it never shows.
	const visible = $derived(
		visibleTabs(
			order,
			{ skins: true, about: hasDescription(player.description), setup: false },
			isOwner
		).filter((tab) => tab !== "setup")
	);
	const active = $derived(
		pickTab(page.url.searchParams.get("tab"), withSettings(visible, isOwner))
	);

	// The bar shows only the visible tabs, but the stored order has all of them.
	function moveTab(from: number, to: number) {
		order = moveVisibleTab(order, visible, from, to);
	}

	/** The Settings tab's ↑/↓ list: apply its new order and save it. */
	function reorder(next: ProfileTab[]) {
		order = next;
		saveOrder();
	}

	const tabClass = (tab: TabId) =>
		cn(
			"flex min-h-11 items-center gap-1.5 px-4 font-semibold transition-colors",
			tab === active
				? "text-foreground shadow-[inset_0_-2px_0_var(--accent-color)]"
				: "text-text-muted hover:text-foreground"
		);

	async function saveOrder() {
		try {
			await request("/api/me/profile", { method: "PATCH", body: { tab_order: order } });
		} catch (err) {
			order = resolveTabs(player.tab_order);
			toast.error(err instanceof Error ? err.message : "Couldn't save the tab order");
		}
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
	<div role="tablist" aria-label="Profile sections" class="flex items-end border-b border-layer-2">
		<div
			class="flex flex-wrap gap-1"
			use:sortable={{ onMove: moveTab, onDrop: saveOrder, disabled: !isOwner }}
		>
			{#each visible as tab (tab)}
				<div
					data-sortable-item
					animate:flip={{ duration: 150 }}
					class={cn("flex items-center", SORTABLE_GHOST_CLASS)}
				>
					<button
						type="button"
						role="tab"
						aria-selected={tab === active}
						data-sortable-handle={isOwner || undefined}
						title={isOwner ? "Drag to reorder" : undefined}
						class={cn(tabClass(tab), isOwner && "cursor-grab touch-manipulation")}
						onclick={() => openTab(tab)}
					>
						{LABELS[tab]}
						{#if tab === "skins"}
							<span class="font-medium text-text-muted">{player.skins.length - hiddenCount}</span>
						{/if}
					</button>
				</div>
			{/each}
		</div>
		{#if isOwner}
			<button
				type="button"
				role="tab"
				aria-selected={active === "settings"}
				title="Only you can see this tab"
				class={cn(tabClass("settings"), "ml-auto")}
				onclick={() => openTab("settings")}
			>
				<Icon name="settings" class="size-4" />
				Settings
			</button>
		{/if}
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
		<AboutPanel {player} {isOwner} />
	{:else if active === "settings"}
		<SettingsTab {player} {order} {visible} onReorder={reorder} />
	{/if}
</section>
