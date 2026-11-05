import { describe, expect, it } from "vitest";
import { moveItem, slotAtPoint, type Rect } from "./sortable";

describe("moveItem", () => {
	it("moves an item forward", () => {
		expect(moveItem(["a", "b", "c", "d"], 0, 2)).toEqual(["b", "c", "a", "d"]);
	});

	it("moves an item backward", () => {
		expect(moveItem(["a", "b", "c", "d"], 3, 0)).toEqual(["d", "a", "b", "c"]);
	});

	it("does not mutate the input", () => {
		const list = ["a", "b", "c"];
		moveItem(list, 0, 2);
		expect(list).toEqual(["a", "b", "c"]);
	});

	it("returns an unchanged copy for out-of-range indexes", () => {
		expect(moveItem(["a", "b"], 5, 0)).toEqual(["a", "b"]);
		expect(moveItem(["a", "b"], 0, -1)).toEqual(["a", "b"]);
	});
});

describe("slotAtPoint", () => {
	// A 2x2 grid of 100x50 slots with a 10px gap.
	const slots: Rect[] = [
		{ left: 0, top: 0, width: 100, height: 50 },
		{ left: 110, top: 0, width: 100, height: 50 },
		{ left: 0, top: 60, width: 100, height: 50 },
		{ left: 110, top: 60, width: 100, height: 50 }
	];

	it("finds the slot containing the point", () => {
		expect(slotAtPoint(slots, 10, 10)).toBe(0);
		expect(slotAtPoint(slots, 150, 20)).toBe(1);
		expect(slotAtPoint(slots, 50, 100)).toBe(2);
		expect(slotAtPoint(slots, 209, 109)).toBe(3);
	});

	it("returns -1 in the gaps and outside, so the list doesn't change there", () => {
		expect(slotAtPoint(slots, 105, 20)).toBe(-1);
		expect(slotAtPoint(slots, 50, 55)).toBe(-1);
		expect(slotAtPoint(slots, 500, 500)).toBe(-1);
	});
});
