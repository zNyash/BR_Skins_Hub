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

	// ---------- State ----------
	let { data } = $props();
	let activeTab = $state<"players" | "skins">("players");

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
</script>

<PageHeading title="Dashboard" description="Admin Dashboard" />
<div class="grid h-[calc(100vh-44px)] grid-cols-[1fr_4fr] gap-2 bg-card p-2">
	<aside class="flex flex-col gap-2 overflow-y-auto rounded-lg bg-surface p-2">
		<Tabs.Root bind:value={activeTab}>
			<Tabs.List class="w-full bg-card">
				<Tabs.Trigger value="players" class="dark:data-active:bg-popover">Players</Tabs.Trigger>
				<Tabs.Trigger value="skins" class="dark:data-active:bg-popover">Skins</Tabs.Trigger>
			</Tabs.List>
		</Tabs.Root>

		<!-- Listing for Players -->
		<div class="flex flex-col gap-2">
			{#if activeTab === "players"}
				{#each sortedPlayers.results as player (player._id)}
					<ContextMenu.Root>
						<ContextMenu.Trigger>
							<div
								class="flex items-center gap-2 rounded-md bg-card p-1 ring-primary select-none hover:ring"
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
			{:else}
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
			{/if}
		</div>
	</aside>
	<main class="rounded-lg bg-surface p-2">Content for {activeTab}</main>
</div>

<style>
	aside {
		scrollbar-color: transparent transparent;
		scrollbar-width: thin;
	}
</style>
