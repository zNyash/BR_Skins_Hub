<script lang="ts">
	import { setContext } from "svelte";
	import { MediaQuery } from "svelte/reactivity";
	import {
		DEFAULT_LAYOUT,
		RAIL,
		serializeLayout,
		showPinned,
		type DashboardLayout
	} from "$lib/dashboard-layout";
	import BottomTabs from "./shell/bottom-tabs.svelte";
	import Rail from "./shell/rail.svelte";
	import UnsavedBar from "./unsaved-bar.svelte";

	let { data, children } = $props();

	// svelte-ignore state_referenced_locally
	let layout = $state<DashboardLayout>({ ...data.layout });
	let innerWidth = $state<number>();
	// Wide by default so the server renders the saved (pinned) sidebar without a flash.
	const desktop = new MediaQuery("min-width: 900px", true);

	const pinned = $derived(desktop.current && showPinned(layout, innerWidth ?? Infinity));

	function save() {
		document.cookie = serializeLayout($state.snapshot(layout));
	}

	function setRail(px: number | null) {
		layout.rail = px ?? DEFAULT_LAYOUT.rail;
		save();
	}

	function setEditor(px: number | null) {
		layout.editor = px ?? DEFAULT_LAYOUT.editor;
		save();
	}

	function togglePin() {
		layout.pinned = !layout.pinned;
		save();
	}

	setContext("dashboard-layout", {
		get layout() {
			return layout;
		},
		get isDesktop() {
			return desktop.current;
		},
		setEditor
	});

	function onKeydown(event: KeyboardEvent) {
		if (
			event.repeat ||
			!desktop.current ||
			!(event.ctrlKey || event.metaKey) ||
			event.key.toLowerCase() !== "b"
		)
			return;
		const target = event.target as HTMLElement | null;
		if (target?.closest("input, textarea, select, [contenteditable]:not([contenteditable=false])"))
			return;
		event.preventDefault();
		togglePin();
	}
</script>

<svelte:window bind:innerWidth onkeydown={onKeydown} />

<div class="flex h-full">
	{#if desktop.current}
		<Rail
			{pinned}
			width={layout.rail}
			min={RAIL.min}
			max={RAIL.max}
			playerCount={data.players.length}
			skinCount={data.skins.length}
			onResize={(px) => (layout.rail = px)}
			onCommit={setRail}
			onTogglePin={togglePin}
		/>
	{/if}
	<div class="flex min-w-0 flex-1 flex-col">
		<div class="relative min-h-0 flex-1">
			{@render children()}
			<UnsavedBar />
		</div>
		{#if !desktop.current}
			<BottomTabs />
		{/if}
	</div>
</div>
