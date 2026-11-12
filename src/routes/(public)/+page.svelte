<script lang="ts">
	import { resolve } from "$app/paths";
	import PageHeading from "$comp/page-heading.svelte";
	import Avatar from "$comp/avatar.svelte";
	import ListRow from "$comp/list-row.svelte";
	import SearchToolbar from "$comp/search-toolbar.svelte";
	import { PLAYER_LIST, useListQuery } from "$lib/hooks/list-query.svelte";

	let { data } = $props();
	const players = useListQuery(() => data.players, PLAYER_LIST);

	export const snapshot = {
		capture: () => ({ query: players.query, sortBy: players.sortBy, orderBy: players.orderBy }),
		restore: (value) => Object.assign(players, value)
	};
</script>

<PageHeading title="Players Listing" />
<main class="main">
	<section class="section">
		<SearchToolbar
			list={players}
			placeholder="Search players by name or ID..."
			total={data.players.length}
		/>
		<div class="common-grid">
			{#each players.results as player (player._id)}
				<ListRow
					href={resolve(`/(public)/player/[osuId]`, { osuId: String(player.osu_id) })}
					backgroundImage={player.cover_url}
				>
					{#snippet leading()}
						<Avatar size="sm" osuId={player.osu_id} />
					{/snippet}
					<p class="truncate text-body-strong text-text">{player.name}</p>
				</ListRow>
			{/each}
		</div>
	</section>
</main>
