import { describe, expect, it } from "vitest";
import { clampHue, parseHue, pickHue } from "./hue";

describe("clampHue", () => {
	it.each([
		[120, 120],
		[0, 0],
		[360, 360],
		[-5, 0],
		[720, 360],
		[12.5, 12.5],
		[NaN, null],
		[Infinity, null],
		["120", null],
		[null, null],
		[undefined, null]
	])("clampHue(%j) → %j", (input, expected) => {
		expect(clampHue(input)).toBe(expected);
	});
});

describe("pickHue", () => {
	it("uses the profile's color on a profile page, whatever the viewer chose", () => {
		expect(pickHue(200, 150, true)).toBe(200);
		expect(pickHue(200, 150, false)).toBe(200);
	});

	it("uses the viewer's color elsewhere when they keep it on", () => {
		expect(pickHue(null, 150, true)).toBe(150);
	});

	it("falls back to the site default when the viewer turned it off", () => {
		expect(pickHue(null, 150, false)).toBeNull();
	});

	it("falls back to the site default with no color anywhere", () => {
		expect(pickHue(null, null, true)).toBeNull();
		expect(pickHue(undefined, undefined, true)).toBeNull();
	});

	it("never passes through a bad value", () => {
		expect(pickHue(NaN, 150, true)).toBe(150);
		expect(pickHue(null, 720, true)).toBe(360);
	});
});

describe("pickHue with a live preview", () => {
	it("shows the preview over everything", () => {
		expect(pickHue(200, 150, true, 40)).toBe(40);
	});

	it("ignores a missing or bad preview", () => {
		expect(pickHue(200, 150, true, null)).toBe(200);
		expect(pickHue(null, null, false, NaN)).toBeNull();
	});
});

describe("parseHue", () => {
	it.each([
		["", null],
		["abc", null],
		[" 120 ", 120],
		["-20", 0],
		["999", 360],
		["12.6", 13]
	])("parseHue(%j) → %j", (input, expected) => {
		expect(parseHue(input)).toBe(expected);
	});
});
