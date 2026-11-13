<script lang="ts">
	import type { Snippet } from "svelte";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import Icon from "$comp/icon.svelte";
	import Popover from "$comp/popover.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import * as Tabs from "$comp/ui/tabs";
	import { setParam, type EditorTab } from "./derive";

	/** The editor card: header (avatar, name, ⋯ menu), optional tab bar, scrolling body. */
	let {
		title,
		subtitle,
		avatar,
		cover,
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
		/** A disabled item shows `hint` as its tooltip, saying why. */
		menu: {
			label: string;
			onSelect: () => void;
			destructive?: boolean;
			disabled?: boolean;
			hint?: string;
		}[];
		tabs?: { id: EditorTab; label: string }[];
		tab?: EditorTab;
		actions?: Snippet;
		children: Snippet;
	} = $props();

	// Remembers which cover failed, so a different item's cover still shows.
	let failedCover = $state<string | null>(null);

	function tabHref(id: EditorTab): string {
		return page.url.pathname + setParam(page.url.searchParams, "tab", id);
	}

	// The bar always shows ?tab=: a click only navigates, so a blocked navigation doesn't move it.
	function openTab(id: string) {
		// Only the query string of this page changes; there's no route to resolve().
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(tabHref(id as EditorTab), { replaceState: true, noScroll: true, keepFocus: true });
	}

	function select(event: MouseEvent, onSelect: () => void) {
		(event.currentTarget as HTMLElement).closest<HTMLElement>("[popover]")?.hidePopover();
		onSelect();
	}
</script>

<section class="flex h-full flex-col overflow-hidden rounded-xl bg-layer-1">
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
			<h2 class="truncate text-card-title">{title}</h2>
			<div class="flex min-w-0 items-center gap-2 text-caption text-text-muted">
				<span class="truncate">{subtitle}</span>
				{@render actions?.()}
			</div>
		</div>
		<div class="relative flex shrink-0 items-center">
			<Popover hover={false} class="flex min-w-40 flex-col p-1">
				{#snippet trigger(props)}
					<Button {...props} variant="ghost" size="icon" aria-label="More actions">
						<Icon name="ellipsis" />
					</Button>
				{/snippet}
				{#each menu as item (item.label)}
					<button
						type="button"
						class="min-h-11 rounded-md px-3 text-left text-body hover:bg-layer-3 disabled:opacity-50 disabled:hover:bg-transparent min-[900px]:min-h-9 {item.destructive
							? 'text-error'
							: ''}"
						disabled={item.disabled}
						title={item.hint}
						onclick={(e) => select(e, item.onSelect)}
					>
						{item.label}
					</button>
				{/each}
			</Popover>
		</div>
	</header>

	{#if tabs}
		<Tabs.Root bind:value={() => tab ?? "", openTab} activationMode="manual" class="shrink-0 px-4">
			<Tabs.List aria-label="Editor tabs" class="no-scrollbar w-full overflow-x-auto">
				{#each tabs as t (t.id)}
					<Tabs.Trigger value={t.id}>{t.label}</Tabs.Trigger>
				{/each}
			</Tabs.List>
		</Tabs.Root>
	{/if}

	<div class="min-h-0 flex-1 overflow-y-auto p-4">
		{@render children()}
	</div>
</section>
