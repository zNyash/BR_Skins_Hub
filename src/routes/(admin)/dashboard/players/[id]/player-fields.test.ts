import { describe, expect, it } from "vitest";
import type { Doc, Id } from "$convex/_generated/dataModel";
import type { SkinWithPlayers } from "$lib/types";
import {
	draftChanged,
	playerPatch,
	playerSkinItems,
	snapshotFromPlayer,
	type PlayerDraft
} from "./player-fields";

const PLAYER_ID = "p1" as Id<"players">;

const player = (fields: Partial<Doc<"players">> = {}) =>
	({ _id: PLAYER_ID, _creationTime: 0, name: "Ana", osu_id: 1, ...fields }) as Doc<"players">;

const skin = (id: string, created: number, players: SkinWithPlayers["players"]) =>
	({ _id: id as Id<"skins">, _creationTime: created, players }) as unknown as SkinWithPlayers;

const rel = (position?: number, hidden = false, id = PLAYER_ID) =>
	({ _id: id, position, hidden }) as unknown as SkinWithPlayers["players"][number];

const draftOf = (p: Doc<"players">, skins: SkinWithPlayers[] = []): PlayerDraft => ({
	player: snapshotFromPlayer(p),
	skins: playerSkinItems(skins, p._id)
});

describe("snapshotFromPlayer", () => {
	it("fills missing lists and bio with empty values", () => {
		expect(snapshotFromPlayer(player())).toEqual({
			name: "Ana",
			cover_url: undefined,
			hue: undefined,
			description: undefined,
			bio: "",
			previous_usernames: [],
			links: [],
			tags: []
		});
	});
});

describe("playerSkinItems", () => {
	it("keeps only this player's skins, by position then newest first", () => {
		const skins = [
			skin("old", 1, [rel()]),
			skin("new", 2, [rel()]),
			skin("second", 3, [rel(1, true)]),
			skin("first", 4, [rel(0)]),
			skin("other", 5, [rel(0, false, "p2" as Id<"players">)])
		];
		expect(playerSkinItems(skins, PLAYER_ID).map((s) => [s.id, s.hidden])).toEqual([
			["first", false],
			["second", true],
			["new", false],
			["old", false]
		]);
	});
});

describe("draftChanged", () => {
	it("is false for equal drafts", () => {
		const skins = [skin("a", 1, [rel(0)])];
		expect(draftChanged(draftOf(player(), skins), draftOf(player(), skins))).toBe(false);
	});

	it("detects a field change", () => {
		expect(draftChanged(draftOf(player({ bio: "hi" })), draftOf(player()))).toBe(true);
	});

	it("detects a skin order change", () => {
		const a = [skin("a", 1, [rel(0)]), skin("b", 2, [rel(1)])];
		const b = [skin("a", 1, [rel(1)]), skin("b", 2, [rel(0)])];
		expect(draftChanged(draftOf(player(), a), draftOf(player(), b))).toBe(true);
	});
});

describe("playerPatch", () => {
	it("sends only the changed fields, and always the skins", () => {
		const base = draftOf(player({ tags: ["x"] }), [skin("a", 1, [rel(0)])]);
		const draft = structuredClone(base);
		draft.player.name = "Bia";
		draft.player.tags.push("y");
		draft.skins[0].hidden = true;
		expect(playerPatch(draft, base)).toEqual({
			name: "Bia",
			tags: ["x", "y"],
			skins: [{ id: "a", hidden: true }]
		});
	});

	it("sends just the skins when only they changed", () => {
		const base = draftOf(player(), [skin("a", 1, [rel(0)])]);
		const draft = structuredClone(base);
		draft.skins = [];
		expect(playerPatch(draft, base)).toEqual({ skins: [] });
	});
});
