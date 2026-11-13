<script lang="ts">
	import { untrack } from "svelte";
	import { toast } from "svelte-sonner";
	import DevicePicker from "$comp/device-picker.svelte";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import * as Dialog from "$comp/ui/dialog";
	import { Input } from "$comp/ui/input";
	import * as Select from "$comp/ui/select";
	import { askConfirm } from "$lib/confirm.svelte";
	import { loadDevices, type PickerDevice } from "$lib/device-catalog";
	import { DEVICE_ICONS } from "$lib/devices";
	import {
		importedTablet,
		keyboardBody,
		mainInputPatch,
		STORAGE_LABELS,
		type CardId,
		type LinkedDevice,
		type Setup
	} from "$lib/setup";
	import { LINKABLE_CARDS, type LinkableCard } from "$convex/lib/setupLinks";
	import { humanize, otdSettingsHint, parseOtdSettings, type OtdProfile } from "$lib/otd";
	import type { PlayerWithSkins } from "$lib/types";
	import { cn } from "$lib/utils";
	import { saveSetup } from "./save-setup";
	import { errorMessage } from "./save-profile";
	import { CARD_INFO } from "./setup-panel.svelte";

	let {
		player,
		card,
		onClose
	}: { player: PlayerWithSkins; card: CardId | null; onClose: () => void } = $props();

	type Cards = Required<Omit<Setup, "main_input">>;
	type AllFields = Cards["keyboard"] &
		Cards["tablet"] &
		Cards["mouse"] &
		Cards["monitor"] &
		Cards["in_game"] &
		Cards["pc"];
	// Every card's fields in one draft (only `model` is shared, with the same type). Number inputs
	// give null when emptied, which the server drops, so a cleared value is removed, not stored as 0.
	type Draft = { [K in keyof AllFields]?: AllFields[K] | null };
	type Field = {
		key: keyof Draft;
		label: string;
		unit?: string;
		number?: boolean;
		whole?: boolean;
		/** Takes both columns; other fields sit in left/right pairs. */
		wide?: boolean;
	};

	const MODEL: Field = { key: "model", label: "Model", wide: true };
	const FIELDS: Record<Exclude<CardId, "pc">, Field[]> = {
		keyboard: [
			MODEL,
			{ key: "switch", label: "Switch" },
			{ key: "actuation", label: "Actuation point", unit: "mm", number: true }
		],
		tablet: [
			MODEL,
			{ key: "area_w", label: "Area width", unit: "mm", number: true },
			{ key: "area_h", label: "Area height", unit: "mm", number: true },
			{ key: "center_x", label: "Centre X", unit: "mm", number: true },
			{ key: "center_y", label: "Centre Y", unit: "mm", number: true },
			{ key: "full_w", label: "Full area width", unit: "mm", number: true },
			{ key: "full_h", label: "Full area height", unit: "mm", number: true },
			{ key: "rotation", label: "Rotation", unit: "°", number: true }
		],
		mouse: [
			MODEL,
			{ key: "dpi", label: "DPI", number: true, whole: true },
			{ key: "polling_hz", label: "Polling rate", unit: "Hz", number: true, whole: true }
		],
		monitor: [
			MODEL,
			{ key: "refresh_hz", label: "Refresh rate", unit: "Hz", number: true },
			{ key: "size_in", label: "Size", unit: "in", number: true },
			{ key: "res_w", label: "Resolution width", unit: "px", number: true, whole: true },
			{ key: "res_h", label: "Resolution height", unit: "px", number: true, whole: true }
		],
		in_game: [
			{ key: "sensitivity", label: "Sensitivity", unit: "×", number: true },
			{ key: "cursor_size", label: "Cursor size", unit: "×", number: true },
			{ key: "frame_limiter", label: "Frame limiter" },
			{ key: "audio_offset_ms", label: "Audio offset", unit: "ms", number: true, whole: true }
		]
	};
	const PC_FIELDS: Field[] = [
		{ key: "cpu", label: "CPU" },
		{ key: "gpu", label: "GPU" },
		{ key: "motherboard", label: "Motherboard" },
		{ key: "ram", label: "RAM" },
		{ key: "cooler", label: "Cooler" }
	];
	const RT_OPTIONS = { enabled: "Enabled", disabled: "Disabled", unsupported: "Not supported" };
	const MAX_DRIVES = 8;

	const setup = $derived(player.setup ?? {});
	const isMainInputCard = (id: CardId | null): id is "tablet" | "mouse" =>
		id === "tablet" || id === "mouse";
	const isLinkable = (id: CardId | null): id is LinkableCard =>
		(LINKABLE_CARDS as readonly (CardId | null)[]).includes(id);

	let draft = $state<Draft>({});
	// Selects work on strings, so these live beside the draft and are converted on save.
	let rt = $state("");
	let rawInput = $state("");
	let splitRelease = $state(false);
	let mainInput = $state(false);
	let initial = "";
	let saving = $state(false);

	// --- Catalog link (keyboard, tablet, mouse, monitor) ---
	// The device the card links to, for the linked block; the draft only holds its id.
	let linked = $state<LinkedDevice | PickerDevice | null>(null);
	let catalog = $state<PickerDevice[] | "loading" | "error">("loading");
	// The tablet's full area comes from the device when it has both sizes.
	const lockedArea = $derived(
		card === "tablet" && linked?.full_w !== undefined && linked?.full_h !== undefined
			? { w: linked.full_w, h: linked.full_h }
			: null
	);

	function fetchCatalog(type: LinkableCard) {
		if (Array.isArray(catalog)) return;
		catalog = "loading";
		loadDevices(type).then(
			(list) => {
				if (card === type) catalog = list;
			},
			() => {
				if (card === type) catalog = "error";
			}
		);
	}

	function pickDevice(device: PickerDevice) {
		draft.device_id = device._id;
		draft.model = device.name;
		draft.link = null;
		linked = device;
	}

	function unlinkDevice() {
		draft.device_id = null;
		draft.link = "manual";
		linked = null;
	}

	// --- OpenTabletDriver import (read here in the browser; nothing is uploaded) ---
	let dragging = $state(false);
	let profiles = $state<OtdProfile[]>([]);
	const hint = $derived(
		otdSettingsHint(typeof navigator === "undefined" ? "" : navigator.userAgent)
	);

	async function importFile(file: File | undefined) {
		if (!file) return;
		try {
			const found = parseOtdSettings(await file.text());
			// One tablet fills the card right away; several wait for the user to pick theirs.
			if (found.length === 1) applyProfile(found[0]);
			else profiles = found;
		} catch (err) {
			toast.error(errorMessage(err, "Couldn't read that file"));
		}
	}

	function applyProfile(profile: OtdProfile) {
		// A different tablet in the file replaces the card's name and drops its link.
		const renamed = importedTablet(draft, linked?.name, profile.tablet);
		draft = { ...draft, ...profile.area, ...renamed, filters: profile.filters };
		if (renamed) linked = null;
		profiles = [];
		const count = profile.filters.length;
		toast.success(`Imported ${profile.tablet} with ${count} ${count === 1 ? "filter" : "filters"}`);
	}

	async function copyPath() {
		await navigator.clipboard.writeText(hint.path);
		toast.success("Path copied");
	}

	const snapshot = () => JSON.stringify({ draft, rt, rawInput, splitRelease, mainInput });
	const dirty = () => snapshot() !== initial;

	// A fresh draft each time a card is opened.
	$effect(() => {
		const id = card;
		untrack(() => {
			if (!id) return;
			const saved = (setup[id] ?? {}) as Draft;
			draft = {
				...saved,
				storage: saved.storage?.map((drive) => ({ ...drive })) ?? [],
				filters: saved.filters?.map((filter) => ({ ...filter, settings: [...filter.settings] }))
			};
			profiles = [];
			linked = isLinkable(id) ? (player.devices[id] ?? null) : null;
			catalog = "loading";
			rt = setup.keyboard?.rapid_trigger ?? "";
			rawInput =
				setup.in_game?.raw_input === undefined ? "" : setup.in_game.raw_input ? "on" : "off";
			splitRelease = setup.keyboard?.rt_release !== undefined;
			mainInput = setup.main_input === id;
			initial = snapshot();
		});
	});

	async function requestClose() {
		if (saving) return;
		if (dirty()) {
			const discard = await askConfirm({
				title: "Discard your unsaved changes?",
				description: "What you typed hasn't been saved yet.",
				confirmLabel: "Discard",
				cancelLabel: "Keep editing",
				destructive: true
			});
			if (!discard) return;
		}
		onClose();
	}

	function cardBody(id: CardId): Draft {
		if (id === "keyboard") return keyboardBody(draft, rt, splitRelease);
		if (id === "in_game")
			return { ...draft, raw_input: rawInput === "" ? null : rawInput === "on" };
		return draft;
	}

	async function send(body: Record<string, unknown>) {
		saving = true;
		try {
			await saveSetup(player._id, player.osu_id, body);
			onClose();
		} catch (err) {
			toast.error(errorMessage(err, "Couldn't save your setup"));
		} finally {
			saving = false;
		}
	}

	function save() {
		if (!card) return;
		const main = isMainInputCard(card) ? mainInputPatch(setup.main_input, card, mainInput) : {};
		send({ [card]: cardBody(card), ...main });
	}

	async function clearCard() {
		if (!card) return;
		const confirmed = await askConfirm({
			title: `Clear your ${CARD_INFO[card].title.toLowerCase()} card?`,
			description: "Everything on this card will be removed.",
			confirmLabel: "Clear",
			destructive: true
		});
		if (!confirmed) return;
		const main = setup.main_input === card ? { main_input: null } : {};
		send({ [card]: null, ...main });
	}
