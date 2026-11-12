<script lang="ts">
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import Avatar from "$comp/avatar.svelte";
	import Card from "$comp/card.svelte";
	import EmptyState from "$comp/empty-state.svelte";
	import Icon from "$comp/icon.svelte";
	import {
		PLAYER_FILTERS,
		SKIN_FILTERS,
		recentlyEdited,
		skinCountByPlayer,
		timeAgo,
		type PlayerFilter,
		type SkinFilter
	} from "./derive";
	import PlayerCreatorDialog from "./dialogs/player-creator-dialog.svelte";
	import SkinCreatorDialog from "./dialogs/skin-creator-dialog.svelte";
	import { getContext } from "svelte";

	let { data } = $props();

	// Keep the context object: isDesktop is a getter and must be read reactively.
	const layoutCtx = getContext<{ isDesktop: boolean }>("dashboard-layout");

	let playerDialogOpen = $state(false);
	let skinDialogOpen = $state(false);

	const PLAYER_LABELS: Record<PlayerFilter, string> = {
		"no-skins": "Players with no skins",
		"no-setup": "Players with no setup",
		"not-synced": "Not synced with osu! in 30 days"
	};
	const SKIN_LABELS: Record<SkinFilter, string> = {
		"no-players": "Skins with no players",
		"no-images": "Skins with no images"
	};

	const recent = $derived(recentlyEdited(data.players, data.skins, 6));

	const attention = $derived.by(() => {
		const skinCounts = skinCountByPlayer(data.skins);
		const now = Date.now();
		const rows = [
			...PLAYER_FILTERS.map((f) => ({
				label: PLAYER_LABELS[f.id],
				href: `${resolve("/dashboard/players")}?filter=${f.id}`,
				count: data.players.filter((p) => f.test(p, { skinCounts, now })).length
			})),
			...SKIN_FILTERS.map((f) => ({
				label: SKIN_LABELS[f.id],
				href: `${resolve("/dashboard/skins")}?filter=${f.id}`,
				count: data.skins.filter((s) => f.test(s)).length
			}))
		];
		return rows.filter((r) => r.count > 0);
	});
</script>

<!-- Needs attention links are resolve() plus a ?filter query, which the rule can't follow. -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->

<div class="h-full overflow-y-auto p-4 md:p-6">
	<div class="mx-auto flex max-w-3xl flex-col gap-6">
		<h1 class="text-page-title">Home</h1>

		<div class="grid grid-cols-2 gap-4">
			<button
				type="button"
				class="flex min-h-16 items-center gap-3 rounded-lg bg-accent-color p-4 text-left text-body-strong text-on-accent transition-[filter] duration-fast hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-color"
				onclick={() => (playerDialogOpen = true)}
			>
				<Icon name="user-plus" />
				New player
			</button>
			<button
				type="button"
				class="flex min-h-16 items-center gap-3 rounded-lg bg-layer-1 p-4 text-left text-body-strong transition-colors duration-fast hover:bg-layer-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-color"
				onclick={() => (skinDialogOpen = true)}
			>
				<Icon name="plus" />
				New skin
			</button>
		</div>

		<Card title="Recently edited" icon="history" level={2}>
			{#if recent.length === 0}
				<EmptyState icon="history" title="Nothing edited yet" />
			{:else}
				<ul class="flex flex-col gap-2">
					{#each recent as item (item.kind + item.doc._id)}
						<li>
							<a
								href={item.kind === "player"
									? resolve(`/dashboard/players/${item.doc._id}`)
									: resolve(`/dashboard/skins/${item.doc._id}`)}
								class="flex min-h-16 items-center gap-3 rounded-md bg-layer-2 p-3 transition-colors duration-fast hover:bg-layer-3"
							>
								{#if item.kind === "player"}
									<Avatar osuId={item.doc.osu_id} size="sm" />
								{:else}
									<div class="h-10 w-16 shrink-0 overflow-hidden rounded-md bg-layer-3">
										{#if item.doc.preview_images[0]}
											<img src={item.doc.preview_images[0]} alt="" class="size-full object-cover" />
										{/if}
									</div>
								{/if}
								<span class="min-w-0 flex-1 truncate text-body-strong">{item.doc.name}</span>
								<span class="shrink-0 text-caption text-text-muted">
									{item.kind === "player" ? "Player" : "Skin"}
									{#if item.doc.updated_at !== undefined}
										· {timeAgo(item.doc.updated_at, Date.now())}
									{/if}
								</span>
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</Card>

		<Card title="Needs attention" icon="circle-alert" level={2}>
			{#if attention.length === 0}
				<EmptyState icon="circle-check" title="All good" />
			{:else if layoutCtx.isDesktop}
				<ul class="flex flex-col gap-2">
					{#each attention as row (row.href)}
						<li>
							<a
								href={row.href}
								class="flex min-h-12 items-center justify-between gap-3 rounded-md bg-layer-2 p-3 text-body transition-colors duration-fast hover:bg-layer-3"
							>
								<span>{row.label}</span>
								<span class="text-body-strong text-accent-color tabular-nums">{row.count}</span>
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<ul class="-mx-4 no-scrollbar flex snap-x gap-3 overflow-x-auto px-4">
					{#each attention as row (row.href)}
						<li class="shrink-0 snap-start">
							<a
								href={row.href}
								class="flex min-h-24 w-40 flex-col justify-between gap-2 rounded-md bg-layer-2 p-3"
							>
								<span class="text-value-lg text-accent-color tabular-nums">{row.count}</span>
								<span class="text-caption text-text-muted">{row.label}</span>
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</Card>
	</div>
</div>

<PlayerCreatorDialog
	bind:open={playerDialogOpen}
	onCreated={(id) => goto(resolve(`/dashboard/players/${id}`))}
/>
<SkinCreatorDialog
	bind:open={skinDialogOpen}
	onCreated={(id) => goto(resolve(`/dashboard/skins/${id}`))}
/>
