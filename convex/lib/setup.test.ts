import type { Id } from "../_generated/dataModel";
import { describe, expect, it } from "vitest";
import { applySetupPatch } from "./setup";

describe("applySetupPatch", () => {
	const current = { mouse: { dpi: 800 }, monitor: { refresh_hz: 240 } };

	it("replaces only the sent card", () => {
		expect(applySetupPatch(current, { mouse: { dpi: 1600 } })).toEqual({
			mouse: { dpi: 1600 },
			monitor: { refresh_hz: 240 }
		});
	});

	it("null removes a card", () => {
		expect(applySetupPatch(current, { monitor: null })).toEqual({ mouse: { dpi: 800 } });
	});

	it("an empty card object removes the card", () => {
		expect(applySetupPatch(current, { mouse: {} })).toEqual({ monitor: { refresh_hz: 240 } });
	});

	it("drops undefined fields inside a card", () => {
		const next = applySetupPatch(undefined, { mouse: { model: undefined, dpi: 800 } });
		expect(Object.keys(next!.mouse!)).toEqual(["dpi"]);
	});

	it("drops an empty pc storage list", () => {
		expect(applySetupPatch(undefined, { pc: { cpu: "R7", storage: [] } })).toEqual({
			pc: { cpu: "R7" }
		});
	});

	it("null main_input clears it", () => {
		expect(
			applySetupPatch({ main_input: "tablet", mouse: { dpi: 1 } }, { main_input: null })
		).toEqual({ mouse: { dpi: 1 } });
	});

	it("returns undefined when nothing is left", () => {
		expect(applySetupPatch({ mouse: { dpi: 1 } }, { mouse: null })).toBeUndefined();
	});

	it("keeps other cards when two editors patch different cards", () => {
		const first = applySetupPatch({}, { keyboard: { switch: "Lekker" } });
		expect(applySetupPatch(first, { tablet: { area_w: 80 } })).toEqual({
			keyboard: { switch: "Lekker" },
			tablet: { area_w: 80 }
		});
	});

	it("keeps a card that holds only a device link", () => {
		const device_id = "m1" as Id<"devices">;
		expect(applySetupPatch(undefined, { mouse: { device_id } })).toEqual({ mouse: { device_id } });
	});
});
