<script lang="ts">
	import { untrack } from "svelte";
	import { toast } from "svelte-sonner";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import * as Dialog from "$comp/ui/dialog";
	import { Input } from "$comp/ui/input";
	import * as Select from "$comp/ui/select";
	import { askConfirm } from "$lib/confirm.svelte";
	import {
		keyboardBody,
		mainInputPatch,
		STORAGE_LABELS,
		type CardId,
		type Setup
	} from "$lib/setup";
	import type { PlayerWithSkins } from "$lib/types";
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
	};

	const MODEL: Field = { key: "model", label: "Model" };
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
			{ key: "full_h", label: "Full area height", unit: "mm", number: true }
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

	let draft = $state<Draft>({});
	// Selects work on strings, so these live beside the draft and are converted on save.
	let rt = $state("");
	let rawInput = $state("");
	let splitRelease = $state(false);
	let mainInput = $state(false);
	let initial = "";
	let saving = $state(false);

	const snapshot = () => JSON.stringify({ draft, rt, rawInput, splitRelease, mainInput });
	const dirty = () => snapshot() !== initial;

	// A fresh draft each time a card is opened.
	$effect(() => {
		const id = card;
		untrack(() => {
			if (!id) return;
			const saved = (setup[id] ?? {}) as Draft;
			draft = { ...saved, storage: saved.storage?.map((drive) => ({ ...drive })) ?? [] };
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

{#snippet field(f: Field)}
	{@const inputId = `setup-${f.key}`}
	<div class="flex flex-col gap-1.5">
		<label for={inputId} class="text-sm">
			{f.label}
			{#if f.unit}<span class="text-text-muted">({f.unit})</span>{/if}
		</label>
		{#if f.number}
			<Input
				id={inputId}
				type="number"
				step={f.whole ? 1 : "any"}
				bind:value={draft[f.key] as number | null | undefined}
			/>
		{:else}
			<Input id={inputId} maxlength={100} bind:value={draft[f.key] as string | null | undefined} />
		{/if}
	</div>
{/snippet}

<Dialog.Root open={card !== null}>
	<Dialog.Content
		class="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-layer-1 sm:max-w-lg"
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
					<Icon name={CARD_INFO[card].icon} class="size-5 text-primary" />
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
						<legend class="mb-1.5 text-sm">Storage</legend>
						{#each draft.storage ?? [] as drive, i (i)}
							<div class="flex gap-2">
								<Select.Root type="single" bind:value={drive.kind}>
									<Select.Trigger class="w-32 shrink-0" aria-label="Drive {i + 1} type">
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
					{#each FIELDS[card] as f (f.key)}{@render field(f)}{/each}
				{/if}

				{#if card === "keyboard"}
					<div class="flex flex-col gap-1.5">
						<span class="text-sm" id="setup-rt-label">Rapid trigger</span>
						<Select.Root type="single" bind:value={rt}>
							<Select.Trigger aria-labelledby="setup-rt-label">
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
						<label class="flex items-center gap-2 text-sm sm:col-span-2">
							<input type="checkbox" class="size-4 accent-primary" bind:checked={splitRelease} />
							Different release value
						</label>
						{#if splitRelease}
							{@render field({ key: "rt_release", label: "Release", unit: "mm", number: true })}
						{/if}
					{/if}
				{/if}

				{#if card === "in_game"}
					<div class="flex flex-col gap-1.5">
						<span class="text-sm" id="setup-raw-label">Raw input</span>
						<Select.Root type="single" bind:value={rawInput}>
							<Select.Trigger aria-labelledby="setup-raw-label">
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
					<label class="flex items-center gap-2 text-sm sm:col-span-2">
						<input type="checkbox" class="size-4 accent-primary" bind:checked={mainInput} />
						This is my main input
					</label>
				{/if}
			</form>

			<Dialog.Footer class="gap-2 sm:justify-between">
				{#if setup[card]}
					<Button variant="ghost" class="text-destructive" disabled={saving} onclick={clearCard}>
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
