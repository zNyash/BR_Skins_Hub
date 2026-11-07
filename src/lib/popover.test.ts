import { describe, expect, it } from "vitest";
import { placePopover } from "./popover";

const viewport = { width: 1000, height: 800 };
const popover = { width: 300, height: 150 };

describe("placePopover", () => {
	it("opens below the trigger, aligned to its left edge", () => {
		const trigger = { top: 100, left: 200, width: 80, height: 20 };
		expect(placePopover(trigger, popover, viewport)).toEqual({ top: 128, left: 200 });
	});

	it("flips above when there is no room below", () => {
		const trigger = { top: 700, left: 200, width: 80, height: 20 };
		expect(placePopover(trigger, popover, viewport)).toEqual({ top: 542, left: 200 });
	});

	it("stays below when there is no room above either", () => {
		const trigger = { top: 100, left: 200, width: 80, height: 20 };
		expect(placePopover(trigger, { width: 300, height: 790 }, viewport).top).toBe(128);
	});

	it("clamps to the right edge", () => {
		const trigger = { top: 100, left: 900, width: 80, height: 20 };
		expect(placePopover(trigger, popover, viewport).left).toBe(692);
	});

	it("clamps to the left edge", () => {
		const trigger = { top: 100, left: -50, width: 80, height: 20 };
		expect(placePopover(trigger, popover, viewport).left).toBe(8);
	});
});
