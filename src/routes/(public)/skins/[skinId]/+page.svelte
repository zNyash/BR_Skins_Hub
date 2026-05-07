<script lang="ts">
	import { resolve } from "$app/paths";
	import Icon from "$comp/icon.svelte";
	import ImageCarousel from "$comp/image-carousel.svelte";
	import PlayerCard from "$comp/player-card.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import Separator from "$comp/ui/separator/separator.svelte";
	import Time from "svelte-time/Time.svelte";

	import { useCopyLink } from "$lib/utils/clipboard.svelte";
	import PageHeading from "$comp/page-heading.svelte";

	let { data } = $props();
	const clipboard = useCopyLink();
</script>

<PageHeading
	title="{data.skin.name} · skin info"
	description="{data.skin.name} osu skin"
	image={data.skin.preview_images[0]}
/>
<main class="main">
	<!-- Preview -->
	<section class="section">
		<div class="overflow-hidden rounded-lg">
			<ImageCarousel skin={data.skin} linked={false} />
		</div>
	</section>

	<!-- Info + players -->
	<section class="section">
		<div class="flex w-full items-start justify-between gap-4">
			<div class="flex flex-col gap-1">
				<h1 class="text-2xl font-bold">{data.skin.name}</h1>
				<span class="flex gap-2">
					{#if data.skin.author}
						<p class="text-sm text-text-muted">by {data.skin.author}</p>

						<Separator orientation="vertical" class="bg-border data-[orientation=vertical]:h-4" />
					{/if}

					<span class="flex items-center gap-1 text-sm text-text-muted">
						<Icon name="arrow-down-to-line" class="size-4" />
						{data.skin.download_count}
					</span>

					<Separator orientation="vertical" class="bg-border data-[orientation=vertical]:h-4" />

					<span class="flex items-center gap-1 text-sm text-text-muted">
						<Icon name="cloud-upload" class="size-4" />
						<Time relative live timestamp={data.skin._creationTime} />
					</span>
				</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<span class="flex gap-1">
					<Button href={data.skin.download_url} target="_blank">
						<Icon name="download" class="size-4" />
						Download
					</Button>
					<Button
						variant="secondary"
						onclick={() => clipboard.copy(`${window.location.origin}/skins/${data.skin._id}`)}
						class={clipboard.copied
							? " bg-success/20 text-success transition-colors"
							: "transition-colors"}
					>
						<Icon name={clipboard.copied ? "check" : "copy"} class="size-4" />
					</Button>
				</span>
			</div>
		</div>

		<Separator class="bg-border" />

		{#if data.players.length > 0}
			<div class="flex flex-col gap-2">
				<p class="text-sm text-text-muted">
					Used by {data.players.length}
					{data.players.length === 1 ? "player" : "players"}
				</p>
				<div class="common-grid">
					{#each data.players as player (player._id)}
						<a href={resolve("/(public)/player/[osuId]", { osuId: String(player.osu_id) })}>
							<PlayerCard {player} />
						</a>
					{/each}
				</div>
			</div>
		{:else}
			<p class="text-sm text-text-muted">No players are using this skin yet.</p>
		{/if}
	</section>
</main>
