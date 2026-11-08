<script lang="ts">
	import { goto } from "$app/navigation";
	import Icon from "$comp/icon.svelte";
	import { osuAvatar } from "$lib/osu";
	import {
		PLAYER_FILTERS,
		SKIN_FILTERS,
		recentlyEdited,
		skinCountByPlayer,
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
				href: `/dashboard/players?filter=${f.id}`,
				count: data.players.filter((p) => f.test(p, { skinCounts, now })).length
			})),
			...SKIN_FILTERS.map((f) => ({
				label: SKIN_LABELS[f.id],
				href: `/dashboard/skins?filter=${f.id}`,
				count: data.skins.filter((s) => f.test(s)).length
			}))
		];
		return rows.filter((r) => r.count > 0);
	});

	function ago(time: number | undefined): string {
		if (time === undefined) return "";
		const min = Math.floor((Date.now() - time) / 60000);
		if (min < 1) return "just now";
		if (min < 60) return `${min} min ago`;
		const h = Math.floor(min / 60);
		if (h < 24) return `${h} h ago`;
		const d = Math.floor(h / 24);
		if (d < 30) return `${d} d ago`;
		const mo = Math.floor(d / 30);
		return mo < 12 ? `${mo} mo ago` : `${Math.floor(d / 365)} y ago`;
	}
</script>

<!-- Players and Skins routes arrive in later tasks, so their hrefs can't go through the typed resolve() yet. -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->

<div class="scroll-list h-full overflow-y-auto p-4 md:p-6">
	<div class="mx-auto flex max-w-3xl flex-col gap-6">
		<h1 class="text-xl font-semibold">Home</h1>

		<div class="grid grid-cols-2 gap-4">
			<button
				type="button"
				class="flex min-h-16 items-center gap-3 rounded-2xl bg-accent-color p-4 text-left font-medium text-surface"
				onclick={() => (playerDialogOpen = true)}
			>
				<Icon name="user-plus" />
				New player
			</button>
			<button
				type="button"
				class="flex min-h-16 items-center gap-3 rounded-2xl bg-layer-2 p-4 text-left font-medium"
				onclick={() => (skinDialogOpen = true)}
			>
				<Icon name="plus" />
				New skin
			</button>
		</div>

		<section class="flex flex-col gap-3">
			<h2 class="text-sm font-medium text-text-muted">Recently edited</h2>
			<ul class="flex flex-col gap-2">
				{#each recent as item (item.kind + item.doc._id)}
					<li>
						<a
							href={item.kind === "player"
								? `/dashboard/players/${item.doc._id}`
								: `/dashboard/skins/${item.doc._id}`}
							class="flex min-h-14 items-center gap-3 rounded-xl bg-layer-1 p-3 hover:bg-layer-2"
						>
							{#if item.kind === "player"}
								<img
									src={osuAvatar(item.doc.osu_id)}
									alt=""
									class="size-10 shrink-0 rounded-full bg-layer-3 object-cover"
								/>
							{:else}
								<div class="h-10 w-16 shrink-0 overflow-hidden rounded-lg bg-layer-3">
									{#if item.doc.preview_images[0]}
										<img src={item.doc.preview_images[0]} alt="" class="size-full object-cover" />
									{/if}
								</div>
							{/if}
							<span class="min-w-0 flex-1 truncate font-medium">{item.doc.name}</span>
							<span class="shrink-0 text-xs text-text-muted">
								{item.kind === "player" ? "Player" : "Skin"}
								{#if item.doc.updated_at !== undefined}
									· {ago(item.doc.updated_at)}
								{/if}
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-sm font-medium text-text-muted">Needs attention</h2>
			{#if attention.length === 0}
				<p class="text-text-muted">All good.</p>
			{:else if layoutCtx.isDesktop}
				<ul class="flex flex-col gap-2">
					{#each attention as row (row.href)}
						<li>
							<a
								href={row.href}
								class="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-layer-1 p-3 hover:bg-layer-2"
							>
								<span>{row.label}</span>
								<span class="font-medium text-accent-color">{row.count}</span>
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
								class="flex min-h-24 w-40 flex-col justify-between rounded-2xl bg-layer-1 p-4"
							>
								<span class="text-2xl font-semibold text-accent-color">{row.count}</span>
								<span class="text-sm text-text-muted">{row.label}</span>
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
</div>

<PlayerCreatorDialog
	bind:open={playerDialogOpen}
	onCreated={(id) => goto("/dashboard/players/" + id)}
/>
<SkinCreatorDialog bind:open={skinDialogOpen} onCreated={(id) => goto("/dashboard/skins/" + id)} />
