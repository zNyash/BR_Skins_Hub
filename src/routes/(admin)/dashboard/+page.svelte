<script lang="ts">
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import ImageCarousel from "$comp/image-carousel.svelte";
	import SearchSorted from "$comp/search-sorted.svelte";
	import type { OrderBy, SortBy } from "$lib/constants.js";

	import { useFuzzyFilter } from "$lib/utils/fuzzyFilter.svelte.js";
	import { useSorted } from "$lib/utils/sorted.svelte.js";
	import SkinEditor from "./components/SkinEditor.svelte";
	import PlayerEditor from "./components/PlayerEditor.svelte";
	import PlayerSkinAssignment from "./components/PlayerSkinAssignment.svelte";
	import { Button } from "$comp/ui/button";
	import Icon from "$comp/icon.svelte";

	// ---------- Types ----------
	type EditorState =
		| { mode: "idle" }
		| { mode: "create"; type: "player" | "skin" }
		| { mode: "edit"; type: "player"; id: string }
		| { mode: "edit"; type: "skin"; id: string }
		| { mode: "assign"; playerId: string };

	// ---------- State ----------
	let { data } = $props();

	let editor = $state<EditorState>({ mode: "idle" });

	const editorSkin = $derived.by(() => {
		const e = editor;
		if (e.mode !== "edit") return null;
		if (e.type !== "skin") return null;
		return data.skins.find((s) => s._id === e.id) ?? null;
	});

	const editorPlayer = $derived.by(() => {
		const e = editor;
		if (e.mode !== "edit") return null;
		if (e.type !== "player") return null;
		return data.players.find((p) => p._id === e.id) ?? null;
	});

	// ---------- Input State and Sorting ----------
	let inputPlayersValue = $state("");
	let sortPlayersBy = $state<SortBy>("name");
	let orderPlayersBy = $state<OrderBy>("asc");
	const filteredPlayers = useFuzzyFilter(
		() => data.players,
		() => inputPlayersValue,
		{ keys: ["name", "osu_id", "previous_usernames"], threshold: 0.4 }
	);
	const sortedPlayers = useSorted(
		() => filteredPlayers.results,
		() => sortPlayersBy,
		() => orderPlayersBy
	);

	let inputSkinsValue = $state("");
	let sortSkinsBy = $state<SortBy>("date");
	let orderSkinsBy = $state<OrderBy>("desc");
	const filteredSkins = useFuzzyFilter(
		() => data.skins,
		() => inputSkinsValue,
		{ keys: ["name", "author", "players.name", "players.previous_usernames"], threshold: 0.4 }
	);
	const sortedSkins = useSorted(
		() => filteredSkins.results,
		() => sortSkinsBy,
		() => orderSkinsBy
	);
</script>

<div
	class="grid h-full gap-2 bg-card p-2 md:grid-cols-[1fr_2fr] lg:grid-cols-[1fr_3fr] xl:grid-cols-[1fr_4fr]"
>
	<aside class="flex overflow-y-auto rounded-lg bg-surface p-2">
		<Tabs.Root value="skins" class="flex-1">
			<Tabs.List class="bg-card">
				<Tabs.Trigger value="players" class="dark:data-active:bg-popover">Players</Tabs.Trigger>
				<Tabs.Trigger value="skins" class="dark:data-active:bg-popover">Skins</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="players" class="flex flex-col gap-2">
				<Button
					variant="outline"
					size="sm"
					class="w-full"
					onclick={() => (editor = { mode: "create", type: "player" })}
				>
					<Icon name="plus" />
					New Player
				</Button>
				<SearchSorted
					placeholder="Search players..."
					bind:inputValue={inputPlayersValue}
					bind:sortBy={sortPlayersBy}
					bind:orderBy={orderPlayersBy}
				/>
				{#each sortedPlayers.results as player (player._id)}
					<button
						class="flex flex-1 items-center justify-start gap-2 rounded-xl bg-card p-1 hover:ring hover:ring-primary hover:ring-inset"
						onclick={() => (editor = { mode: "edit", type: "player", id: player._id })}
					>
						<span class="size-9">
							<img
								src="https://a.ppy.sh/{player.osu_id}"
								alt={player.name}
								class="size-full rounded-lg object-cover"
							/>
						</span>
						<p class="select-none">{player.name}</p>
					</button>
				{/each}
			</Tabs.Content>
			<Tabs.Content value="skins" class="flex flex-col gap-2">
				<Button
					variant="outline"
					size="sm"
					class="w-full"
					onclick={() => (editor = { mode: "create", type: "skin" })}
				>
					<Icon name="plus" />
					New Skin
				</Button>
				<SearchSorted
					placeholder="Search skins..."
					bind:inputValue={inputSkinsValue}
					bind:sortBy={sortSkinsBy}
					bind:orderBy={orderSkinsBy}
				/>
				{#each sortedSkins.results as skin (skin._id)}
					<button
						class="flex flex-1 items-center justify-start gap-2 rounded-xl bg-card p-1 hover:ring hover:ring-primary hover:ring-inset"
						onclick={() => (editor = { mode: "edit", type: "skin", id: skin._id })}
					>
						<span class="size-9">
							<Popover.Root>
								<Popover.Trigger class="size-9">
									<img
										src={skin.preview_images[0]}
										alt={skin.name}
										class="aspect-square size-full rounded-lg object-cover"
									/>
								</Popover.Trigger>
								<Popover.Content class="w-2xl rounded-2xl p-2">
									<ImageCarousel {skin} linked={false} radius="full" />
								</Popover.Content>
							</Popover.Root>
						</span>
						<p class="select-none">{skin.name}</p>
					</button>
				{/each}
			</Tabs.Content>
		</Tabs.Root>
	</aside>
	<main class="flex rounded-lg bg-surface p-2">
		<div class="flex w-full max-w-xl flex-col gap-4 rounded-md bg-card p-4">
			{#if editor.mode === "idle"}
				<!-- Here you will implement the idle state which is a Empty card from shadcn -->
				<p>Select an item or create a new one.</p>
			{:else if editor.mode === "create" && editor.type === "skin"}
				<!-- <SkinEditor /> goes here later -->
				{#key "skin-create"}
					<SkinEditor />
				{/key}
			{:else if editor.mode === "edit" && editor.type === "skin"}
				<!-- <SkinEditor skin={editor.item} /> goes here later -->
				{#key editor.id}
					<SkinEditor skin={editorSkin} />
				{/key}
			{:else if editor.mode === "create" && editor.type === "player"}
				{#key "player-create"}
					<PlayerEditor />
				{/key}
			{:else if editor.mode === "edit" && editor.type === "player"}
				{@const currentPlayerId = editor.id}
				{#key currentPlayerId}
					<PlayerEditor
						player={editorPlayer}
						onassign={() => (editor = { mode: "assign", playerId: currentPlayerId })}
					/>
				{/key}
			{:else if editor.mode === "assign"}
				{@const playerId = editor.playerId}
				{@const assignPlayer = data.players.find((p) => p._id === playerId)}
				{#if assignPlayer}
					<PlayerSkinAssignment
						player={assignPlayer}
						allSkins={data.skins}
						onback={() => (editor = { mode: "edit", type: "player", id: playerId })}
					/>
				{/if}
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
