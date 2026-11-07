import type { Setup } from "$convex/lib/setup";

export type { Setup };
export type CardId = "keyboard" | "tablet" | "mouse" | "monitor" | "in_game" | "pc";
export type Shape = "full" | "half" | "tall";
type MainInput = "tablet" | "mouse";

export const CARD_IDS: readonly CardId[] = [
	"keyboard",
	"tablet",
	"mouse",
	"monitor",
	"in_game",
	"pc"
];

export const STORAGE_LABELS = { nvme: "NVMe SSD", sata_ssd: "SATA SSD", hdd: "HDD" } as const;

/** The cards with data. Empty cards are never stored, so a key being there means it has data. */
export function presentCards(setup?: Setup | null): Set<CardId> {
	return new Set(CARD_IDS.filter((id) => setup?.[id]));
}

export function hasSetup(setup?: Setup | null): boolean {
	return presentCards(setup).size > 0;
}

/**
 * Each card's shape in the two-column grid, so any combination fills the space without gaps:
 * keyboard on top; layout K when tablet, mouse and monitor are all there; otherwise a wide tablet,
 * mouse and monitor paired side by side, in-game joining a lone one; anything alone full width.
 */
export function setupLayout(present: ReadonlySet<CardId>): { id: CardId; shape: Shape }[] {
	const layout: { id: CardId; shape: Shape }[] = [];
	if (present.has("keyboard")) layout.push({ id: "keyboard", shape: "full" });

	if (present.has("tablet") && present.has("mouse") && present.has("monitor")) {
		layout.push(
			{ id: "tablet", shape: "tall" },
			{ id: "mouse", shape: "half" },
			{ id: "monitor", shape: "half" }
		);
		if (present.has("in_game")) layout.push({ id: "in_game", shape: "full" });
	} else {
		if (present.has("tablet")) layout.push({ id: "tablet", shape: "full" });
		const halves = (["mouse", "monitor"] as const).filter((id) => present.has(id)) as CardId[];
		// An odd half card gets in-game as its partner; with no in-game it goes full width.
		const gameJoins = halves.length === 1 && present.has("in_game");
		if (gameJoins) halves.push("in_game");
		const shape: Shape = halves.length === 2 ? "half" : "full";
		for (const id of halves) layout.push({ id, shape });
		if (present.has("in_game") && !gameJoins) layout.push({ id: "in_game", shape: "full" });
	}

	if (present.has("pc")) layout.push({ id: "pc", shape: "full" });
	return layout;
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

/**
 * Where the active area sits on the tablet, in % of the full area, for the diagram. Null until both
 * sizes are known. No centre = centred. Kept inside the tablet even when the numbers don't fit.
 */
export function tabletDiagram(
	tablet: Setup["tablet"]
): { left: number; top: number; width: number; height: number } | null {
	const { area_w, area_h, full_w, full_h } = tablet ?? {};
	if (!area_w || !area_h || !full_w || !full_h) return null;

	const width = Math.min((area_w / full_w) * 100, 100);
	const height = Math.min((area_h / full_h) * 100, 100);
	const cx = ((tablet?.center_x ?? full_w / 2) / full_w) * 100;
	const cy = ((tablet?.center_y ?? full_h / 2) / full_h) * 100;
	return {
		left: clamp(cx - width / 2, 0, 100 - width),
		top: clamp(cy - height / 2, 0, 100 - height),
		width,
		height
	};
}

/** How the keyboard card shows rapid trigger: not at all, one value, or press and release. */
export function rtMode(keyboard: Setup["keyboard"]): "none" | "single" | "split" {
	if (keyboard?.rapid_trigger !== "enabled") return "none";
	return keyboard.rt_release !== undefined ? "split" : "single";
}

/**
 * The main_input change for a card's "This is my main input" toggle. Turning it off only clears
 * main_input when it points at this card, so it never undoes the other card's choice.
 */
export function mainInputPatch(
	current: MainInput | undefined,
	card: MainInput,
	on: boolean
): { main_input?: MainInput | null } {
	if (on) return current === card ? {} : { main_input: card };
	return current === card ? { main_input: null } : {};
}

type KeyboardDraft = {
	[K in keyof NonNullable<Setup["keyboard"]>]?: NonNullable<Setup["keyboard"]>[K] | null;
};

/**
 * The keyboard card as the dialog saves it. Press and release are kept whatever the RT state, so
 * turning rapid trigger off and on again doesn't lose them; the release is only cleared when the
 * "Different release value" box is unchecked.
 */
export function keyboardBody(
	draft: KeyboardDraft,
	rt: string,
	splitRelease: boolean
): KeyboardDraft {
	return {
		...draft,
		rapid_trigger: (rt || null) as KeyboardDraft["rapid_trigger"],
		rt_release: splitRelease ? draft.rt_release : null
	};
}

/**
 * How many filter chips (from the start) fit on one row. When they don't all fit, the rest collapse
 * into a "+N" chip, which needs room too. `gap` is the space between chips.
 */
export function visibleChips(
	widths: number[],
	available: number,
	moreWidth: number,
	gap: number
): number {
	const total = widths.reduce((sum, w, i) => sum + w + (i ? gap : 0), 0);
	if (total <= available) return widths.length;

	let used = moreWidth;
	let count = 0;
	for (const width of widths) {
		used += width + gap;
		if (used > available) break;
		count++;
	}
	return count;
}
