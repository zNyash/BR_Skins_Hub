<script lang="ts">
	import Icon from "$comp/icon.svelte";
	import ImageCarousel from "$comp/image-carousel.svelte";
	import SearchSorted from "$comp/search-sorted.svelte";
	import * as Popover from "$comp/ui/popover/index.js";
	import Separator from "$comp/ui/separator/separator.svelte";
	import type { OrderBy, SortBy } from "$lib/constants.js";
	import { useFuzzyFilter } from "$lib/utils/fuzzyFilter.svelte.js";
	import Time from "svelte-time/Time.svelte";

	let { data } = $props();

	let inputValue = $state("");
	let sortBy = $state<SortBy>("date");
	let orderBy = $state<OrderBy>("desc");

	const filtered = useFuzzyFilter(
		() => data.skins,
		() => inputValue,
		{ keys: ["name"], threshold: 0.4 }
	);
	const sorted = $derived.by(() => {
		return [...filtered.results].sort((a, b) => {
			if (sortBy === "name") {
				return orderBy === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
			}
			if (sortBy === "date") {
				return orderBy === "asc"
					? a._creationTime - b._creationTime
					: b._creationTime - a._creationTime;
			}
			return 0;
		});
	});

	const popoverSettings = {
		openOnHover: true,
		openDelay: 0,
		closeDelay: 0
	};
</script>

<main class="main">
	<section class="section">
		<div class="flex w-full items-center justify-between">
			<SearchSorted
				placeholder="Search skins by name..."
				bind:sortBy
				bind:orderBy
				bind:inputValue
			/>
			<p class="text-xs">Loaded {data.skins.length} skins</p>
		</div>
		<div class="common-grid">
			{#each sorted as skin (skin._id)}
				<div
					class="flex flex-col items-center justify-center overflow-clip rounded-lg bg-card outline outline-transparent hover:outline-primary"
				>
					<ImageCarousel {skin} />

					<div class="flex w-full flex-col p-1 px-2 pb-2">
						<Popover.Root>
							<Popover.Trigger {...popoverSettings} class="text-start">
								<p class="truncate">{skin.name}</p>
							</Popover.Trigger>
							<Popover.Content class="w-fit px-2 py-1 outline outline-border">
								<p>{skin.name}</p>
							</Popover.Content>
						</Popover.Root>
						<Separator class="mt-1 mb-2 bg-border" />
						<span class="flex gap-1">
							<span class="flex gap-1">
								<Icon name="download" class="size-4 text-text-muted" />
								<p class="text-xs text-text-muted">{skin.download_count}</p>
							</span>
							<Popover.Root>
								<Popover.Trigger {...popoverSettings} class="ml-auto text-start leading-0">
									<Time
										class="text-xs text-text-muted"
										live
										relative
										timestamp={skin._creationTime}
									/>
								</Popover.Trigger>
								<Popover.Content class="w-fit px-2 py-1 outline outline-border">
									<p>{new Date(skin._creationTime).toLocaleString()}</p>
								</Popover.Content>
							</Popover.Root>
						</span>
					</div>
				</div>
			{/each}
		</div>
	</section>
</main>
