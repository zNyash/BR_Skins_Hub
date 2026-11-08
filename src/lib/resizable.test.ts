import { describe, expect, it } from "vitest";
import { clampWidth, widthFromPointer } from "./resizable";

describe("clampWidth", () => {
	it("raises values below the minimum", () => {
		expect(clampWidth(100, 200, 320)).toBe(200);
	});

	it("lowers values above the maximum", () => {
		expect(clampWidth(400, 200, 320)).toBe(320);
	});

	it("keeps values in range", () => {
		expect(clampWidth(250, 200, 320)).toBe(250);
	});
});

describe("widthFromPointer", () => {
	it("grows when moving left for a handle on the panel's left edge", () => {
		expect(widthFromPointer(720, 500, 450, "left")).toBe(770);
	});

	it("grows when moving right for a handle on the panel's right edge", () => {
		expect(widthFromPointer(240, 100, 140, "right")).toBe(280);
	});
});
