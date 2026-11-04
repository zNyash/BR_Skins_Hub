import { describe, expect, it } from "vitest";
import { normalizeTags } from "./tags";

describe("normalizeTags", () => {
	it("lowercases and trims", () => {
		expect(normalizeTags(["  Anime ", "HDDT"])).toEqual(["anime", "hddt"]);
	});

	it("collapses inner whitespace", () => {
		expect(normalizeTags(["dark   theme", "tab\tsep"])).toEqual(["dark theme", "tab sep"]);
	});

	it("drops empty and whitespace-only tags", () => {
		expect(normalizeTags(["", "   ", "ok"])).toEqual(["ok"]);
	});

	it("removes duplicates after normalizing, keeping the first position", () => {
		expect(normalizeTags(["b", "Anime", "a", "anime ", "B"])).toEqual(["b", "anime", "a"]);
	});

	it("returns an empty array for an empty list", () => {
		expect(normalizeTags([])).toEqual([]);
	});

	it("does not mutate the input", () => {
		const input = [" A "];
		normalizeTags(input);
		expect(input).toEqual([" A "]);
	});
});
