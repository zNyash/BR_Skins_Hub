<script lang="ts">
	import { getContext, type Snippet } from "svelte";
	import Icon from "$comp/icon.svelte";
	import { EDITOR, type DashboardLayout } from "$lib/dashboard-layout";
	import { resizable } from "$lib/resizable";

	/**
	 * A list page: the list and the editor side by side on desktop (the editor's left edge resizes
	 * it), or the list alone on the phone with the editor in a bottom drawer while an item is open.
	 */
	let {
		list,
		editor,
		hasItem,
		onClose
	}: { list: Snippet; editor: Snippet; hasItem: boolean; onClose: () => void } = $props();

	// Keep the context object: its fields are getters and must be read reactively.
	const ctx = getContext<{
		layout: DashboardLayout;
		isDesktop: boolean;
		setEditor: (px: number | null) => void;
	}>("dashboard-layout");

	const SWIPE_CLOSE_PX = 120;

	// The saved width is only the editor's maximum: when the list runs out of room the editor is
	// narrower, and a drag must start from what is on screen.
	let editorWidth = $state<number>();

	// --- Drawer swipe (phone) ---
	let swipePointer = $state(-1);
	let swipeStartY = 0;
	let swipeDy = $state(0);

	function onSwipeStart(event: PointerEvent) {
		if (swipePointer !== -1 || (event.target as HTMLElement).closest("button")) return;
		swipePointer = event.pointerId;
		swipeStartY = event.clientY;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function onSwipeMove(event: PointerEvent) {
		if (event.pointerId !== swipePointer) return;
		// Only downwards: the drawer can't be pulled above its top.
		swipeDy = Math.max(0, event.clientY - swipeStartY);
	}

	function onSwipeEnd(event: PointerEvent) {
		if (event.pointerId !== swipePointer) return;
		swipePointer = -1;
		const close = event.type === "pointerup" && swipeDy > SWIPE_CLOSE_PX;
		swipeDy = 0;
		if (close) onClose();
	}
</script>

<!--
	One tree for both layouts: only classes change when `isDesktop` flips (resizing across 900px),
	so the editor subtree, and the unsaved draft created inside it, is never remounted. The resize
	handle and the drawer chrome are conditional siblings of the editor, not its parents.
-->
<div class={ctx.isDesktop ? "flex h-full" : "h-full"}>
	<div
		class={ctx.isDesktop
			? "flex min-w-0 flex-col gap-3 py-4 pl-4"
			: "flex h-full flex-col gap-3 p-4"}
		style:flex={ctx.isDesktop ? "1 0 360px" : undefined}
	>
		{@render list()}
	</div>
	{#if !ctx.isDesktop && hasItem}
		<div class="fixed inset-0 z-30 bg-overlay" aria-hidden="true"></div>
	{/if}
	<!-- On the phone with nothing open the editor (the "Select a …" page) stays mounted but hidden. -->
	<div
		class={ctx.isDesktop
			? "relative min-w-[440px] p-4"
			: [
					"fixed inset-x-0 top-24 bottom-0 z-30 flex-col rounded-t-xl bg-layer-1 shadow-float",
					hasItem ? "flex" : "hidden",
					swipePointer === -1 && "transition-transform"
				]}
		style:flex={ctx.isDesktop ? `0 1 ${ctx.layout.editor}px` : undefined}
		style:transform={ctx.isDesktop ? undefined : `translateY(${swipeDy}px)`}
		style:container-type="inline-size"
		role={ctx.isDesktop ? undefined : "dialog"}
		aria-modal={ctx.isDesktop ? undefined : "true"}
		aria-label={ctx.isDesktop ? undefined : "Editor"}
		bind:offsetWidth={editorWidth}
	>
		{#if ctx.isDesktop}
			<div
				class="absolute inset-y-0 left-0 w-1 cursor-col-resize before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-accent-color before:opacity-0 hover:before:opacity-100 focus-visible:outline-none focus-visible:before:opacity-100"
				aria-label="Resize editor"
				use:resizable={{
					min: EDITOR.min,
					max: EDITOR.max,
					value: Math.min(ctx.layout.editor, editorWidth ?? ctx.layout.editor),
					side: "left",
					onResize: (px) => (ctx.layout.editor = px),
					onCommit: ctx.setEditor
				}}
			></div>
		{:else}
			<div
				class="relative flex h-11 shrink-0 touch-none items-center justify-center"
				role="presentation"
				onpointerdown={onSwipeStart}
				onpointermove={onSwipeMove}
				onpointerup={onSwipeEnd}
				onpointercancel={onSwipeEnd}
			>
				<span class="h-1 w-12 rounded-full bg-layer-4"></span>
				<button
					type="button"
					class="absolute top-0 right-0 flex size-11 items-center justify-center text-text-muted"
					aria-label="Close"
					onclick={onClose}
				>
					<Icon name="x" class="size-5" />
				</button>
			</div>
		{/if}
		<div class={ctx.isDesktop ? "h-full" : "min-h-0 flex-1"}>
			{@render editor()}
		</div>
	</div>
</div>
