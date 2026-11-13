import type { Doc, Id } from "$convex/_generated/dataModel";
import { DEVICE_LABELS } from "$lib/devices";
import { presentCards } from "$lib/setup";
import type { Device, SkinWithPlayers } from "$lib/types";
import { DEVICE_TYPES, type DeviceType } from "$convex/validators";

export type PlayerFilter = "no-skins" | "no-setup" | "not-synced";
export type SkinFilter = "no-players" | "no-images";
export type DeviceFilter = DeviceType;
export type EditorTab = "profile" | "skins" | "links" | "setup";

const STALE_AFTER_MS = 30 * 24 * 60 * 60 * 1000;
const TABS: readonly EditorTab[] = ["profile", "skins", "links", "setup"];

/** How many skins each player uses. Players on no skin are absent (use `?? 0`). */
export function skinCountByPlayer(skins: SkinWithPlayers[]): Map<Id<"players">, number> {
	const counts = new Map<Id<"players">, number>();
	for (const skin of skins) {
		for (const p of skin.players) counts.set(p._id, (counts.get(p._id) ?? 0) + 1);
	}
	return counts;
}

/** Number of setup cards (0-6) the player has filled in. */
export function setupFilled(player: Doc<"players">): number {
	return presentCards(player.setup).size;
}

/** Never synced from osu!, or not in the last 30 days. */
export function isStale(player: Doc<"players">, now: number): boolean {
	return player.synced_at === undefined || now - player.synced_at > STALE_AFTER_MS;
}

export const PLAYER_FILTERS: readonly {
	id: PlayerFilter;
	label: string;
	test: (
		p: Doc<"players">,
		ctx: { skinCounts: Map<Id<"players">, number>; now: number }
	) => boolean;
}[] = [
	{ id: "no-skins", label: "No skins", test: (p, ctx) => !ctx.skinCounts.get(p._id) },
	{ id: "no-setup", label: "No setup", test: (p) => setupFilled(p) === 0 },
	{ id: "not-synced", label: "Not synced", test: (p, ctx) => isStale(p, ctx.now) }
];

export const SKIN_FILTERS: readonly {
	id: SkinFilter;
	label: string;
	test: (s: SkinWithPlayers) => boolean;
}[] = [
	{ id: "no-players", label: "No players", test: (s) => s.players.length === 0 },
	{ id: "no-images", label: "No images", test: (s) => s.preview_images.length === 0 }
];

export const DEVICE_FILTERS: readonly {
	id: DeviceFilter;
	label: string;
	test: (d: Device) => boolean;
}[] = DEVICE_TYPES.map((type) => ({
	id: type,
	label: DEVICE_LABELS[type].many,
	test: (d: Device) => d.type === type
}));

export function parseFilter(kind: "players", v: string | null): PlayerFilter | null;
export function parseFilter(kind: "skins", v: string | null): SkinFilter | null;
export function parseFilter(kind: "devices", v: string | null): DeviceFilter | null;
export function parseFilter(kind: "players" | "skins" | "devices", v: string | null) {
	const filters =
		kind === "players" ? PLAYER_FILTERS : kind === "skins" ? SKIN_FILTERS : DEVICE_FILTERS;
	return filters.find((f) => f.id === v)?.id ?? null;
}

export function parseTab(v: string | null): EditorTab {
	return TABS.find((t) => t === v) ?? "profile";
}

type Recent = { kind: "player"; doc: Doc<"players"> } | { kind: "skin"; doc: SkinWithPlayers };

/** The `n` most recently edited players and skins together, newest first; undated ones last. */
export function recentlyEdited(
	players: Doc<"players">[],
	skins: SkinWithPlayers[],
	n: number
): Recent[] {
	const all: Recent[] = [
		...players.map((doc) => ({ kind: "player" as const, doc })),
		...skins.map((doc) => ({ kind: "skin" as const, doc }))
	];
	const time = (r: Recent) => r.doc.updated_at ?? -Infinity;
	// Compare instead of subtracting: -Infinity - -Infinity is NaN.
	return all.sort((a, b) => (time(a) < time(b) ? 1 : time(a) > time(b) ? -1 : 0)).slice(0, n);
}

/** Same page and params, only `?tab=` differs (switching tabs shouldn't reset the editor). */
export function onlyTabChanged(from: URL, to: URL): boolean {
	if (from.pathname !== to.pathname) return false;
	const strip = (u: URL) => {
		const p = new URLSearchParams(u.search);
		p.delete("tab");
		p.sort();
		return p.toString();
	};
	return strip(from) === strip(to);
}

/**
 * What to do with a navigation while an editor is open: "block" cancels it and shakes the bar;
 * "leave" (close/reload/external) only cancels, which makes the browser show its own prompt.
 * Unsaved changes or a pending save block everything except a tab switch on the same page.
 */
export function shouldBlock(nav: {
	dirty: boolean;
	saving: boolean;
	type: string;
	from: URL | null;
	to: URL | null;
}): "allow" | "block" | "leave" {
	if (!nav.dirty && !nav.saving) return "allow";
	if (nav.from && nav.to && onlyTabChanged(nav.from, nav.to)) return "allow";
	return nav.type === "leave" ? "leave" : "block";
}

/** Short relative time for list rows: "just now", "5 min ago", "3 h ago", "2 d ago", "4 mo ago", "1 y ago". */
export function timeAgo(time: number, now: number): string {
	const min = Math.floor((now - time) / 60000);
	if (min < 1) return "just now";
	if (min < 60) return `${min} min ago`;
	const h = Math.floor(min / 60);
	if (h < 24) return `${h} h ago`;
	const d = Math.floor(h / 24);
	if (d < 30) return `${d} d ago`;
	const mo = Math.floor(d / 30);
	return mo < 12 ? `${mo} mo ago` : `${Math.floor(d / 365)} y ago`;
}

/** Query string of `params` with `key` set to `value`, or removed when `value` is null. */
export function setParam(params: URLSearchParams, key: string, value: string | null): string {
	const next = new URLSearchParams(params);
	if (value === null) next.delete(key);
	else next.set(key, value);
	return toQuery(next);
}

function toQuery(params: URLSearchParams): string {
	const s = params.toString();
	return s ? `?${s}` : "";
}

/** A tablet's full area, "152 × 95 mm", or null when a size is missing. */
export function formatArea(d: { full_w?: number; full_h?: number }): string | null {
	return d.full_w && d.full_h ? `${d.full_w} × ${d.full_h} mm` : null;
}

/** The status line under the Devices header: how the last OpenTabletDriver sync went. */
export function syncSummary(
	run: Doc<"deviceSync"> | null,
	now: number
): { text: string; error: boolean } {
	if (!run) return { text: "Never synced with OpenTabletDriver", error: false };
	if (!run.ok) return { text: `Last sync failed: ${run.error ?? "unknown error"}`, error: true };
	const skipped = run.skipped.length > 0 ? ` · ${run.skipped.length} skipped` : "";
	return {
		text: `Synced with OpenTabletDriver ${timeAgo(run.ran_at, now)} · ${run.added} added, ${run.updated} updated${skipped}`,
		error: false
	};
}
