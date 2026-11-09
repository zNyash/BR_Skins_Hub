<script lang="ts">
	import type { ProfileTab } from "$lib/profile-tabs";
	import type { PlayerWithSkins } from "$lib/types";
	import ColorsCard from "./colors-card.svelte";
	import LinksCard from "./links-card.svelte";
	import PreferencesCard from "./preferences-card.svelte";
	import TabOrderCard from "./tab-order-card.svelte";

	let {
		player,
		order,
		visible,
		onReorder
	}: {
		player: PlayerWithSkins;
		order: ProfileTab[];
		visible: ProfileTab[];
		onReorder: (order: ProfileTab[]) => void;
	} = $props();
</script>

<div role="tabpanel" class="flex flex-col gap-3">
	<p class="text-body text-text-muted">Only you can see this tab.</p>
	<!-- Fixed layout: Colors, Links / Tab order, Preferences. One column on narrow screens. -->
	<div class="grid grid-cols-1 items-stretch gap-4 min-[760px]:grid-cols-2">
		<ColorsCard {player} />
		<LinksCard {player} />
		<TabOrderCard {order} {visible} {onReorder} />
		<PreferencesCard />
	</div>
</div>
