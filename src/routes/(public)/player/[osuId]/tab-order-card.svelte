<script lang="ts">
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import { moveVisibleTab, type ProfileTab } from "$lib/profile-tabs";
	import Card from "$comp/card.svelte";

	let {
		order,
		visible,
		onReorder
	}: {
		order: ProfileTab[];
		visible: ProfileTab[];
		onReorder: (order: ProfileTab[]) => void;
	} = $props();

	const LABELS: Record<ProfileTab, string> = { skins: "Skins", about: "About", setup: "Setup" };

	const move = (from: number, to: number) => onReorder(moveVisibleTab(order, visible, from, to));
</script>

<Card title="Tab order" level={2}>
	<p class="text-body text-text-muted">
		Move tabs here or drag them on the tab bar. The first one opens by default.
	</p>
	<ol class="flex flex-col gap-2">
		{#each visible as tab, i (tab)}
			<li class="flex min-h-11 items-center gap-2 rounded-md bg-layer-2 pr-1 pl-3">
				<span class="w-5 text-caption text-text-muted">{i + 1}</span>
				<span class="flex-1 text-body-strong">{LABELS[tab]}</span>
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label="Move {LABELS[tab]} up"
					disabled={i === 0}
					onclick={() => move(i, i - 1)}
				>
					<Icon name="arrow-up" />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label="Move {LABELS[tab]} down"
					disabled={i === visible.length - 1}
					onclick={() => move(i, i + 1)}
				>
					<Icon name="arrow-down" />
				</Button>
			</li>
		{/each}
	</ol>
</Card>
