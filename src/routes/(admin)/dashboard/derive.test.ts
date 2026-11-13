import { describe, expect, it } from "vitest";
import type { Doc, Id } from "$convex/_generated/dataModel";
import type { SkinWithPlayers } from "$lib/types";
import {
	PLAYER_FILTERS,
	formatArea,
	syncSummary,
	SKIN_FILTERS,
	isStale,
	onlyTabChanged,
	parseFilter,
	parseTab,
	shouldBlock,
	recentlyEdited,
	setParam,
	setupFilled,
	skinCountByPlayer,
	timeAgo
} from "./derive";

const NOW = Date.UTC(2026, 10, 8);
const DAY = 24 * 60 * 60 * 1000;

const player = (over: Omit<Partial<Doc<"players">>, "_id"> & { _id: string }) =>
	({ _creationTime: 0, name: over._id, osu_id: 1, ...over }) as Doc<"players">;

const skin = (
	over: Omit<Partial<SkinWithPlayers>, "_id" | "players"> & {
		_id: string;
		players?: Doc<"players">[];
	}
): SkinWithPlayers =>
	({
		_creationTime: 0,
		name: over._id,
		download_url: "",
		download_count: 0,
		preview_images: [],
		players: [],
		...over
	}) as unknown as SkinWithPlayers;

describe("skinCountByPlayer", () => {
	it("counts skins per player and leaves out players without skins", () => {
		const a = player({ _id: "a" });
		const b = player({ _id: "b" });
		const counts = skinCountByPlayer([
			skin({ _id: "s1", players: [a, b] }),
			skin({ _id: "s2", players: [a] })
		]);
		expect(counts.get("a" as Id<"players">)).toBe(2);
		expect(counts.get("b" as Id<"players">)).toBe(1);
		expect(counts.has("c" as Id<"players">)).toBe(false);
	});
});

describe("setupFilled", () => {
	it("is 0 without a setup", () => {
		expect(setupFilled(player({ _id: "a" }))).toBe(0);
	});

	it("counts the present cards", () => {
		const setup = { keyboard: { name: "k" }, tablet: { name: "t" } } as Doc<"players">["setup"];
		expect(setupFilled(player({ _id: "a", setup }))).toBe(2);
	});
});

describe("isStale", () => {
	it("is true when never synced", () => {
		expect(isStale(player({ _id: "a" }), NOW)).toBe(true);
	});

	it("is false at 29 days and true at 31 days", () => {
		expect(isStale(player({ _id: "a", synced_at: NOW - 29 * DAY }), NOW)).toBe(false);
		expect(isStale(player({ _id: "a", synced_at: NOW - 31 * DAY }), NOW)).toBe(true);
	});
});

describe("filters", () => {
	const test = (id: string) => PLAYER_FILTERS.find((f) => f.id === id)!.test;
	const a = player({ _id: "a", synced_at: NOW });
	const withSkin = new Map([["a" as Id<"players">, 1]]);

	it("no-skins", () => {
		expect(test("no-skins")(a, { skinCounts: new Map(), now: NOW })).toBe(true);
		expect(test("no-skins")(a, { skinCounts: withSkin, now: NOW })).toBe(false);
	});

	it("no-setup", () => {
		const ctx = { skinCounts: withSkin, now: NOW };
		const setup = { keyboard: { name: "k" } } as Doc<"players">["setup"];
		expect(test("no-setup")(a, ctx)).toBe(true);
		expect(test("no-setup")(player({ _id: "b", setup }), ctx)).toBe(false);
	});

	it("not-synced", () => {
		const ctx = { skinCounts: withSkin, now: NOW };
		expect(test("not-synced")(player({ _id: "b" }), ctx)).toBe(true);
		expect(test("not-synced")(a, ctx)).toBe(false);
	});

	it("no-players", () => {
		const t = SKIN_FILTERS.find((f) => f.id === "no-players")!.test;
		expect(t(skin({ _id: "s" }))).toBe(true);
		expect(t(skin({ _id: "s", players: [a] }))).toBe(false);
	});

	it("no-images", () => {
		const t = SKIN_FILTERS.find((f) => f.id === "no-images")!.test;
		expect(t(skin({ _id: "s" }))).toBe(true);
		expect(t(skin({ _id: "s", preview_images: ["x"] }))).toBe(false);
	});

	it("has the expected labels", () => {
		expect(PLAYER_FILTERS.map((f) => f.label)).toEqual(["No skins", "No setup", "Not synced"]);
		expect(SKIN_FILTERS.map((f) => f.label)).toEqual(["No players", "No images"]);
	});
});

describe("parseFilter", () => {
	it("accepts known filters of the right kind", () => {
		expect(parseFilter("players", "no-skins")).toBe("no-skins");
		expect(parseFilter("skins", "no-images")).toBe("no-images");
	});

	it("rejects unknown values, null and the other kind's filters", () => {
		expect(parseFilter("players", "bogus")).toBeNull();
		expect(parseFilter("players", null)).toBeNull();
		expect(parseFilter("skins", "no-skins")).toBeNull();
	});
});

describe("parseTab", () => {
	it("accepts known tabs and defaults to profile", () => {
		expect(parseTab("links")).toBe("links");
		expect(parseTab("x")).toBe("profile");
		expect(parseTab(null)).toBe("profile");
	});
});

