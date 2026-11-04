import { describe, expect, it } from "vitest";
import { mergeUsernames, parseOsuId } from "./osu";

describe("mergeUsernames", () => {
	it("keeps existing names and appends new ones at the end", () => {
		expect(mergeUsernames(["a", "b"], ["b", "c"])).toEqual(["a", "b", "c"]);
	});

	it("never removes names that disappeared from osu!", () => {
		expect(mergeUsernames(["a", "b", "c"], ["c"])).toEqual(["a", "b", "c"]);
	});

	it("keeps the existing order untouched", () => {
		expect(mergeUsernames(["z", "a"], ["a", "z", "m"])).toEqual(["z", "a", "m"]);
	});

	it("does not add duplicates, even if osu! sends the same name twice", () => {
		expect(mergeUsernames([], ["x", "x", "y"])).toEqual(["x", "y"]);
	});

	it("handles empty inputs", () => {
		expect(mergeUsernames([], [])).toEqual([]);
		expect(mergeUsernames(["a"], [])).toEqual(["a"]);
	});

	it("does not mutate the existing array", () => {
		const existing = ["a"];
		mergeUsernames(existing, ["b"]);
		expect(existing).toEqual(["a"]);
	});
});

describe("parseOsuId", () => {
	it("accepts a plain numeric id", () => {
		expect(parseOsuId("7562902")).toBe(7562902);
		expect(parseOsuId("  7562902  ")).toBe(7562902);
	});

	it("extracts the id from profile urls", () => {
		expect(parseOsuId("https://osu.ppy.sh/users/7562902")).toBe(7562902);
		expect(parseOsuId("https://osu.ppy.sh/users/7562902/osu")).toBe(7562902);
		expect(parseOsuId("osu.ppy.sh/u/7562902")).toBe(7562902);
		expect(parseOsuId("https://osu.ppy.sh/users/7562902?mode=taiko")).toBe(7562902);
	});

	it("returns null for anything else", () => {
		expect(parseOsuId("")).toBeNull();
		expect(parseOsuId("mrekk")).toBeNull();
		expect(parseOsuId("0")).toBeNull();
		expect(parseOsuId("-5")).toBeNull();
		expect(parseOsuId("12.5")).toBeNull();
		expect(parseOsuId("https://example.com/users/123")).toBeNull();
	});
});
