<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import Icon from "$comp/icon.svelte";
	import { resizable } from "$lib/resizable";
	import { cn } from "$lib/utils";

	let {
		pinned,
		width,
		min,
		max,
		playerCount,
		skinCount,
		deviceCount,
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
		deviceCount: number;
		onResize: (px: number) => void;
		onCommit: (px: number | null) => void;
		onTogglePin: () => void;
	} = $props();

	const RAIL_PX = 64;

	const items = $derived([
		{ href: resolve("/dashboard"), label: "Home", icon: "house", count: null, exact: true },
		{ href: resolve("/dashboard/players"), label: "Players", icon: "users", count: playerCount },
		{ href: resolve("/dashboard/skins"), label: "Skins", icon: "palette", count: skinCount },
		{ href: resolve("/dashboard/devices"), label: "Devices", icon: "cpu", count: deviceCount }
	]);

	const isActive = (item: { href: string; exact?: boolean }) =>
		item.exact ? page.url.pathname === item.href : page.url.pathname.startsWith(item.href);

	// Labels are always there when pinned; otherwise they fade in while the rail is expanded.
	const label = $derived(
		pinned
			? "opacity-100"
			: "opacity-0 group-hover:opacity-100 group-has-[:focus-visible]:opacity-100"
	);
	const row =
		"flex h-12 items-center gap-4 rounded-md px-4 text-body whitespace-nowrap text-text-muted transition-colors duration-fast hover:bg-layer-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-color";
</script>

<!-- The placeholder keeps the page from moving; the panel inside grows over it on hover. -->
<div class="relative z-20 shrink-0" style:width="{pinned ? width : RAIL_PX}px">
	<nav
		aria-label="Dashboard"
		class="group absolute inset-y-0 left-0 flex flex-col gap-1 overflow-hidden bg-layer-1 p-2 transition-[width] duration-base {pinned
			? ''
			: 'w-16 hover:w-(--rail-w) hover:shadow-float has-[:focus-visible]:w-(--rail-w) has-[:focus-visible]:shadow-float'}"
		style:--rail-w="{width}px"
		style:width={pinned ? "100%" : undefined}
	>
		{#each items as item (item.href)}
			<a
				href={item.href}
				class={cn(row, isActive(item) && "bg-layer-3 text-accent-color hover:bg-layer-3")}
				aria-current={isActive(item) ? "page" : undefined}
			>
				<Icon name={item.icon} class="size-5 shrink-0" />
				<span class="flex-1 transition-opacity {label}">{item.label}</span>
				{#if item.count !== null}
					<span class="text-caption tabular-nums transition-opacity {label}">{item.count}</span>
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
