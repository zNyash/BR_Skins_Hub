<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import PageHeading from "$comp/page-heading.svelte";
	import { osuAvatar } from "$lib/osu";
	import ProfileSidebar from "./profile-sidebar.svelte";
	import ProfileTabs from "./profile-tabs.svelte";

	let { data } = $props();

	const isOwner = $derived(data.user?.player_id === data.player._id);

	let editing = $state(false);
	const edit = () => (editing = true);

	function readMore() {
		const url = new URL(page.url);
		url.searchParams.set("tab", "about");
		goto(url, { replaceState: true, noScroll: true, keepFocus: true });
	}

	let isCoverLoaded = $state(true);
</script>

<PageHeading
	title="{data.player.name} · player info"
	description="All skins {data.player.name} uses!"
	image={osuAvatar(data.player.osu_id)}
/>
<main class="main">
	<div class="relative h-52 overflow-hidden rounded-lg">
		{#if isCoverLoaded && data.player.cover_url}
			<img
				src={data.player.cover_url}
				alt=""
				class="size-full object-cover"
				onerror={() => (isCoverLoaded = false)}
			/>
			<div class="absolute inset-0 bg-linear-to-t from-background to-transparent to-60%"></div>
		{:else}
			<div class="flex size-full items-center justify-center bg-primary/25">
				{#if isOwner}
					<p class="text-sm">Log in again to update your banner.</p>
				{/if}
			</div>
		{/if}
	</div>

	<div class="flex flex-wrap items-start gap-7 px-2">
		<ProfileSidebar player={data.player} {isOwner} onEdit={edit} onReadMore={readMore} />
		<ProfileTabs player={data.player} {isOwner} onEdit={edit} />
	</div>
</main>
