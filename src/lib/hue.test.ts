import { describe, expect, it } from "vitest";
import { clampHue } from "./hue";

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
