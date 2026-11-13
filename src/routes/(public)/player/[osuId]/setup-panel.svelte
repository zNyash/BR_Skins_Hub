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
	import FadeText from "$comp/fade-text.svelte";
	import Icon from "$comp/icon.svelte";
	import { Badge, type BadgeVariant } from "$comp/ui/badge";
	import {
		CARD_IDS,
		displaySetup,
		STORAGE_LABELS,
		presentCards,
		diagramRatio,
		rtMode,
		setupLayout,
		type CardId,
		type Shape
	} from "$lib/setup";
	import type { PlayerWithSkins } from "$lib/types";
	import { cn } from "$lib/utils";
	import FilterChips from "./filter-chips.svelte";
	import SetupCard from "./setup-card.svelte";
	import TabletDiagram from "./tablet-diagram.svelte";

	let {
		player,
		canEdit,
		onEdit
	}: { player: PlayerWithSkins; canEdit: boolean; onEdit: (card: CardId) => void } = $props();

	const setup = $derived(displaySetup(player.setup ?? {}, player.devices));
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
		enabled: { text: "Rapid trigger enabled", variant: "accent" },
		disabled: { text: "Rapid trigger disabled", variant: "soft" },
		unsupported: { text: "No rapid trigger", variant: "soft" }
	} satisfies Record<string, { text: string; variant: BadgeVariant }>;
</script>

