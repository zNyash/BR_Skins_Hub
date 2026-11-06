import { describe, expect, it } from "vitest";
import { clampHue, pickHue } from "./hue";

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
