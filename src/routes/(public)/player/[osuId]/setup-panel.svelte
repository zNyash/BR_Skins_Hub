<script lang="ts" module>
	import type { CardId as Card } from "$lib/setup";

	export const CARD_INFO: Record<Card, { title: string; icon: string }> = {
		keyboard: { title: "Keyboard", icon: "keyboard" },
		tablet: { title: "Tablet", icon: "tablet" },
		mouse: { title: "Mouse", icon: "mouse" },
		monitor: { title: "Monitor", icon: "monitor" },
		in_game: { title: "In-game", icon: "gamepad-2" },
		pc: { title: "PC", icon: "cpu" }
	};
</script>

<script lang="ts">
	import Icon from "$comp/icon.svelte";
	import {
		CARD_IDS,
		STORAGE_LABELS,
		presentCards,
		rtMode,
		setupLayout,
		type CardId,
		type Shape
	} from "$lib/setup";
	import type { PlayerWithSkins } from "$lib/types";
	import { cn } from "$lib/utils";
	import SetupCard from "./setup-card.svelte";
	import TabletDiagram from "./tablet-diagram.svelte";

	let {
		player,
		canEdit,
		onEdit
	}: { player: PlayerWithSkins; canEdit: boolean; onEdit: (card: CardId) => void } = $props();

	const setup = $derived(player.setup ?? {});
	// Editors get every card (empty ones offer to add data); visitors only the ones with data.
	const layout = $derived(setupLayout(canEdit ? new Set(CARD_IDS) : presentCards(setup)));

	const SHAPE_CLASS: Record<Shape, string> = {
		full: "md:col-span-2",
		half: "",
		tall: "md:row-span-2"
	};

	const show = (value: string | number | undefined) =>
		value === undefined || value === "" ? "–" : String(value);
	const pair = (a?: number, b?: number) =>
		a !== undefined && b !== undefined ? `${a} × ${b}` : undefined;
	const onOff = (on?: boolean) => (on === undefined ? undefined : on ? "On" : "Off");

	const RT_BADGE = {
		enabled: {
			text: "Rapid trigger enabled",
			class: "border-primary bg-primary text-primary-foreground"
		},
		disabled: { text: "Rapid trigger disabled", class: "border-layer-5 bg-layer-2" },
		unsupported: { text: "No rapid trigger", class: "border-layer-3 text-text-muted" }
	};
</script>

