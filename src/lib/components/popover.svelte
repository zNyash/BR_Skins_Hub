<script lang="ts">
	import { tick, type Snippet } from "svelte";
	import { createAttachmentKey } from "svelte/attachments";
	import type { HTMLAttributes } from "svelte/elements";
	import { placePopover } from "$lib/popover";
	import { cn } from "$lib/utils";

	/**
	 * A popover on the native `popover` attribute.
	 *
	 * Hover (and focus) shows it as `popover="manual"`; it hides 120ms after the pointer leaves both the
	 * trigger and the popover, so the pointer can travel into it. Clicking the trigger pins it: it is
	 * re-shown as `popover="auto"`, which makes the browser close it on an outside click or Escape and
	 * keep only one pinned popover open. Clicking the trigger again closes it.
	 *
	 * `trigger` gets props to spread onto your own trigger element.
	 */
	let {
		trigger,
		children,
		hover = true,
		pin = true,
		class: className = "",
		onopen
	}: {
		trigger: Snippet<[props: HTMLAttributes<HTMLElement>]>;
		children: Snippet;
		hover?: boolean;
		pin?: boolean;
		class?: string;
		onopen?: () => void;
	} = $props();

	const id = $props.id();
	const HIDE_DELAY = 120;

	let triggerEl: HTMLElement | undefined;
	let popoverEl: HTMLDivElement;
	let open = $state(false);
	let pinned = $state(false);
	let hideTimer: ReturnType<typeof setTimeout> | undefined;
	// When a pinned popover was last light-dismissed. A click on the trigger dismisses it on
	// pointerdown, before `click`, and that click must not open it again.
	let dismissedAt = 0;

	function place() {
		if (!triggerEl) return;
		const { width, height } = popoverEl.getBoundingClientRect();
		const { top, left } = placePopover(
			triggerEl.getBoundingClientRect(),
			{ width, height },
			{ width: window.innerWidth, height: window.innerHeight }
		);
		popoverEl.style.top = `${top}px`;
		popoverEl.style.left = `${left}px`;
	}

	function show(mode: "manual" | "auto") {
		clearTimeout(hideTimer);
		// The popover attribute only changes while hidden, so a hover-open popover is closed first.
		if (mode === "auto" && open) {
			popoverEl.hidePopover();
			open = false;
		}
		popoverEl.popover = mode;
		if (!open) {
			popoverEl.showPopover();
			open = true;
			onopen?.();
		}
		pinned = mode === "auto";
		// Content only mounts while open (so a closed popover loads nothing), so measure after it renders.
		tick().then(place);
	}

	function hoverIn() {
		if (hover && !pinned) show("manual");
	}

	function hoverOut() {
		if (!hover || pinned) return;
		clearTimeout(hideTimer);
		hideTimer = setTimeout(() => open && popoverEl.hidePopover(), HIDE_DELAY);
	}

	// Keeps a hover/focus popover open while focus is inside it.
	function onfocusout(event: FocusEvent) {
		const next = event.relatedTarget as Node | null;
		if (next && (popoverEl.contains(next) || triggerEl?.contains(next))) return;
		hoverOut();
	}

	function onclick() {
		if (!pin || performance.now() - dismissedAt < 300) return;
		if (pinned) popoverEl.hidePopover();
		else show("auto");
	}

	function onbeforetoggle(event: ToggleEvent) {
		if (event.newState === "closed" && pinned) dismissedAt = performance.now();
	}

	function ontoggle(event: ToggleEvent) {
		if (event.newState !== "closed" || popoverEl.matches(":popover-open")) return;
		open = false;
		pinned = false;
		popoverEl.popover = "manual";
	}

	$effect(() => {
		if (!open || pinned) return;
		// popover="auto" closes on Escape by itself; a hover/focus popover must too.
		const onkeydown = (event: KeyboardEvent) => event.key === "Escape" && popoverEl.hidePopover();
		document.addEventListener("keydown", onkeydown);
		return () => document.removeEventListener("keydown", onkeydown);
	});

	$effect(() => {
		if (!open) return;
		window.addEventListener("scroll", place, { capture: true, passive: true });
		window.addEventListener("resize", place);
		return () => {
			window.removeEventListener("scroll", place, { capture: true });
			window.removeEventListener("resize", place);
		};
	});

	const triggerProps: HTMLAttributes<HTMLElement> = $derived({
		[createAttachmentKey()]: (node: HTMLElement) => {
			triggerEl = node;
		},
		onpointerenter: hoverIn,
		onpointerleave: hoverOut,
		onfocus: hoverIn,
		onblur: onfocusout,
		onclick,
		"aria-expanded": pin ? pinned : undefined,
		"aria-describedby": hover ? id : undefined
	});
</script>

{@render trigger(triggerProps)}

<div
	bind:this={popoverEl}
	{id}
	popover="manual"
	role={pin ? "dialog" : "tooltip"}
	class={cn(
		"fixed inset-auto m-0 rounded-lg bg-layer-2 text-foreground outline outline-border",
		className
	)}
	onpointerenter={() => clearTimeout(hideTimer)}
	onpointerleave={hoverOut}
	onfocusin={() => clearTimeout(hideTimer)}
	{onfocusout}
	{onbeforetoggle}
	{ontoggle}
>
	{#if open}
		{@render children()}
	{/if}
</div>
