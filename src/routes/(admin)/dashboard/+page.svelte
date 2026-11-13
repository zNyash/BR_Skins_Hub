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
	import DeviceCreatorDialog from "./dialogs/device-creator-dialog.svelte";
	import LinkDeviceDialog from "./dialogs/link-device-dialog.svelte";
	import PlayerCreatorDialog from "./dialogs/player-creator-dialog.svelte";
	import SkinCreatorDialog from "./dialogs/skin-creator-dialog.svelte";
	import { linkGroups, type LinkGroup } from "./setup-link-groups";
	import Button from "$comp/ui/button/button.svelte";
	import { DEVICE_ICONS } from "$lib/devices";
	import { getContext } from "svelte";

	let { data } = $props();

	// Keep the context object: isDesktop is a getter and must be read reactively.
	const layoutCtx = getContext<{ isDesktop: boolean }>("dashboard-layout");

	let playerDialogOpen = $state(false);
	let skinDialogOpen = $state(false);

	let linking = $state<LinkGroup | null>(null);
	let creatingFor = $state<LinkGroup | null>(null);
	let deviceDialogOpen = $state(false);

	const groups = $derived(linkGroups(data.players, data.devices));
	const groupSetups = $derived(groups.reduce((sum, g) => sum + g.cards.length, 0));

	function groupCaption(g: LinkGroup) {
		const n = g.cards.length;
		const count = `${n} ${n === 1 ? "setup" : "setups"}`;
		if (g.allKept) return `${count} · the player removed the link, kept as typed`;
		if (!g.closest) return `${count} · not in the catalog`;
		return `${count} · typed as ${g.variants.map((v) => `“${v}”`).join(", ")}`;
	}

	function createFor(g: LinkGroup) {
		creatingFor = g;
		deviceDialogOpen = true;
	}

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

		{#if groups.length > 0}
			<Card title="Setups to link" icon="link" level={2}>
				{#snippet trailing()}
					<span class="text-caption text-text-muted">
						{groups.length}
						{groups.length === 1 ? "group" : "groups"} · {groupSetups}
						{groupSetups === 1 ? "setup" : "setups"}
					</span>
				{/snippet}
				<ul class="flex flex-col gap-2">
					{#each groups as group (group.type + group.key)}
						<li
							class="flex flex-col gap-3 rounded-md bg-layer-2 p-3 min-[900px]:flex-row min-[900px]:items-center"
						>
							<div class="flex min-w-0 flex-1 items-center gap-3">
								<div
									class="flex size-10 shrink-0 items-center justify-center rounded-md bg-layer-3 text-text-muted"
								>
									<Icon name={DEVICE_ICONS[group.type]} />
								</div>
								<div class="flex min-w-0 flex-col gap-1">
									<span class="truncate text-body-strong">{group.label}</span>
									<span class="text-caption text-text-muted">{groupCaption(group)}</span>
									{#if group.closest}
										<span class="flex min-w-0 items-center gap-2 text-caption text-text-muted">
											Closest:
											<span
												class="flex h-5 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-layer-4"
											>
												{#if group.closest.image_url}
													<img
														src={group.closest.image_url}
														alt=""
														class="size-full object-cover"
													/>
												{:else}
													<Icon name={DEVICE_ICONS[group.type]} class="size-3" />
												{/if}
											</span>
											<span class="truncate text-text">{group.closest.name}</span>
										</span>
									{/if}
								</div>
							</div>
							<div class="flex shrink-0 gap-2">
								{#if !group.closest}
									<Button
										type="button"
										variant="ghost"
										class="h-11 min-[900px]:h-8"
										onclick={() => createFor(group)}
									>
										<Icon name="plus" />
										Create device
									</Button>
								{/if}
								<Button
									type="button"
									variant="secondary"
									class="h-11 min-[900px]:h-8"
									onclick={() => (linking = group)}
								>
									Choose…
								</Button>
							</div>
						</li>
					{/each}
				</ul>
			</Card>
		{/if}

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
<LinkDeviceDialog group={linking} devices={data.devices} onClose={() => (linking = null)} />
<DeviceCreatorDialog
	bind:open={deviceDialogOpen}
	initial={creatingFor ? { name: creatingFor.variants[0], type: creatingFor.type } : undefined}
	onCreated={(id) => goto(resolve(`/dashboard/devices/${id}`))}
/>
