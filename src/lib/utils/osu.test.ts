import { describe, expect, it } from "vitest";
import { parseOsuId } from "./osu";

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
