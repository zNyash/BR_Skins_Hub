import { describe, expect, it } from "vitest";
import type { Id } from "$convex/_generated/dataModel";
import type { Device } from "$lib/types";
import { deviceBody, draftChanged, draftError, snapshotFromDevice } from "./device-fields";

const device = (extra: Partial<Device> = {}): Device => ({
	_id: "d1" as Id<"devices">,
	_creationTime: 0,
	name: "Wacom CTL-472",
	type: "tablet",
	...extra
});

describe("snapshotFromDevice", () => {
	it("turns missing sizes into empty fields", () => {
		expect(snapshotFromDevice(device())).toEqual({
			name: "Wacom CTL-472",
			type: "tablet",
			full_w: "",
			full_h: "",
			image: null
		});
	});

	it("keeps sizes and the image", () => {
		const d = snapshotFromDevice(device({ full_w: 152, full_h: 95, image_url: "https://x/a.png" }));
		expect(d.full_w).toBe("152");
		expect(d.image).toEqual({ id: "https://x/a.png", kind: "url", url: "https://x/a.png" });
	});
});

describe("draftChanged", () => {
	it("is false for a fresh snapshot", () => {
		const base = snapshotFromDevice(device());
		expect(draftChanged(snapshotFromDevice(device()), base)).toBe(false);
	});

	it("notices a type change and an image swap", () => {
		const base = snapshotFromDevice(device({ image_url: "https://x/a.png" }));
		expect(draftChanged({ ...base, type: "mouse" }, base)).toBe(true);
		expect(
			draftChanged({ ...base, image: { id: "blob:1", kind: "url", url: "blob:1" } }, base)
		).toBe(true);
		expect(draftChanged({ ...base, image: null }, base)).toBe(true);
	});
});

describe("draftError", () => {
	const draft = snapshotFromDevice(device());

	it("requires a name", () => {
		expect(draftError({ ...draft, name: "  " })).toBe("Give the device a name.");
	});

	it("rejects sizes that aren't positive numbers on tablets", () => {
		expect(draftError({ ...draft, full_w: "0" })).toBe("Width must be a positive number.");
		expect(draftError({ ...draft, full_w: "abc" })).toBe("Width must be a positive number.");
		expect(draftError({ ...draft, full_h: "-2" })).toBe("Height must be a positive number.");
		expect(draftError({ ...draft, full_w: "152.5", full_h: "" })).toBeNull();
	});

	it("ignores sizes on other types", () => {
		expect(draftError({ ...draft, type: "mouse", full_w: "abc" })).toBeNull();
	});
});

describe("deviceBody", () => {
	const draft = snapshotFromDevice(device());

	it("drops sizes from non-tablets", () => {
		expect(deviceBody({ ...draft, type: "mouse", full_w: "1", full_h: "2" }, undefined)).toEqual({
			name: "Wacom CTL-472",
			type: "mouse"
		});
	});

	it("sends only the sizes that are filled, as numbers", () => {
		expect(
			deviceBody({ ...draft, name: " T ", full_w: "152", full_h: "" }, "https://x/a.png")
		).toEqual({ name: "T", type: "tablet", full_w: 152, image_url: "https://x/a.png" });
	});
});
