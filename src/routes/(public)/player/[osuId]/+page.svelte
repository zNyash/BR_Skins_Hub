<script lang="ts">
	import SearchSorted from "$comp/search-sorted.svelte";
	import SkinCard from "$comp/skin-card.svelte";
	import {
		SKIN_SORT_OPTIONS,
		POPOVER_SETTINGS,
		type OrderBy,
		type SkinSortBy
	} from "$lib/constants.js";
	import { useFuzzyFilter } from "$lib/utils/fuzzyFilter.svelte.js";
	import { useSorted } from "$lib/utils/sorted.svelte.js";
	import { osuAvatar } from "$lib/utils/osu.js";
	import * as Popover from "$comp/ui/popover/index.js";

	let { data } = $props();

	let inputValue = $state("");
	let sortBy = $state<SkinSortBy>("date");
	let orderBy = $state<OrderBy>("desc");

	const filtered = useFuzzyFilter(
		() => data.skins,
		() => inputValue,
		{ keys: ["name"], threshold: 0.4 }
	);
	const sorted = useSorted(
		() => filtered.results,
		() => sortBy,
		() => orderBy,
		SKIN_SORT_OPTIONS
	);

	let isCoverLoaded = $state(true);

	function handleImageError(e: Event) {
		(e.currentTarget as HTMLImageElement).style.opacity = "0";
		isCoverLoaded = false;
	}
</script>

<main class="main">
	<section class="section">
		<div class="relative">
			<div class="relative">
				<div
					class="absolute inset-0 flex items-center justify-center {isCoverLoaded
						? 'to-75 bg-linear-to-t from-background from-0% to-transparent'
						: 'rounded-lg bg-card'}"
				>
					{#if !isCoverLoaded}
						<p>The player needs to login again to update their banner.</p>
					{/if}
				</div>
				<img
					src={data.player.cover_url}
					alt=""
					class="h-62 w-full rounded-lg object-cover"
					onerror={handleImageError}
				/>
			</div>
			<div class="-mt-14 flex w-full items-center justify-between px-12">
				<div class="flex items-end gap-2">
					<img
						src={osuAvatar(data.player.osu_id)}
						alt="{data.player.name} Profile Picture"
						class="size-28 shape-squircle rounded-3xl object-cover drop-shadow-lg"
					/>
					<Popover.Root>
						<Popover.Trigger {...POPOVER_SETTINGS} class="text-start">
							<p class="text-2xl font-bold">{data.player.name}</p>
						</Popover.Trigger>
						<Popover.Content class="w-fit px-2 py-1 outline outline-border">
							<p class="text-sm">{data.player.previous_usernames?.join(", ")}</p>
						</Popover.Content>
					</Popover.Root>
				</div>
			</div>
		</div>
	</section>
	<section class="section">
		<div class="flex w-full items-center justify-between">
			<SearchSorted
				placeholder="Search skins by name..."
				sortOptions={SKIN_SORT_OPTIONS}
				bind:sortBy
				bind:orderBy
				bind:inputValue
			/>
			<p class="text-xs">Loaded {data.skins.length} {data.skins.length === 1 ? "skin" : "skins"}</p>
		</div>
		<div class="common-grid">
			{#each sorted.results as skin (skin._id)}
				<SkinCard {skin} />
			{/each}
		</div>
	</section>
</main>
