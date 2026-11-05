import { describe, expect, it } from "vitest";
import { mergeUsernames } from "./usernames";

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
