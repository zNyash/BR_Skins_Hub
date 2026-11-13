import { describe, expect, it } from "vitest";
import {
	cleanDevice,
	deleteError,
	deviceEditError,
	nameKey,
	relinkNeeded,
	type DeviceLike
} from "./devices";

const ctl: DeviceLike = {
	_id: "d1",
	name: "Wacom CTL-472",
	type: "tablet",
	otd_path: "Wacom/CTL-472"
};
const mouse: DeviceLike = { _id: "d2", name: "Logitech G Pro", type: "mouse" };

describe("nameKey", () => {
	it("trims, collapses spaces and lowercases", () => {
		expect(nameKey("  Wacom   CTL-472 ")).toBe("wacom ctl-472");
	});
});

describe("cleanDevice", () => {
	it("drops sizes from non-tablets and trims the name", () => {
		expect(cleanDevice({ name: " X ", type: "mouse", full_w: 1, full_h: 2 })).toEqual({
			name: "X",
			type: "mouse"
		});
	});

	it("keeps sizes on tablets", () => {
		expect(cleanDevice({ name: "X", type: "tablet", full_w: 1, full_h: 2 })).toEqual({
			name: "X",
			type: "tablet",
			full_w: 1,
			full_h: 2
		});
	});
});

describe("deviceEditError", () => {
	it("requires a name", () => {
		expect(deviceEditError({ name: "  ", type: "mouse" }, null, [])).toEqual({
			status: 400,
			message: "Name is required"
		});
	});

	it("rejects sizes that aren't positive", () => {
		expect(deviceEditError({ name: "T", type: "tablet", full_w: 0 }, null, [])).toEqual({
			status: 400,
			message: "Width must be a positive number"
		});
		expect(deviceEditError({ name: "T", type: "tablet", full_h: -3 }, null, [])).toEqual({
			status: 400,
			message: "Height must be a positive number"
		});
	});

	it("rejects a new device whose name differs only in case and spacing", () => {
		expect(deviceEditError({ name: "wacom ctl-472 ", type: "tablet" }, null, [ctl])).toEqual({
			status: 409,
			message: 'A tablet named "Wacom CTL-472" already exists'
		});
	});

	it("allows the same name on another type", () => {
		expect(deviceEditError({ name: "Wacom CTL-472", type: "mouse" }, null, [ctl])).toBeNull();
	});

	it("doesn't check names on an edit that keeps name and type", () => {
		const twin = { ...mouse, _id: "d3" };
		expect(
			deviceEditError({ name: "Logitech G Pro", type: "mouse" }, mouse, [mouse, twin])
		).toBeNull();
	});

	it("doesn't count the device itself as a duplicate", () => {
		expect(deviceEditError({ name: "logitech g pro", type: "mouse" }, mouse, [mouse])).toBeNull();
	});

	it("keeps imported tablets as tablets", () => {
		expect(deviceEditError({ name: ctl.name, type: "mouse" }, ctl, [ctl])).toEqual({
			status: 409,
			message: "Imported tablets stay tablets"
		});
	});
});

describe("deleteError", () => {
	it("refuses imported tablets", () => {
		expect(deleteError(ctl)).toEqual({
			status: 409,
			message: "Imported tablets can't be deleted; the next sync would bring them back"
		});
	});

	it("allows hand-made devices", () => {
		expect(deleteError(mouse)).toBeNull();
	});
});

describe("relinkNeeded", () => {
	it("is true for a new device", () => {
		expect(relinkNeeded({ name: "Wacom CTL-472", type: "tablet" }, null)).toBe(true);
	});

	it("is true when the name changes", () => {
		expect(relinkNeeded({ name: "Wacom CTL-480", type: "tablet" }, ctl)).toBe(true);
	});

	it("is false when only spacing and case change", () => {
		expect(relinkNeeded({ name: " wacom  ctl-472 ", type: "tablet" }, ctl)).toBe(false);
	});

	it("is true when the type changes", () => {
		expect(relinkNeeded({ name: "Logitech G Pro", type: "keyboard" }, mouse)).toBe(true);
	});

	it("is false for an image-only edit", () => {
		expect(
			relinkNeeded({ name: mouse.name, type: "mouse", image_url: "https://x.test/a.png" }, mouse)
		).toBe(false);
	});
});
