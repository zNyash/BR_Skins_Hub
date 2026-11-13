import { describe, expect, it } from "vitest";
import { confidentMatch, deviceKeys, normalizeModel } from "./device-match";
import type { DeviceType } from "../validators";

const d = (id: string, name: string, type: DeviceType = "tablet", otd_path?: string) => ({
	_id: id,
	name,
	type,
	otd_path
});
const ctl = d("1", "Wacom CTL-472", "tablet", "Wacom/CTL-472");

describe("device-match", () => {
	it("normalizeModel lowercases and keeps only letters and digits", () => {
		expect(normalizeModel("Wacom CTL-472")).toBe("wacomctl472");
		expect(normalizeModel("  ctl 472 ")).toBe("ctl472");
		expect(normalizeModel(" - ")).toBe("");
	});
	it("OTD devices also match without their vendor", () => {
		expect(deviceKeys(ctl)).toEqual(["wacomctl472", "ctl472"]);
		expect(confidentMatch("ctl472", "tablet", [ctl])).toBe(ctl);
		expect(confidentMatch("WACOM ctl-472", "tablet", [ctl])).toBe(ctl);
	});
	it("vendor is stripped only when the name starts with it", () => {
		expect(deviceKeys(d("2", "One by Wacom", "tablet", "Wacom/CTL-472"))).toEqual(["onebywacom"]);
	});
	it("hand-made devices only match their full name", () => {
		expect(deviceKeys(d("3", "Wooting 60HE", "keyboard"))).toEqual(["wooting60he"]);
		expect(confidentMatch("60he", "keyboard", [d("3", "Wooting 60HE", "keyboard")])).toBeNull();
	});
	it("only devices of the card's type match", () => {
		expect(confidentMatch("ctl472", "mouse", [ctl])).toBeNull();
	});
	it("a key shared by two devices is not confident", () => {
		const a = d("4", "Huion H420", "tablet", "Huion/H420");
		const b = d("5", "XP-Pen H420", "tablet", "XP-Pen/H420");
		expect(confidentMatch("h420", "tablet", [a, b])).toBeNull();
		expect(confidentMatch("huion h420", "tablet", [a, b])).toBe(a);
	});
	it("empty or punctuation-only models never match", () => {
		expect(confidentMatch(undefined, "tablet", [ctl])).toBeNull();
		expect(confidentMatch(" - ", "tablet", [d("6", "-", "tablet")])).toBeNull();
	});
});
