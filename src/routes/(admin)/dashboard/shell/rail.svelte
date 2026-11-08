<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import Icon from "$comp/icon.svelte";
	import { resizable } from "$lib/resizable";

	let {
		pinned,
		width,
		min,
		max,
		playerCount,
		skinCount,
		onResize,
		onCommit,
		onTogglePin
	}: {
		pinned: boolean;
		width: number;
		min: number;
		max: number;
		playerCount: number;
		skinCount: number;
		onResize: (px: number) => void;
		onCommit: (px: number | null) => void;
		onTogglePin: () => void;
	} = $props();

	const RAIL_PX = 64;

	const items = $derived([
		{ href: resolve("/dashboard"), label: "Home", icon: "house", count: null, exact: true },
		{ href: "/dashboard/players", label: "Players", icon: "users", count: playerCount },
		{ href: "/dashboard/skins", label: "Skins", icon: "palette", count: skinCount }
	]);

	const isActive = (item: { href: string; exact?: boolean }) =>
		item.exact ? page.url.pathname === item.href : page.url.pathname.startsWith(item.href);

	// Labels are always there when pinned; otherwise they fade in while the rail is expanded.
	const label = $derived(
		pinned ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
	);
	const row =
		"flex h-12 items-center gap-4 rounded-lg px-4 text-sm whitespace-nowrap text-text-muted hover:bg-layer-2";
</script>

<!-- Players and Skins routes arrive in later tasks, so their hrefs can't go through the typed resolve() yet. -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->

<!-- The placeholder keeps the page from moving; the panel inside grows over it on hover. -->
<div class="relative z-20 shrink-0" style:width="{pinned ? width : RAIL_PX}px">
	<nav
		aria-label="Dashboard"
		class="group absolute inset-y-0 left-0 flex flex-col gap-1 overflow-hidden bg-layer-1 p-2 transition-[width] duration-150 {pinned
			? ''
			: 'w-16 focus-within:w-(--rail-w) focus-within:shadow-lg hover:w-(--rail-w) hover:shadow-lg'}"
		style:--rail-w="{width}px"
		style:width={pinned ? "100%" : undefined}
	>
		{#each items as item (item.href)}
			<a
				href={item.href}
				class="{row} {isActive(item) ? 'bg-layer-2 text-accent-color' : ''}"
				aria-current={isActive(item) ? "page" : undefined}
			>
				<Icon name={item.icon} class="size-5 shrink-0" />
				<span class="flex-1 transition-opacity {label}">{item.label}</span>
				{#if item.count !== null}
					<span class="text-xs transition-opacity {label}">{item.count}</span>
				{/if}
			</a>
		{/each}

		<div class="mt-auto flex flex-col gap-1">
			<button
				type="button"
				class="{row} {pinned ? 'text-accent-color' : ''}"
				aria-pressed={pinned}
				onclick={onTogglePin}
			>
				<Icon name={pinned ? "pin-off" : "pin"} class="size-5 shrink-0" />
				<span class="flex-1 text-left transition-opacity {label}">
					{pinned ? "Unpin sidebar" : "Pin sidebar"}
				</span>
			</button>
			<a href={resolve("/")} class={row}>
				<Icon name="arrow-left" class="size-5 shrink-0" />
				<span class="flex-1 transition-opacity {label}">Back to site</span>
			</a>
		</div>

		{#if pinned}
			<div
				class="absolute inset-y-0 right-0 w-1 cursor-col-resize before:absolute before:inset-y-0 before:right-0 before:w-[2px] before:bg-accent-color before:opacity-0 hover:before:opacity-100 focus-visible:outline-none focus-visible:before:opacity-100"
				aria-label="Resize sidebar"
				use:resizable={{ min, max, value: width, side: "right", onResize, onCommit }}
			></div>
		{/if}
	</nav>
</div>