{#snippet tile(
	label: string,
	value: string | number | undefined,
	unit = "",
	opts: { small?: boolean; hot?: boolean } = {}
)}
	<div
		class="flex min-w-0 flex-[1_1_8rem] flex-col justify-between gap-1.5 rounded-lg bg-layer-2 px-3.5 py-3"
	>
		<span class="text-xs text-text-muted">{label}</span>
		<span
			class={cn(
				"font-bold break-words",
				opts.small ? "text-base" : "text-2xl",
				opts.hot && value !== undefined && "text-primary"
			)}
		>
			{show(value)}
			{#if unit && value !== undefined}
				<span class="text-sm font-medium text-text-muted">{unit}</span>
			{/if}
		</span>
	</div>
{/snippet}

{#snippet model(id: CardId, name: string | undefined, large = false)}
	<div
		class={cn(
			"flex items-center gap-3 rounded-lg bg-layer-2 p-2",
			large && "@lg:flex-col @lg:items-start"
		)}
	>
		<span
			class={cn(
				"flex shrink-0 items-center justify-center rounded-md bg-layer-3 text-text-muted",
				large ? "h-16 w-24 @lg:h-28 @lg:w-full" : "h-14 w-20"
			)}
			aria-hidden="true"
		>
			<Icon name={CARD_INFO[id].icon} class={large ? "size-8" : "size-6"} />
		</span>
		<span class={cn("min-w-0 font-semibold break-words", large && "px-1 text-lg font-bold")}>
			{name || "Unknown"}
		</span>
	</div>
{/snippet}

{#snippet addPrompt(id: CardId)}
	<button
		type="button"
		class="flex min-h-24 flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-layer-4 text-sm text-text-muted hover:border-primary hover:text-foreground"
		onclick={() => onEdit(id)}
	>
		<Icon name="plus" class="size-4" />
		Add {CARD_INFO[id].title.toLowerCase()}…
	</button>
{/snippet}

<div role="tabpanel" class="grid grid-cols-1 gap-4 md:grid-cols-2">
	{#each layout as { id, shape } (id)}
		{@const info = CARD_INFO[id]}
		{#snippet rtBadge()}
			{@const rt = setup.keyboard?.rapid_trigger}
			{#if rt}
				<span class={cn("rounded-full border px-3 py-1 text-xs font-semibold", RT_BADGE[rt].class)}>
					{RT_BADGE[rt].text}
				</span>
			{/if}
		{/snippet}
		<SetupCard
			title={info.title}
			icon={info.icon}
			mainInput={setup.main_input === id && Boolean(setup[id])}
			{canEdit}
			onEdit={() => onEdit(id)}
			badge={id === "keyboard" ? rtBadge : undefined}
			class={SHAPE_CLASS[shape]}
		>
			{#if !setup[id]}
				{@render addPrompt(id)}
			{:else if id === "keyboard" && setup.keyboard}
				{@const k = setup.keyboard}
				{@const mode = rtMode(k)}
				<div class="flex flex-col gap-3 @2xl:flex-row">
					<div class="@2xl:w-80 @2xl:shrink-0">{@render model(id, k.model, true)}</div>
					<div class="flex flex-1 flex-col gap-2.5">
						<div class="flex flex-1 flex-wrap gap-2.5">
							{@render tile("Switch", k.switch, "", { small: true })}
							{@render tile("Actuation point", k.actuation, "mm")}
						</div>
						{#if mode !== "none"}
							<div class="flex flex-1 flex-wrap gap-2.5">
								{#if mode === "single"}
									{@render tile("Rapid trigger", k.rt_press, "mm", { hot: true })}
								{:else}
									{@render tile("Rapid trigger · press", k.rt_press, "mm", { hot: true })}
									{@render tile("Rapid trigger · release", k.rt_release, "mm", { hot: true })}
								{/if}
							</div>
						{/if}
					</div>
				</div>
			{:else if id === "tablet" && setup.tablet}
				{@const t = setup.tablet}
				{@render model(id, t.model)}
				<div class="flex flex-1 flex-col gap-2.5 @xl:flex-row">
					<div class="flex flex-col gap-2.5 @xl:w-56 @xl:shrink-0">
						{@render tile("Area", pair(t.area_w, t.area_h), "mm")}
					</div>
					<div class="flex-[2_1_auto]"><TabletDiagram tablet={t} /></div>
				</div>
			{:else if id === "mouse" && setup.mouse}
				{@const m = setup.mouse}
				{@render model(id, m.model)}
				<div class="flex flex-1 flex-wrap gap-2.5">
					{@render tile("DPI", m.dpi)}
					{@render tile("Polling rate", m.polling_hz, "Hz")}
				</div>
			{:else if id === "monitor" && setup.monitor}
				{@const m = setup.monitor}
				{@render model(id, m.model)}
				<div class="flex flex-1 flex-col gap-2.5">
					<div class="flex flex-1 flex-wrap gap-2.5">
						{@render tile("Refresh rate", m.refresh_hz, "Hz")}
						{@render tile("Size", m.size_in, "in")}
					</div>
					<div class="flex flex-1 flex-wrap gap-2.5">
						{@render tile("Resolution", pair(m.res_w, m.res_h), "", { small: true })}
					</div>
				</div>
			{:else if id === "in_game" && setup.in_game}
				{@const g = setup.in_game}
				<div class="flex flex-1 flex-col gap-2.5">
					<div class="flex flex-1 flex-wrap gap-2.5">
						{@render tile("Sensitivity", g.sensitivity, "×")}
						{@render tile("Raw input", onOff(g.raw_input))}
						{@render tile("Cursor size", g.cursor_size, "×")}
					</div>
					<div class="flex flex-1 flex-wrap gap-2.5">
						{@render tile("Frame limiter", g.frame_limiter, "", { small: true })}
						{@render tile("Audio offset", g.audio_offset_ms, "ms")}
					</div>
				</div>
			{:else if id === "pc" && setup.pc}
				{@const pc = setup.pc}
				<dl class="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-x-5 gap-y-3.5">
					{#each [["CPU", pc.cpu], ["GPU", pc.gpu], ["Motherboard", pc.motherboard], ["RAM", pc.ram], ["Cooler", pc.cooler]] as [label, value] (label)}
						<div class="flex flex-col gap-0.5">
							<dt class="text-xs text-text-muted">{label}</dt>
							<dd class="font-medium break-words">{show(value)}</dd>
						</div>
					{/each}
					<div class="flex flex-col gap-0.5">
						<dt class="text-xs text-text-muted">Storage</dt>
						{#each pc.storage ?? [] as drive, i (i)}
							<dd class="font-medium break-words">{STORAGE_LABELS[drive.kind]} · {drive.name}</dd>
						{:else}
							<dd class="font-medium">–</dd>
						{/each}
					</div>
				</dl>
			{/if}
		</SetupCard>
	{/each}
</div>
