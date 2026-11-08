import type { Doc, Id } from "$convex/_generated/dataModel";
import { presentCards } from "$lib/setup";
import type { SkinWithPlayers } from "$lib/types";

export type PlayerFilter = "no-skins" | "no-setup" | "not-synced";
export type SkinFilter = "no-players" | "no-images";
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

export function parseFilter(kind: "players", v: string | null): PlayerFilter | null;
export function parseFilter(kind: "skins", v: string | null): SkinFilter | null;
export function parseFilter(kind: "players" | "skins", v: string | null) {
	const filters = kind === "players" ? PLAYER_FILTERS : SKIN_FILTERS;
	return filters.find((f) => f.id === v)?.id ?? null;
}

export function parseTab(v: string | null): EditorTab {
	return TABS.find((t) => t === v) ?? "profile";
}

/** 1-based position of `id` in the list, or null when it isn't there (e.g. filtered out). */
export function stepPosition<T extends { _id: string }>(list: T[], id: string): number | null {
	const i = list.findIndex((item) => item._id === id);
	return i === -1 ? null : i + 1;
}

/** The id before/after `id`, wrapping around. If `id` isn't in the list, the first id. */
export function step<T extends { _id: string }>(
	list: T[],
	id: string,
	delta: 1 | -1
): string | null {
	if (list.length === 0) return null;
	const i = list.findIndex((item) => item._id === id);
	if (i === -1) return list[0]._id;
	return list[(i + delta + list.length) % list.length]._id;
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

/** Query string ("?a=1&b=2", or "" when empty) with only the `keys` of `params` that are set. */
export function pickParams(params: URLSearchParams, keys: string[]): string {
	const kept = new URLSearchParams();
	for (const key of keys) {
		const value = params.get(key);
		if (value) kept.set(key, value);
	}
	return toQuery(kept);
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
