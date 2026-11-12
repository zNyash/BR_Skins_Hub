import { describe, expect, it } from "vitest";
import type { Id } from "$convex/_generated/dataModel";
import type { SkinWithPlayers } from "$lib/types";
import type { ImageItem } from "../../skin-images";
import {
	draftChanged,
	draftError,
	skinBody,
	snapshotFromSkin,
	type SkinDraft
} from "./skin-fields";

const rel = (id: string) => ({ _id: id as Id<"players"> }) as SkinWithPlayers["players"][number];

const skin = (fields: Partial<SkinWithPlayers> = {}) =>
	({
		_id: "s1" as Id<"skins">,
		_creationTime: 0,
		name: "Cool",
		download_url: "https://example.com/cool.osk",
		preview_images: ["https://img/a", "https://img/b"],
		players: [rel("p1"), rel("p2")],
		...fields
	}) as SkinWithPlayers;

const file = (name: string): ImageItem => ({
	id: `blob:${name}`,
	kind: "file",
	file: new File([], name),
	preview: `blob:${name}`
});

const edit = (fn: (d: SkinDraft) => void) => {
	const d = snapshotFromSkin(skin());
	fn(d);
	return d;
};

describe("snapshotFromSkin", () => {
	it("fills missing author and tags, and turns images into url items", () => {
		expect(snapshotFromSkin(skin())).toEqual({
			skin: { name: "Cool", author: "", download_url: "https://example.com/cool.osk", tags: [] },
			images: [
				{ id: "https://img/a", kind: "url", url: "https://img/a" },
				{ id: "https://img/b", kind: "url", url: "https://img/b" }
			],
			playerIds: ["p1", "p2"],
			osk: null
		});
	});
});

describe("draftChanged", () => {
	const base = snapshotFromSkin(skin());
	const changed = (fn: (d: SkinDraft) => void) => draftChanged(edit(fn), base);

	it("is false for an untouched draft", () => {
		expect(draftChanged(snapshotFromSkin(skin()), base)).toBe(false);
	});

	it("sees a changed field", () => {
		expect(changed((d) => (d.skin.author = "me"))).toBe(true);
		expect(changed((d) => d.skin.tags.push("hd"))).toBe(true);
	});

	it("sees reordered, removed and added images", () => {
		expect(changed((d) => d.images.reverse())).toBe(true);
		expect(changed((d) => d.images.pop())).toBe(true);
		expect(changed((d) => d.images.push(file("new")))).toBe(true);
	});

	it("ignores the order of players but sees who is assigned", () => {
		expect(changed((d) => d.playerIds.reverse())).toBe(false);
		expect(changed((d) => d.playerIds.pop())).toBe(true);
	});
});

describe("draftError", () => {
	it("is null for a valid draft", () => {
		expect(draftError(snapshotFromSkin(skin()))).toBeNull();
	});

	it("needs a name", () => {
		expect(draftError(edit((d) => (d.skin.name = "  ")))).toBe("Give the skin a name.");
	});

	it("needs a valid download link", () => {
		expect(draftError(edit((d) => (d.skin.download_url = "not a url")))).toBe(
			"Enter a valid download link."
		);
	});
});

describe("skinBody", () => {
	it("trims the text fields and sends images and players", () => {
		const d = edit((d) => {
			d.skin.name = " Cool ";
			d.skin.author = " me ";
			d.skin.download_url = " https://example.com/x ";
			d.skin.tags = ["hd"];
		});
		expect(skinBody(d, ["https://img/z"])).toEqual({
			name: "Cool",
			author: "me",
			download_url: "https://example.com/x",
			tags: ["hd"],
			preview_images: ["https://img/z"],
			player_ids: ["p1", "p2"]
		});
	});
});

describe("pending .osk", () => {
	const osk = new File(["x"], "a.osk");

	it("starts with no pending .osk", () => {
		expect(snapshotFromSkin(skin()).osk).toBeNull();
	});

	it("a pending .osk makes the draft changed", () => {
		const base = snapshotFromSkin(skin());
		expect(
			draftChanged(
				edit((d) => (d.osk = osk)),
				base
			)
		).toBe(true);
	});

	it("a pending .osk makes an invalid download link savable", () => {
		const d = edit((d) => {
			d.osk = osk;
			d.skin.download_url = "";
		});
		expect(draftError(d)).toBeNull();
	});

	it("without a .osk an invalid link is still an error", () => {
		expect(draftError(edit((d) => (d.skin.download_url = "")))).toBe(
			"Enter a valid download link."
		);
	});
});
