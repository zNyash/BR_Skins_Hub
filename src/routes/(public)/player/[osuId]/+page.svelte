<script lang="ts">
	import PageHeading from "$comp/page-heading.svelte";
	import Popover from "$comp/popover.svelte";
	import { osuAvatar } from "$lib/osu";
	import { claimView } from "$lib/views";
	import { openTab } from "./open-tab";
	import ProfileSidebar from "./profile-sidebar.svelte";
	import ProfileTabs from "./profile-tabs.svelte";

	let { data } = $props();

	const player = $derived(data.player);
	const isOwner = $derived(data.user?.player_id === player._id);
	// Admins can fill in anyone's Setup tab, e.g. for players who never log in.
	const canEdit = $derived(isOwner || Boolean(data.user?.isAdmin));

	// Remembers which cover failed, not just "a cover failed": moving to another player's page
	// (same component, new data) must not hide their banner too.
	let failedCover = $state<string | null>(null);
	const showCover = $derived(Boolean(player.cover_url) && player.cover_url !== failedCover);

	// Re-runs when navigating to another player (same component, new data). The owner check
	// lives on the server; a failed count is ignored since the visitor can't act on it.
	$effect(() => {
		if (claimView(player._id)) {
			fetch(`/api/players/${player._id}/views`, { method: "POST" }).catch(() => {});
		}
	});
</script>

<PageHeading
	title="{player.name} · player info"
	description="All skins {player.name} uses!"
	image={osuAvatar(player.osu_id)}
/>
<main class="main">
	<header class="w-full max-w-6xl px-2">
		<!-- osu! profile covers are 2400×640, so the banner keeps that shape and only scales. -->
		<div class="relative aspect-[2400/640] w-full overflow-hidden rounded-lg">
			{#if showCover}
				<img
					src={player.cover_url}
					alt=""
					class="size-full object-cover"
					onerror={() => (failedCover = player.cover_url ?? null)}
				/>
			{:else}
				<div class="flex size-full items-center justify-center bg-primary/25">
					{#if isOwner}
						<p class="text-sm">Log in again to update your banner.</p>
					{/if}
				</div>
			{/if}
			<div
				class="pointer-events-none absolute inset-0 bg-linear-to-t from-background to-transparent to-60%"
			></div>
		</div>

		<div class="relative -mt-10 flex items-end gap-3 px-4 sm:-mt-16 sm:gap-4 sm:px-10">
			<a href={`https://osu.ppy.sh/users/${player.osu_id}`} target="_blank" class="shrink-0">
				<img
					src={osuAvatar(player.osu_id)}
					alt="{player.name} Profile Picture"
					class="size-20 shape-squircle rounded-3xl border-2 border-layer-3 object-cover drop-shadow-lg sm:size-28"
				/>
			</a>
			{#if player.previous_usernames && player.previous_usernames.length > 0}
				<Popover class="px-2 py-1">
					{#snippet trigger(props)}
						<button {...props} type="button" class="pb-1 text-start">
							<h1 class="text-xl font-bold sm:text-2xl">{player.name}</h1>
						</button>
					{/snippet}
					<p class="text-sm">{player.previous_usernames.join(", ")}</p>
				</Popover>
			{:else}
				<h1 class="pb-1 text-xl font-bold sm:text-2xl">{player.name}</h1>
			{/if}
		</div>
	</header>

	<div class="mt-4 flex w-full max-w-6xl flex-wrap items-start gap-7 px-2">
		<ProfileSidebar {player} {isOwner} onReadMore={() => openTab("about")} />
		<ProfileTabs {player} {isOwner} {canEdit} />
	</div>
</main>
