<script lang="ts">
	import { toast } from "svelte-sonner";
	import { invalidate } from "$app/navigation";
	import HoldButton from "$comp/hold-button.svelte";
	import Icon from "$comp/icon.svelte";
	import ImageCarousel from "$comp/image-carousel.svelte";
	import PageHeading from "$comp/page-heading.svelte";
	import SearchSorted from "$comp/search-sorted.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import * as ContextMenu from "$comp/ui/context-menu";
	import * as Tabs from "$comp/ui/tabs";
	import Popover from "$comp/popover.svelte";
	import { request } from "$lib/api";
	import { DASHBOARD_SKIN_LIST, PLAYER_LIST, useListQuery } from "$lib/hooks/list-query.svelte";
	import { osuAvatar } from "$lib/osu";
	import DeleteDialog from "./dialogs/delete-dialog.svelte";
	import PlayerCreatorDialog from "./dialogs/player-creator-dialog.svelte";
	import PlayerEditor from "./player-editor.svelte";
	import SkinCreatorDialog from "./dialogs/skin-creator-dialog.svelte";
	import SkinEditor from "./skin-editor.svelte";

	type Item = { type: "player" | "skin"; id: string };

	let { data } = $props();

	// --- Editor ---
	// Creating happens in dialogs; the main panel only edits the selected item.
	let activeTab = $state<"players" | "skins">("players");
	let selected = $state<Item | null>(null);
	let isCreatingPlayer = $state(false);
	let isCreatingSkin = $state(false);

	const selectedPlayer = $derived(
		selected?.type === "player" ? data.players.find((p) => p._id === selected?.id) : undefined
	);
	const selectedSkin = $derived(
		selected?.type === "skin" ? data.skins.find((s) => s._id === selected?.id) : undefined
	);
	const tagSuggestions = $derived(
		[...new Set([...data.players, ...data.skins].flatMap((doc) => doc.tags ?? []))].sort()
	);

	function openCreator() {
		if (activeTab === "players") isCreatingPlayer = true;
		else isCreatingSkin = true;
	}

	function closeOnEscape(event: KeyboardEvent) {
		if (event.key !== "Escape") return;
		// Esc that closed a dialog or cleared a search box was meant for that, not for the editor.
		const isOverlayOpen = isDeleteDialogOpen || isCreatingPlayer || isCreatingSkin;
		if (event.defaultPrevented || isOverlayOpen || event.target instanceof HTMLInputElement) return;
		selected = null;
	}

	// --- Search and sorting ---
	const players = useListQuery(() => data.players, PLAYER_LIST);
	const skins = useListQuery(() => data.skins, DASHBOARD_SKIN_LIST);

	// --- Deleting ---
	// Every delete button (sidebar and editors) asks for the name to be typed in one dialog.
	let toDelete = $state<(Item & { name: string }) | null>(null);
	let isDeleteDialogOpen = $state(false);

	function askToDelete(item: Item & { name: string }) {
		toDelete = item;
		isDeleteDialogOpen = true;
	}

	async function deleteItem() {
		if (!toDelete) return;
		const { type, id, name } = toDelete;

		await request(`/api/${type}s/${id}`, { method: "DELETE" });
		toast.success(`${name} deleted`);
		if (selected?.id === id) selected = null;
		await invalidate(type === "player" ? "app:players" : "app:skins");
	}
</script>

<PageHeading title="Dashboard" description="Admin Dashboard" />

<PlayerCreatorDialog
	bind:open={isCreatingPlayer}
	onCreated={(id) => (selected = { type: "player", id })}
/>
<SkinCreatorDialog
	bind:open={isCreatingSkin}
	onCreated={(id) => (selected = { type: "skin", id })}
