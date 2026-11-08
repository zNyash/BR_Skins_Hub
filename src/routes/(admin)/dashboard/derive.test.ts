import { describe, expect, it } from "vitest";
import type { Doc, Id } from "$convex/_generated/dataModel";
import type { SkinWithPlayers } from "$lib/types";
import {
	PLAYER_FILTERS,
	SKIN_FILTERS,
	isStale,
	onlyTabChanged,
	parseFilter,
	parseTab,
	recentlyEdited,
	setupFilled,
	skinCountByPlayer,
	step,
	stepPosition
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

const item = (id: string) => ({ _id: id });

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

describe("step and stepPosition", () => {
	const list = [item("a"), item("b"), item("c")];

	it("steps forward and backward, wrapping", () => {
		expect(step(list, "b", 1)).toBe("c");
		expect(step(list, "c", 1)).toBe("a");
		expect(step(list, "a", -1)).toBe("c");
	});

	it("goes to the first item when the id is absent", () => {
		expect(step(list, "zz", 1)).toBe("a");
	});

	it("returns null for an empty list", () => {
		expect(step([], "a", 1)).toBeNull();
	});

	it("gives a 1-based position, null when absent", () => {
		expect(stepPosition([item("a"), item("b")], "b")).toBe(2);
		expect(stepPosition([item("a"), item("b")], "zz")).toBeNull();
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
