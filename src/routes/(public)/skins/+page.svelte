<script lang="ts">
	import Icon from "$comp/icon.svelte";
	import ImageCarousel from "$comp/image-carousel.svelte";
	import * as Popover from "$comp/ui/popover/index.js";
	import Separator from "$comp/ui/separator/separator.svelte";
	import Time from "svelte-time/Time.svelte";

	let { data } = $props();
</script>

<main class="main">
	<div class="common-grid">
		{#each data.skins as skin (skin._id)}
			<div
				class="flex flex-col items-center justify-center overflow-clip rounded-lg bg-card outline outline-transparent hover:outline-primary"
			>
				<ImageCarousel {skin} />

				<div class="flex w-full flex-col p-1 px-2 pb-2">
					<Popover.Root>
						<Popover.Trigger
							openOnHover
							openDelay={0}
							closeDelay={0}
							class="w-fit appearance-none text-start data-[state=open]:outline data-[state=open]:outline-primary data-[state=open]:outline-dashed "
						>
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
						<Time
							class="ml-auto text-xs text-text-muted"
							live
							relative
							timestamp={skin._creationTime}
						/>
					</span>
				</div>
			</div>
		{/each}
	</div>
</main>
