<script lang="ts">
	import { flip } from "svelte/animate";
	import { toast } from "svelte-sonner";
	import { page } from "$app/state";
	import Icon from "$comp/icon.svelte";
	import * as Tabs from "$comp/ui/tabs";
	import SearchToolbar from "$comp/search-toolbar.svelte";
	import SkinCard from "$comp/skin-card.svelte";
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
	import { saveProfile } from "./save-profile";
	import { hasSetup, type CardId } from "$lib/setup";
	import SettingsTab from "./settings-tab.svelte";
	import SetupDialog from "./setup-dialog.svelte";
	import SetupPanel from "./setup-panel.svelte";

	let {
		player,
		isOwner,
		canEdit
	}: { player: PlayerWithSkins; isOwner: boolean; canEdit: boolean } = $props();

	const LABELS: Record<ProfileTab, string> = { skins: "Skins", about: "About", setup: "Setup" };

	// A local copy so dragging can reorder the bar right away; it follows the saved order whenever
	// that changes (after a save or a reload).
	// svelte-ignore state_referenced_locally
	let order = $state(resolveTabs(player.tab_order));
	$effect(() => {
		order = resolveTabs(player.tab_order);
	});
	// Editors (owner or admin) always see Setup, so they can fill it in.
	const visible = $derived(
		visibleTabs(
			order,
			{
				skins: true,
				about: hasDescription(player.description),
				setup: canEdit || hasSetup(player.setup)
			},
			isOwner
		)
	);

	let editingCard = $state<CardId | null>(null);

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

	async function saveOrder() {
		try {
			// Reloading keeps `player.tab_order` current, so a later failed save reverts to what's stored.
			await saveProfile(player.osu_id, { tab_order: order });
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

<section aria-label="Profile content" class="flex min-w-0 flex-[999_1_560px] flex-col gap-4 pt-4">
	<!-- The URL is the only source of truth: a click asks openTab to change ?tab=, and the bar
	     follows `active`, so a cancelled navigation (unsaved changes) leaves it where it was. -->
	<Tabs.Root bind:value={() => active, (tab) => openTab(tab as TabId)} activationMode="manual">
		<Tabs.List
			variant="line"
			aria-label="Profile sections"
			class="w-full justify-start border-b border-layer-2"
		>
			<div
				class="flex flex-wrap gap-4"
				use:sortable={{ onMove: moveTab, onDrop: saveOrder, disabled: !isOwner }}
			>
				{#each visible as tab (tab)}
					<div data-sortable-item animate:flip={{ duration: 150 }} class={SORTABLE_GHOST_CLASS}>
						<Tabs.Trigger
							value={tab}
							data-sortable-handle={isOwner || undefined}
							title={isOwner ? "Drag to reorder" : undefined}
							class={cn(isOwner && "cursor-grab touch-manipulation")}
						>
							{LABELS[tab]}
							{#if tab === "skins"}
								<span class="text-caption text-text-muted">{player.skins.length - hiddenCount}</span
								>
							{/if}
						</Tabs.Trigger>
					</div>
				{/each}
			</div>
			{#if isOwner}
				<Tabs.Trigger value="settings" title="Only you can see this tab" class="ml-auto flex-none">
					<Icon name="settings" />
					Settings
				</Tabs.Trigger>
			{/if}
		</Tabs.List>
	</Tabs.Root>

	{#if active === "skins"}
		<div role="tabpanel" class="flex flex-col gap-4">
			<SearchToolbar
				list={skins}
				placeholder="Search skins by name..."
				total={showHidden ? player.skins.length : player.skins.length - hiddenCount}
			>
				{#if hiddenCount > 0}
					<button
						type="button"
						class="flex w-fit items-center gap-1 text-caption text-text-muted transition-colors duration-fast hover:text-text"
						aria-pressed={showHidden}
						onclick={() => (showHidden = !showHidden)}
					>
						<Icon name={showHidden ? "eye-off" : "eye"} class="size-3" />
						{showHidden ? "Hide hidden skins" : `Show hidden skins (${hiddenCount})`}
					</button>
				{/if}
			</SearchToolbar>
			<div class="common-grid">
				{#each skins.results as skin (skin._id)}
					<SkinCard {skin} hidden={skin.hidden} />
				{/each}
			</div>
		</div>
	{:else if active === "about"}
		<AboutPanel {player} {isOwner} />
	{:else if active === "setup"}
		<SetupPanel {player} {canEdit} onEdit={(card) => (editingCard = card)} />
		<SetupDialog {player} card={editingCard} onClose={() => (editingCard = null)} />
	{:else if active === "settings"}
		<SettingsTab {player} {order} {visible} onReorder={reorder} />
	{/if}
</section>