describe("recentlyEdited", () => {
	it("mixes kinds newest first, undated last, capped at n", () => {
		const p1 = player({ _id: "p1", updated_at: 10 });
		const p2 = player({ _id: "p2" });
		const s1 = skin({ _id: "s1", updated_at: 30 });
		const s2 = skin({ _id: "s2", updated_at: 20 });
		const result = recentlyEdited([p1, p2], [s1, s2], 3);
		expect(result.map((r) => r.doc._id)).toEqual(["s1", "s2", "p1"]);
		expect(result[0].kind).toBe("skin");
		expect(result[2].kind).toBe("player");
		expect(recentlyEdited([p1, p2], [s1, s2], 10).at(-1)!.doc._id).toBe("p2");
	});
});

describe("onlyTabChanged", () => {
	const url = (s: string) => new URL(s, "http://x");
	const base = "/dashboard/players/1?tab=skins&filter=no-skins";

	it("is true when only the tab differs", () => {
		expect(onlyTabChanged(url(base), url("/dashboard/players/1?tab=links&filter=no-skins"))).toBe(
			true
		);
	});

	it("is false for another id or another filter", () => {
		expect(onlyTabChanged(url(base), url("/dashboard/players/2?tab=skins&filter=no-skins"))).toBe(
			false
		);
		expect(onlyTabChanged(url(base), url("/dashboard/players/1?tab=skins&filter=no-setup"))).toBe(
			false
		);
	});
});

describe("shouldBlock", () => {
	const url = (s: string) => new URL(s, "http://x");
	const from = url("/dashboard/players/1?tab=profile");
	const other = url("/dashboard/players/2");
	const tab = url("/dashboard/players/1?tab=links");
	const nav = { dirty: false, saving: false, type: "link", from, to: other };

	it("allows anything while clean and idle", () => {
		expect(shouldBlock(nav)).toBe("allow");
	});

	it("blocks going to another item while dirty or saving", () => {
		expect(shouldBlock({ ...nav, dirty: true })).toBe("block");
		expect(shouldBlock({ ...nav, saving: true })).toBe("block");
	});

	it("allows a tab-only change while dirty", () => {
		expect(shouldBlock({ ...nav, dirty: true, to: tab })).toBe("allow");
	});

	it("leaves (cancel, no shake) on close/reload while dirty", () => {
		expect(shouldBlock({ ...nav, dirty: true, type: "leave", to: null })).toBe("leave");
	});
});

describe("timeAgo", () => {
	it("rounds down to the largest unit", () => {
		expect(timeAgo(NOW - 30 * 1000, NOW)).toBe("just now");
		expect(timeAgo(NOW - 5 * 60 * 1000, NOW)).toBe("5 min ago");
		expect(timeAgo(NOW - 3 * 60 * 60 * 1000, NOW)).toBe("3 h ago");
		expect(timeAgo(NOW - 2 * DAY, NOW)).toBe("2 d ago");
		expect(timeAgo(NOW - 125 * DAY, NOW)).toBe("4 mo ago");
		expect(timeAgo(NOW - 400 * DAY, NOW)).toBe("1 y ago");
	});
});

describe("setParam", () => {
	const params = new URLSearchParams("filter=no-skins&tab=links&q=x");

	it("sets, replaces or removes one key and keeps the rest", () => {
		expect(setParam(params, "tab", "setup")).toBe("?filter=no-skins&tab=setup&q=x");
		expect(setParam(params, "filter", null)).toBe("?tab=links&q=x");
		expect(setParam(new URLSearchParams("filter=a"), "filter", null)).toBe("");
		expect(params.get("tab")).toBe("links"); // the input isn't changed
	});
});

describe("device helpers", () => {
	const DAY = 24 * 60 * 60 * 1000;
	const now = 10 * DAY;
	const run = (extra: Partial<Doc<"deviceSync">>): Doc<"deviceSync"> => ({
		_id: "s1" as Id<"deviceSync">,
		_creationTime: 0,
		ran_at: now - 3 * DAY,
		ok: true,
		added: 2,
		updated: 1,
		skipped: [],
		...extra
	});

	it("parses device filters", () => {
		expect(parseFilter("devices", "mouse")).toBe("mouse");
		expect(parseFilter("devices", "pen")).toBeNull();
	});

	it("formats a tablet's full area", () => {
		expect(formatArea({ full_w: 152, full_h: 95 })).toBe("152 × 95 mm");
		expect(formatArea({ full_w: 152 })).toBeNull();
	});

	it("summarizes the last sync", () => {
		expect(syncSummary(run({}), now)).toEqual({
			text: "Synced with OpenTabletDriver 3 d ago · 2 added, 1 updated",
			error: false
		});
		expect(syncSummary(run({ skipped: ["A/x"] }), now)?.text).toBe(
			"Synced with OpenTabletDriver 3 d ago · 2 added, 1 updated · 1 skipped"
		);
		expect(syncSummary(run({ ok: false, error: "GitHub 403 for x" }), now)).toEqual({
			text: "Last sync failed: GitHub 403 for x",
			error: true
		});
		expect(syncSummary(null, now)).toEqual({
			text: "Never synced with OpenTabletDriver",
			error: false
		});
	});
});
