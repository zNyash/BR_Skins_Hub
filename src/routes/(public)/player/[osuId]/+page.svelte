<script lang="ts">
	import PageHeading from "$comp/page-heading.svelte";
	import SearchSorted from "$comp/search-sorted.svelte";
	import SkinCard from "$comp/skin-card.svelte";
	import * as Popover from "$comp/ui/popover";
	import { POPOVER_SETTINGS } from "$lib/constants";
	import { SKIN_LIST, useListQuery } from "$lib/hooks/list-query.svelte";
	import { osuAvatar } from "$lib/osu";

	let { data } = $props();

	const skins = useListQuery(() => data.player.skins, SKIN_LIST);

	let isCoverLoaded = $state(true);

	function handleImageError(e: Event) {
		(e.currentTarget as HTMLImageElement).style.opacity = "0";
		isCoverLoaded = false;
	}
</script>

<PageHeading
	title="{data.player.name} · player info"
	description="All skins {data.player.name} uses!"
	image={osuAvatar(data.player.osu_id)}
/>
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
					<a href={`https://osu.ppy.sh/users/${data.player.osu_id}`} target="_blank">
						<img
							src={osuAvatar(data.player.osu_id)}
							alt="{data.player.name} Profile Picture"
							class="size-28 shape-squircle rounded-3xl object-cover drop-shadow-lg"
						/>
					</a>
					{#if data.player.previous_usernames && data.player.previous_usernames.length > 0}
						<Popover.Root>
							<Popover.Trigger {...POPOVER_SETTINGS} class="text-start">
								<p class="text-2xl font-bold">{data.player.name}</p>
							</Popover.Trigger>
							<Popover.Content class="w-fit px-2 py-1 outline outline-border">
								<p class="text-sm">{data.player.previous_usernames?.join(", ")}</p>
							</Popover.Content>
						</Popover.Root>
					{:else}
						<p class="text-2xl font-bold">{data.player.name}</p>
					{/if}
				</div>
			</div>
		</div>
	</section>
	<section class="section">
		<div class="flex w-full items-center justify-between">
			<SearchSorted list={skins} placeholder="Search skins by name..." />
			<p class="text-xs">Loaded {data.player.skins.length} {data.player.skins.length === 1 ? "skin" : "skins"}</p>
		</div>
		<div class="common-grid">
			{#each skins.results as skin (skin._id)}
				<SkinCard {skin} />
			{/each}
		</div>
	</section>
</main>