/>
{#if toDelete}
	<!-- Keyed so each delete starts with an empty confirmation input -->
	{#key toDelete}
		<DeleteDialog
			bind:open={isDeleteDialogOpen}
			name={toDelete.name}
			kind={toDelete.type}
			onConfirm={deleteItem}
		/>
	{/key}
{/if}

<svelte:window onkeydown={closeOnEscape} />

<div class="flex h-[calc(100vh-44px)] min-h-0 gap-2 bg-card p-2">
	<aside class="flex w-full max-w-xs gap-2 overflow-y-auto rounded-lg bg-surface p-2">
		<!-- min-w-0: let the tabs shrink to the sidebar width, otherwise long truncated names widen it -->
		<Tabs.Root bind:value={activeTab} class="w-full min-w-0">
			<span class="grid w-full grid-cols-[2fr_1fr] gap-2">
				<Tabs.List class="w-full bg-card">
					<Tabs.Trigger value="players" class="dark:data-active:bg-popover">Players</Tabs.Trigger>
					<Tabs.Trigger value="skins" class="dark:data-active:bg-popover">Skins</Tabs.Trigger>
				</Tabs.List>
				<Button variant={selected ? "secondary" : "default"} onclick={openCreator}>
					<Icon name="plus" />
					New
				</Button>
			</span>

			<!-- Listing for players -->
			<Tabs.Content value="players" class="flex flex-col gap-2">
				<SearchSorted list={players} placeholder="Search players..." />
				{#each players.results as player (player._id)}
					<ContextMenu.Root>
						<ContextMenu.Trigger>
							<button
								class="flex w-full items-center gap-2 rounded-md bg-card p-1 ring-primary select-none hover:ring"
								onclick={() => (selected = { type: "player", id: player._id })}
							>
								<div class="aspect-square size-9">
									<img
										src={osuAvatar(player.osu_id)}
										alt=""
										class="size-full rounded-lg object-cover"
									/>
								</div>
								<div>
									<p>{player.name}</p>
								</div>
							</button>
						</ContextMenu.Trigger>
						<ContextMenu.Content>
							<HoldButton
								variant="destructive"
								duration={1000}
								fillColor="bg-black/40"
								class="w-full justify-start"
								from="left"
								onComplete={() =>
									askToDelete({ type: "player", id: player._id, name: player.name })}
							>
								<Icon name="trash" />
								<p>Delete</p>
							</HoldButton>
						</ContextMenu.Content>
					</ContextMenu.Root>
				{/each}
			</Tabs.Content>

			<!-- Listing for skins -->
			<Tabs.Content value="skins" class="flex flex-col gap-2">
				<SearchSorted list={skins} placeholder="Search skins..." />
				{#each skins.results as skin (skin._id)}
					<ContextMenu.Root>
						<ContextMenu.Trigger>
							<div
								class="flex items-center gap-2 rounded-md bg-card p-1 ring-primary select-none hover:ring"
							>
								<span class="size-9">
									<Popover hover={false} class="w-2xl max-w-[calc(100vw-1rem)] rounded-xl p-1">
										{#snippet trigger(props)}
											<button {...props} type="button" class="flex aspect-square size-9">
												<img
													src={skin.preview_images[0]}
													alt={skin.name}
													class="size-full rounded-lg object-cover"
												/>
											</button>
										{/snippet}
										<ImageCarousel {skin} linked={false} radius="full" />
									</Popover>
								</span>
								<button
									class="min-w-0 flex-1 self-stretch truncate text-left"
									onclick={() => (selected = { type: "skin", id: skin._id })}
								>
									{skin.name}
								</button>
							</div>
						</ContextMenu.Trigger>
						<ContextMenu.Content>
							<HoldButton
								variant="destructive"
								duration={1000}
								fillColor="bg-black/40"
								class="w-full justify-start"
								from="left"
								onComplete={() => askToDelete({ type: "skin", id: skin._id, name: skin.name })}
							>
								<Icon name="trash" />
								<p>Delete</p>
							</HoldButton>
						</ContextMenu.Content>
					</ContextMenu.Root>
				{/each}
			</Tabs.Content>
		</Tabs.Root>
	</aside>

	<!-- Main context window -->
	<main class="min-h-0 flex-1 overflow-hidden rounded-lg bg-surface p-2">
		<div class="flex h-full min-h-0 w-full max-w-2xl flex-col overflow-y-auto rounded bg-muted p-4">
			{#if selectedPlayer}
				<!-- Keyed on the player object (not just the id) so the editor re-reads it after a refresh from osu! -->
				{#key selectedPlayer}
					<PlayerEditor
						player={selectedPlayer}
						allSkins={data.skins}
						{tagSuggestions}
						onSave={() => (selected = null)}
						onDelete={() =>
							askToDelete({ type: "player", id: selectedPlayer._id, name: selectedPlayer.name })}
					/>
				{/key}
			{:else if selectedSkin}
				<!-- Keyed on the skin object for the same reason as the player editor -->
				{#key selectedSkin}
					<SkinEditor
						skin={selectedSkin}
						allPlayers={data.players}
						{tagSuggestions}
						onSave={() => (selected = null)}
						onDelete={() =>
							askToDelete({ type: "skin", id: selectedSkin._id, name: selectedSkin.name })}
					/>
				{/key}
			{:else}
				<p class="text-muted-foreground">Select a player or skin to edit it.</p>
			{/if}
		</div>
	</main>
</div>

<style>
	aside {
		scrollbar-color: transparent transparent;
		scrollbar-width: thin;
	}
</style>
