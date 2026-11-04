<script lang="ts">
	import PageHeading from "$comp/page-heading.svelte";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import * as ContextMenu from "$lib/components/ui/context-menu/index.js";

	import {
		PLAYER_SORT_OPTIONS,
		SKIN_SORT_OPTIONS,
		type OrderBy,
		type PlayerSortBy,
		type SkinSortBy
	} from "$lib/constants.js";
	import { useFuzzyFilter } from "$lib/utils/fuzzyFilter.svelte.js";
	import { osuAvatar } from "$lib/utils/osu";
	import { useSorted } from "$lib/utils/sorted.svelte.js";
	import ImageCarousel from "$comp/image-carousel.svelte";
	import Icon from "$comp/icon.svelte";
	import HoldButton from "$comp/ui/hold-button/hold-button.svelte";
	import SearchSorted from "$comp/search-sorted.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import PlayerEditor from "./PlayerEditor.svelte";
	import PlayerCreatorDialog from "./PlayerCreatorDialog.svelte";
	import { Toaster } from "$comp/ui/sonner";

	// ---------- Types ----------
	// Creating happens in dialogs; only editing uses the main panel.
	type EditorState =
		| { mode: "idle" }
		| { mode: "edit"; type: "player"; id: string }
		| { mode: "edit"; type: "skin"; id: string };

	// ---------- State ----------
	let { data } = $props();
	let activeTab = $state<"players" | "skins">("players");
	let editor = $state<EditorState>({
		mode: "idle"
	});
	let isCreatingPlayer = $state(false);

	function openCreator() {
		if (activeTab === "players") isCreatingPlayer = true;
		// TODO: skin creator dialog
	}

	const editorPlayer = $derived.by(() => {
		const e = editor;
		if (e.mode !== "edit") return null;
		if (e.type !== "player") return null;
		return data.players.find((p) => p._id === e.id) ?? null;
	});

	const editorSkin = $derived.by(() => {
		const e = editor;
		if (e.mode !== "edit") return null;
		if (e.type !== "skin") return null;
		return data.skins.find((s) => s._id === e.id) ?? null;
	});

	// ---------- Input State and Sorting ----------
	let inputPlayersValue = $state("");
	let sortPlayersBy = $state<PlayerSortBy>("name");
	let orderPlayersBy = $state<OrderBy>("asc");
	const filteredPlayers = useFuzzyFilter(
		() => data.players,
		() => inputPlayersValue,
		{ keys: ["name", "osu_id", "previous_usernames"], threshold: 0.4 }
	);
	const sortedPlayers = useSorted(
		() => filteredPlayers.results,
		() => sortPlayersBy,
		() => orderPlayersBy,
		PLAYER_SORT_OPTIONS
	);

	let inputSkinsValue = $state("");
	let sortSkinsBy = $state<SkinSortBy>("date");
	let orderSkinsBy = $state<OrderBy>("desc");
	const filteredSkins = useFuzzyFilter(
		() => data.skins,
		() => inputSkinsValue,
		{ keys: ["name", "author", "players.name", "players.previous_usernames"], threshold: 0.4 }
	);
	const sortedSkins = useSorted(
		() => filteredSkins.results,
		() => sortSkinsBy,
		() => orderSkinsBy,
		SKIN_SORT_OPTIONS
	);

	//
	function quitEditMode(event: KeyboardEvent) {
		if (event.key === "Escape") {
			editor = { mode: "idle" };
		}
	}
</script>

<PageHeading title="Dashboard" description="Admin Dashboard" />
<Toaster />

<PlayerCreatorDialog
	bind:open={isCreatingPlayer}
	onCreated={(id) => (editor = { mode: "edit", type: "player", id })}
/>

<svelte:window onkeydown={quitEditMode} />

<div class="flex h-[calc(100vh-44px)] min-h-0 gap-2 bg-card p-2">
	<aside class="flex w-full max-w-xs gap-2 overflow-y-auto rounded-lg bg-surface p-2">
		<Tabs.Root bind:value={activeTab}>
			<span class="grid w-full grid-cols-[2fr_1fr] gap-2">
				<Tabs.List class="w-full bg-card">
					<Tabs.Trigger value="players" class="dark:data-active:bg-popover">Players</Tabs.Trigger>
					<Tabs.Trigger value="skins" class="dark:data-active:bg-popover">Skins</Tabs.Trigger>
				</Tabs.List>
				<Button variant={editor.mode === "idle" ? "default" : "secondary"} onclick={openCreator}>
					<Icon name="plus" />
					New
				</Button>
			</span>

			<!-- Listing for players -->
			<Tabs.Content value="players" class="flex flex-col gap-2">
				<SearchSorted
					placeholder="Search players..."
					sortOptions={PLAYER_SORT_OPTIONS}
					bind:inputValue={inputPlayersValue}
					bind:sortBy={sortPlayersBy}
					bind:orderBy={orderPlayersBy}
				/>
				{#each sortedPlayers.results as player (player._id)}
					<ContextMenu.Root>
						<ContextMenu.Trigger>
							<button
								class="flex w-full items-center gap-2 rounded-md bg-card p-1 ring-primary select-none hover:ring"
								onclick={() => (editor = { mode: "edit", type: "player", id: player._id })}
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
				<SearchSorted
					placeholder="Search skins..."
					sortOptions={SKIN_SORT_OPTIONS}
					bind:inputValue={inputSkinsValue}
					bind:sortBy={sortSkinsBy}
					bind:orderBy={orderSkinsBy}
				/>
				{#each sortedSkins.results as skin (skin._id)}
					<ContextMenu.Root>
						<ContextMenu.Trigger>
							<div
								class="flex items-center gap-2 rounded-md bg-card p-1 ring-primary select-none hover:ring"
							>
								<span class="size-9">
									<Popover.Root>
										<Popover.Trigger class="flex aspect-square size-9">
											<img
												src={skin.preview_images[0]}
												alt={skin.name}
												class="size-full rounded-lg object-cover"
											/>
										</Popover.Trigger>
										<Popover.Content class="w-2xl rounded-xl p-1">
											<ImageCarousel {skin} linked={false} radius="full" />
										</Popover.Content>
									</Popover.Root>
								</span>
								<div>
									<p>{skin.name}</p>
								</div>
							</div>
						</ContextMenu.Trigger>
						<ContextMenu.Content>
							<HoldButton
								variant="destructive"
								duration={1000}
								fillColor="bg-black/40"
								class="w-full justify-start"
								from="left"
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
			{#if editor.mode === "edit"}
				{#if editor.type === "player"}
					<!-- Keyed on the player object (not just the id) so the editor re-reads it after a refresh from osu! -->
					{#key editorPlayer}
						<PlayerEditor
							player={editorPlayer!}
							allSkins={data.skins}
							onSave={() => (editor = { mode: "idle" })}
						/>
					{/key}
				{:else}
					<p>Skin {editorSkin?.name}</p>
				{/if}
			{:else}
				<p>Theres nothing here.</p>
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
