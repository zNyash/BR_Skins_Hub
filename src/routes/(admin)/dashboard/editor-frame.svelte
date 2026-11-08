<script lang="ts">
	import type { Snippet } from "svelte";
	import { page } from "$app/state";
	import Icon from "$comp/icon.svelte";
	import Popover from "$comp/popover.svelte";
	import { setParam, type EditorTab } from "./derive";

	/** The editor card: header (avatar, name, stepper, ⋯ menu), optional tab bar, scrolling body. */
	let {
		title,
		subtitle,
		avatar,
		cover,
		position,
		total,
		onPrev,
		onNext,
		menu,
		tabs,
		tab,
		actions,
		children
	}: {
		title: string;
		subtitle: string;
		avatar: Snippet;
		cover?: string;
		/** 1-based place in the list, or null when the item isn't in it (filtered out). */
		position: number | null;
		total: number;
		onPrev: () => void;
		onNext: () => void;
		menu: { label: string; onSelect: () => void; destructive?: boolean }[];
		tabs?: { id: EditorTab; label: string }[];
		tab?: EditorTab;
		actions?: Snippet;
		children: Snippet;
	} = $props();

	// Remembers which cover failed, so a different item's cover still shows.
	let failedCover = $state<string | null>(null);

	function tabHref(id: EditorTab): string {
		return setParam(page.url.searchParams, "tab", id);
	}

	function select(event: MouseEvent, onSelect: () => void) {
		(event.currentTarget as HTMLElement).closest<HTMLElement>("[popover]")?.hidePopover();
		onSelect();
	}

	const iconButton =
		"flex size-11 min-[900px]:size-9 items-center justify-center rounded-lg text-text-muted hover:bg-layer-3 disabled:opacity-50";
</script>

<!-- Tabs only change the query string of this page; there's no route to resolve(). -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->

<section class="flex h-full flex-col overflow-hidden rounded-2xl bg-layer-1">
	<header class="relative flex shrink-0 items-center gap-4 p-4">
		{#if cover && cover !== failedCover}
			<img
				src={cover}
				alt=""
				class="absolute inset-0 size-full object-cover opacity-30"
				style:mask-image="linear-gradient(180deg, #000, transparent)"
				onerror={() => (failedCover = cover)}
			/>
		{/if}
		<div class="relative shrink-0">{@render avatar()}</div>
		<div class="relative flex min-w-0 flex-1 flex-col gap-1">
			<h2 class="truncate leading-tight font-semibold">{title}</h2>
			<div class="flex min-w-0 items-center gap-2 text-sm leading-tight text-text-muted">
				<span class="truncate">{subtitle}</span>
				{@render actions?.()}
			</div>
		</div>
		<div class="relative flex shrink-0 items-center">
			<button
				type="button"
				class={iconButton}
				aria-label="Previous"
				disabled={total === 0}
				onclick={onPrev}
			>
				<Icon name="chevron-left" class="size-4" />
			</button>
			<span class="min-w-12 text-center text-sm text-text-muted tabular-nums">
				{position ?? "–"}/{total}
			</span>
			<button
				type="button"
				class={iconButton}
				aria-label="Next"
				disabled={total === 0}
				onclick={onNext}
			>
				<Icon name="chevron-right" class="size-4" />
			</button>
			<Popover hover={false} class="flex min-w-40 flex-col p-1">
				{#snippet trigger(props)}
					<button {...props} type="button" class={iconButton} aria-label="More actions">
						<Icon name="ellipsis" class="size-4" />
					</button>
				{/snippet}
				{#each menu as item (item.label)}
					<button
						type="button"
						class="min-h-11 rounded-md px-3 text-left text-sm hover:bg-layer-3 min-[900px]:min-h-9 {item.destructive
							? 'text-error'
							: ''}"
						onclick={(e) => select(e, item.onSelect)}
					>
						{item.label}
					</button>
				{/each}
			</Popover>
		</div>
	</header>

	{#if tabs}
		<nav aria-label="Editor tabs" class="shrink-0 px-4">
			<div class="no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-layer-2 p-1">
				{#each tabs as t (t.id)}
					<a
						href={tabHref(t.id)}
						data-sveltekit-noscroll
						class="flex min-h-11 flex-1 items-center justify-center rounded-lg px-3 text-sm whitespace-nowrap min-[900px]:min-h-9 {t.id ===
						tab
							? 'bg-layer-4 text-text'
							: 'text-text-muted hover:bg-layer-3'}"
						aria-current={t.id === tab ? "page" : undefined}
					>
						{t.label}
					</a>
				{/each}
			</div>
		</nav>
	{/if}

	<div class="min-h-0 flex-1 overflow-y-auto p-4">
		{@render children()}
	</div>
</section>