{#snippet tile(
	label: string,
	value: string | number | undefined,
	unit = "",
	opts: { small?: boolean; hot?: boolean; class?: string } = {}
)}
	<div
		class={cn(
			"flex h-18 min-w-0 flex-col justify-between gap-2 rounded-md bg-layer-2 p-3",
			opts.class
		)}
	>
		<span class="text-label trim text-text-muted">{label}</span>
		<FadeText
			text={show(value)}
			class={cn(
				"trim",
				opts.small ? "text-card-title" : "text-value-lg",
				opts.hot && value !== undefined && "text-accent-color"
			)}
		>
			{#if unit && value !== undefined}
				<span class="text-caption text-text-muted">&nbsp;{unit}</span>
			{/if}
		</FadeText>
	</div>
{/snippet}

{#snippet model(id: CardId, name: string | undefined, image?: string)}
	<div class="flex min-w-0 items-center gap-3 rounded-md bg-layer-2 p-2">
		<span
			class="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-layer-3 text-text-muted"
			aria-hidden="true"
		>
			{#if image}
				<img src={image} alt="" class="size-full object-cover" />
			{:else}
				<Icon name={CARD_INFO[id].icon} class="size-6" />
			{/if}
		</span>
		<FadeText text={name || "Unknown"} class="flex-1 text-card-title trim" />
	</div>
{/snippet}

{#snippet addPrompt(id: CardId)}
	<button
		type="button"
		class="flex min-h-24 flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-layer-5 text-body text-text-muted transition-colors duration-fast hover:bg-layer-2 hover:text-text focus-visible:outline-2 focus-visible:outline-accent-color"
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
				<Badge variant={RT_BADGE[rt].variant}>{RT_BADGE[rt].text}</Badge>
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
				<div class="flex flex-col gap-3 @2xl:grid @2xl:grid-cols-[17.5rem_1fr]">
					<div class="flex min-w-0 flex-col gap-3 rounded-md bg-layer-2 p-3">
						<span
							class="flex min-h-30 flex-1 items-center justify-center overflow-hidden rounded-md bg-layer-3 text-text-muted @2xl:min-h-0"
							aria-hidden="true"
						>
							{#if player.devices.keyboard?.image_url}
								<img
									src={player.devices.keyboard.image_url}
									alt=""
									class="size-full object-cover"
								/>
							{:else}
								<Icon name={CARD_INFO.keyboard.icon} class="size-8" />
							{/if}
						</span>
						<FadeText text={k.model || "Unknown"} class="text-section-title trim" />
					</div>
					<!-- Always two rows, so the model block next to it keeps the same height. -->
					<div
						class={cn("grid content-start gap-3", mode === "none" ? "grid-cols-1" : "grid-cols-2")}
					>
						{@render tile("Switch", k.switch, "", { small: true })}
						{@render tile("Actuation point", k.actuation, "mm")}
						{#if mode === "single"}
							{@render tile("Rapid trigger", k.rt_press, "mm", { hot: true, class: "col-span-2" })}
						{:else if mode === "split"}
							{@render tile("Rapid trigger · press", k.rt_press, "mm", { hot: true })}
							{@render tile("Rapid trigger · release", k.rt_release, "mm", { hot: true })}
						{/if}
					</div>
				</div>
			{:else if id === "tablet" && setup.tablet}
				{@const t = setup.tablet}
				{#snippet tabletInfo()}
					{@render model(id, t.model, player.devices.tablet?.image_url)}
					<div class="grid grid-cols-[1.4fr_1fr] gap-3">
						{@render tile("Area", pair(t.area_w, t.area_h), "mm", { small: true })}
						{@render tile("Rotation", t.rotation, "°")}
					</div>
				{/snippet}
				{#if shape === "tall"}
					<!-- Mouse + Monitor set the height; the diagram takes what's left. -->
					{@render tabletInfo()}
					<TabletDiagram tablet={t} class="min-h-0 flex-1 basis-0 max-md:h-50 max-md:flex-none" />
					<FilterChips filters={t.filters ?? []} />
				{:else}
					<div class="flex flex-col gap-3 md:grid md:grid-cols-[1fr_auto]">
						<div class="flex min-w-0 flex-col gap-3">
							{@render tabletInfo()}
							<FilterChips filters={t.filters ?? []} />
						</div>
						<!-- 196px = the left column (72 + 12 + 72 + 12 + 28); width hugs the drawing (+ p-3). -->
						<TabletDiagram
							tablet={t}
							class="h-50 md:h-49 md:w-(--w)"
							--w="calc(172px * {diagramRatio(t)} + 24px)"
						/>
					</div>
				{/if}
			{:else if id === "mouse" && setup.mouse}
				{@const m = setup.mouse}
				{@render model(id, m.model, player.devices.mouse?.image_url)}
				<div class="grid grid-cols-2 gap-3">
					{@render tile("DPI", m.dpi)}
					{@render tile("Polling rate", m.polling_hz, "Hz")}
				</div>
			{:else if id === "monitor" && setup.monitor}
				{@const m = setup.monitor}
				{@render model(id, m.model, player.devices.monitor?.image_url)}
				<div class="grid grid-cols-[1fr_1fr_1.4fr] gap-3 @max-sm:grid-cols-2">
					{@render tile("Refresh rate", m.refresh_hz, "Hz")}
					{@render tile("Size", m.size_in, "in")}
					{@render tile("Resolution", pair(m.res_w, m.res_h), "", {
						small: true,
						class: "@max-sm:col-span-2"
					})}
				</div>
			{:else if id === "in_game" && setup.in_game}
				{@const g = setup.in_game}
				{@const three = "col-span-2 @min-[40rem]:col-span-1"}
				{@const two = "col-span-3 @min-[40rem]:col-span-1"}
				<!-- 3 + 2 on six columns; one row of five once the card is wide enough. -->
				<div class="grid grid-cols-6 gap-3 @min-[40rem]:grid-cols-5">
					{@render tile("Sensitivity", g.sensitivity, "×", { class: three })}
					{@render tile("Raw input", onOff(g.raw_input), "", { class: three })}
					{@render tile("Cursor size", g.cursor_size, "×", { class: three })}
					{@render tile("Frame limiter", g.frame_limiter, "", { small: true, class: two })}
					{@render tile("Audio offset", g.audio_offset_ms, "ms", { class: two })}
				</div>
			{:else if id === "pc" && setup.pc}
				{@const pc = setup.pc}
				<dl class="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-x-6 gap-y-4">
					{#each [["CPU", pc.cpu], ["GPU", pc.gpu], ["Motherboard", pc.motherboard], ["RAM", pc.ram], ["Cooler", pc.cooler]] as [label, value] (label)}
						<div class="flex flex-col gap-1">
							<dt class="text-label text-text-muted">{label}</dt>
							<dd class="text-body-strong break-words">{show(value)}</dd>
						</div>
					{/each}
					<div class="flex flex-col gap-1">
						<dt class="text-label text-text-muted">Storage</dt>
						{#each pc.storage ?? [] as drive, i (i)}
							<dd class="text-body-strong break-words">
								{STORAGE_LABELS[drive.kind]} · {drive.name}
							</dd>
						{:else}
							<dd class="text-body-strong">–</dd>
						{/each}
					</div>
				</dl>
			{/if}
		</SetupCard>
	{/each}
</div>
