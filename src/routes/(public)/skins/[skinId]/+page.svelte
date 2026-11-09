<script lang="ts">
	import Time from "svelte-time/Time.svelte";
	import { resolve } from "$app/paths";
	import Avatar from "$comp/avatar.svelte";
	import Card from "$comp/card.svelte";
	import Icon from "$comp/icon.svelte";
	import ImageCarousel from "$comp/image-carousel.svelte";
	import PageHeading from "$comp/page-heading.svelte";
	import ListRow from "$comp/list-row.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import Separator from "$comp/ui/separator/separator.svelte";
	import { useCopyLink } from "$lib/hooks/copy-link.svelte";

	let { data } = $props();
	const clipboard = useCopyLink();

	function handleDownload() {
		fetch(resolve("/api/skins/[id]/download", { id: data.skin._id }), {
			method: "POST"
		});
	}
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
		<Card class="w-full">
			<div class="flex w-full items-start justify-between gap-4">
				<div class="flex flex-col gap-1">
					<h1 class="text-page-title text-text">{data.skin.name}</h1>
					<span class="flex gap-2">
						{#if data.skin.author}
							<p class="text-caption text-text-muted">by {data.skin.author}</p>

							<Separator
								orientation="vertical"
								class="bg-layer-5 data-[orientation=vertical]:h-4"
							/>
						{/if}

						<span class="flex items-center gap-1 text-caption text-text-muted">
							<Icon name="arrow-down-to-line" class="size-4" />
							{data.skin.download_count}
						</span>

						<Separator orientation="vertical" class="bg-layer-5 data-[orientation=vertical]:h-4" />

						<span class="flex items-center gap-1 text-caption text-text-muted">
							<Icon name="cloud-upload" class="size-4" />
							<Time relative live timestamp={data.skin._creationTime} />
						</span>
					</span>
				</div>
				<div class="flex flex-col items-center gap-2">
					<span class="flex gap-1">
						<Button href={data.skin.download_url} onclick={handleDownload} target="_blank">
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
		</Card>

		{#if data.skin.players.length > 0}
			<Card
				class="w-full"
				title="Used by {data.skin.players.length} {data.skin.players.length === 1
					? 'player'
					: 'players'}"
				icon="users"
				level={2}
			>
				<div class="common-grid">
					{#each data.skin.players as player (player._id)}
						<ListRow
							href={resolve("/(public)/player/[osuId]", { osuId: String(player.osu_id) })}
							class="rounded-md bg-layer-2 hover:bg-layer-3"
						>
							{#snippet leading()}
								<Avatar size={40} osuId={player.osu_id} />
							{/snippet}
							<p class="truncate text-body-strong text-text">{player.name}</p>
						</ListRow>
					{/each}
				</div>
			</Card>
		{:else}
			<p class="text-caption text-text-muted">No players are using this skin yet.</p>
		{/if}
	</section>
</main>