</script>

{#snippet deviceField(type: LinkableCard)}
	<div class="flex flex-col gap-2 sm:col-span-2">
		{#if draft.device_id}
			<span class="text-label">Model</span>
			<div class="flex items-center gap-3 rounded-md bg-layer-2 p-2">
				<div
					class="flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-layer-4 text-text-muted"
				>
					{#if linked?.image_url}
						<img src={linked.image_url} alt="" class="size-full object-cover" />
					{:else}
						<Icon name={DEVICE_ICONS[type]} class="size-5" />
					{/if}
				</div>
				<div class="flex min-w-0 flex-1 flex-col">
					<span class="truncate text-body-strong">{linked?.name ?? draft.model}</span>
					<span class="text-caption text-text-muted">
						From the catalog{#if lockedArea}
							· full area {lockedArea.w} × {lockedArea.h} mm{/if}
					</span>
				</div>
				<Button variant="ghost" size="sm" class="hover:bg-layer-3" onclick={unlinkDevice}>
					Not my {CARD_INFO[type].title.toLowerCase()}
				</Button>
			</div>
		{:else}
			<label for="setup-model" class="text-label">Model</label>
			<DevicePicker
				{type}
				devices={catalog}
				inputId="setup-model"
				bind:query={
					() => draft.model ?? "",
					(value) => {
						draft.model = value;
						// Typing again takes back a "keep as typed".
						draft.link = null;
					}
				}
				onFocus={() => fetchCatalog(type)}
				onPick={pickDevice}
				onKeepTyped={() => (draft.link = "manual")}
			/>
		{/if}
	</div>
{/snippet}

{#snippet lockedFullArea(area: { w: number; h: number })}
	<div class="flex flex-col gap-2 sm:col-span-2">
		<span class="text-label">Full area</span>
		<div
			class="flex h-11 items-center gap-2 rounded-md border border-dashed border-layer-5 px-3 text-body text-text-muted"
		>
			<Icon name="lock" class="size-4" />
			{area.w} × {area.h} mm
		</div>
		<p class="text-caption text-text-muted">
			The full area comes from the device, so the position diagram matches the real tablet.
		</p>
	</div>
{/snippet}

{#snippet field(f: Field)}
	{@const inputId = `setup-${f.key}`}
	<div class={cn("flex flex-col gap-2", f.wide && "sm:col-span-2")}>
		<label for={inputId} class="text-label">
			{f.label}
			{#if f.unit}<span class="text-text-muted">({f.unit})</span>{/if}
		</label>
		{#if f.number}
			<Input
				id={inputId}
				type="number"
				step={f.whole ? 1 : "any"}
				class="bg-layer-2"
				bind:value={draft[f.key] as number | null | undefined}
			/>
		{:else}
			<Input
				id={inputId}
				maxlength={100}
				class="bg-layer-2"
				bind:value={draft[f.key] as string | null | undefined}
			/>
		{/if}
	</div>
{/snippet}

<Dialog.Root open={card !== null}>
	<Dialog.Content
		class="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg"
		showCloseButton={false}
		onEscapeKeydown={(e) => {
			e.preventDefault();
			requestClose();
		}}
		onInteractOutside={(e) => {
			e.preventDefault();
			requestClose();
		}}
	>
		{#if card}
			<Dialog.Header>
				<Dialog.Title class="flex items-center gap-2">
					<Icon name={CARD_INFO[card].icon} class="size-5 text-accent-color" />
					{CARD_INFO[card].title}
				</Dialog.Title>
				<Dialog.Description>Leave anything you don't know empty.</Dialog.Description>
			</Dialog.Header>

			<form
				id="setup-form"
				class="grid grid-cols-1 gap-3 sm:grid-cols-2"
				onsubmit={(e) => {
					e.preventDefault();
					save();
				}}
			>
				{#if card === "pc"}
					{#each PC_FIELDS as f (f.key)}{@render field(f)}{/each}
					<fieldset class="flex flex-col gap-2 sm:col-span-2">
						<legend class="mb-2 text-label">Storage</legend>
						{#each draft.storage ?? [] as drive, i (i)}
							<div class="flex gap-2">
								<Select.Root type="single" bind:value={drive.kind}>
									<Select.Trigger
										class="w-32 shrink-0 bg-layer-2 hover:bg-layer-3 data-[state=open]:bg-layer-3"
										aria-label="Drive {i + 1} type"
									>
										{STORAGE_LABELS[drive.kind]}
									</Select.Trigger>
									<Select.Content>
										{#each Object.entries(STORAGE_LABELS) as [kind, label] (kind)}
											<Select.Item value={kind}>{label}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
								<Input
									aria-label="Drive {i + 1} name"
									placeholder="Samsung 990 Pro 2TB"
									maxlength={100}
									class="bg-layer-2"
									bind:value={drive.name}
								/>
								<Button
									variant="ghost"
									size="icon"
									aria-label="Remove drive {i + 1}"
									onclick={() => draft.storage?.splice(i, 1)}
								>
									<Icon name="x" class="size-4" />
								</Button>
							</div>
						{/each}
						{#if (draft.storage?.length ?? 0) < MAX_DRIVES}
							<Button
								variant="secondary"
								class="self-start"
								onclick={() => draft.storage?.push({ kind: "nvme", name: "" })}
							>
								<Icon name="plus" class="size-4" />
								Add drive
							</Button>
						{/if}
					</fieldset>
				{:else}
					{#each FIELDS[card] as f (f.key)}
						{#if f.key === "model" && isLinkable(card)}
							{@render deviceField(card)}
						{:else if lockedArea && f.key === "full_w"}
							{@render lockedFullArea(lockedArea)}
						{:else if !(lockedArea && f.key === "full_h")}
							{@render field(f)}
						{/if}
					{/each}
				{/if}

				{#if card === "keyboard"}
					<div class="flex flex-col gap-2">
						<span class="text-label" id="setup-rt-label">Rapid trigger</span>
						<Select.Root type="single" bind:value={rt}>
							<Select.Trigger
								class="bg-layer-2 hover:bg-layer-3 data-[state=open]:bg-layer-3"
								aria-labelledby="setup-rt-label"
							>
								{RT_OPTIONS[rt as keyof typeof RT_OPTIONS] ?? "–"}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="">–</Select.Item>
								{#each Object.entries(RT_OPTIONS) as [value, label] (value)}
									<Select.Item {value}>{label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
					{#if rt === "enabled"}
						{@render field({
							key: "rt_press",
							label: splitRelease ? "Press" : "Rapid trigger",
							unit: "mm",
							number: true
						})}
						<label class="flex items-center gap-2 text-body sm:col-span-2">
							<input
								type="checkbox"
								class="size-4 accent-accent-color"
								bind:checked={splitRelease}
							/>
							Different release value
						</label>
						{#if splitRelease}
							{@render field({ key: "rt_release", label: "Release", unit: "mm", number: true })}
						{/if}
					{/if}
				{/if}

				{#if card === "in_game"}
					<div class="flex flex-col gap-2">
						<span class="text-label" id="setup-raw-label">Raw input</span>
						<Select.Root type="single" bind:value={rawInput}>
							<Select.Trigger
								class="bg-layer-2 hover:bg-layer-3 data-[state=open]:bg-layer-3"
								aria-labelledby="setup-raw-label"
							>
								{rawInput === "on" ? "On" : rawInput === "off" ? "Off" : "–"}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="">–</Select.Item>
								<Select.Item value="on">On</Select.Item>
								<Select.Item value="off">Off</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
				{/if}

				{#if isMainInputCard(card)}
					<label class="flex items-center gap-2 text-body sm:col-span-2">
						<input type="checkbox" class="size-4 accent-accent-color" bind:checked={mainInput} />
						This is my main input
					</label>
				{/if}

				{#if card === "tablet"}
					<section class="flex flex-col gap-2 sm:col-span-2" aria-label="OpenTabletDriver">
						<span class="text-body-strong">Import from OpenTabletDriver</span>
						<label
							class={cn(
								"flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed border-layer-5 p-4 text-center text-body text-text-muted transition-colors duration-fast hover:bg-layer-2 hover:text-text",
								dragging && "bg-layer-2 text-text"
							)}
							ondragover={(e) => {
								e.preventDefault();
								dragging = true;
							}}
							ondragleave={() => (dragging = false)}
							ondrop={(e) => {
								e.preventDefault();
								dragging = false;
								importFile(e.dataTransfer?.files[0]);
							}}
						>
							<Icon name="file-json" class="size-6" />
							Drop your settings.json here, or click to choose it
							<input
								type="file"
								accept=".json,application/json"
								class="hidden"
								onchange={(e) => {
									importFile(e.currentTarget.files?.[0]);
									e.currentTarget.value = ""; // allow picking the same file again
								}}
							/>
						</label>
						<div class="flex items-center gap-2 rounded-md bg-layer-2 px-3 py-2">
							<code class="min-w-0 flex-1 text-caption break-all">{hint.path}</code>
							<Button variant="ghost" size="sm" onclick={copyPath}>
								<Icon name="copy" class="size-4" />
								Copy
							</Button>
						</div>
						<p class="text-caption text-text-muted">
							Copy the path, then {hint.howTo.charAt(0).toLowerCase() + hint.howTo.slice(1)} Only filters
							that are turned on are imported.
						</p>

						{#if profiles.length > 1}
							<div class="flex flex-col gap-2">
								<span class="text-body">This file has several tablets. Which one is yours?</span>
								<div class="flex flex-wrap gap-2">
									{#each profiles as profile, i (i)}
										<Button variant="secondary" size="sm" onclick={() => applyProfile(profile)}>
											{profile.tablet}
										</Button>
									{/each}
								</div>
							</div>
						{/if}

						{#if draft.filters?.length}
							<ul class="flex flex-col gap-2">
								{#each draft.filters as filter, i (i)}
									<li
										class="flex items-center gap-2 rounded-md bg-layer-2 py-1 pr-1 pl-3 text-body"
									>
										<span class="min-w-0 flex-1 text-body-strong">{humanize(filter.path)}</span>
										<span class="text-caption text-text-muted">
											{filter.settings.length}
											{filter.settings.length === 1 ? "setting" : "settings"}
										</span>
										<Button
											variant="ghost"
											size="icon-sm"
											aria-label="Remove {humanize(filter.path)}"
											onclick={() => (draft.filters = draft.filters?.filter((_, j) => j !== i))}
										>
											<Icon name="x" class="size-4" />
										</Button>
									</li>
								{/each}
							</ul>
						{/if}
					</section>
				{/if}
			</form>

			<Dialog.Footer class="gap-2 sm:justify-between">
				{#if setup[card]}
					<Button variant="ghost" class="text-error" disabled={saving} onclick={clearCard}>
						Clear card
					</Button>
				{/if}
				<div class="flex gap-2 sm:ml-auto">
					<Button variant="secondary" disabled={saving} onclick={requestClose}>Cancel</Button>
					<Button type="submit" form="setup-form" disabled={saving}>
						{#if saving}<Icon name="loader-circle" class="animate-spin" />{/if}
						Save
					</Button>
				</div>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
