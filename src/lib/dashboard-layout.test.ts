import { describe, expect, it } from "vitest";
import {
	DEFAULT_LAYOUT,
	parseLayout,
	serializeLayout,
	showPinned,
	type DashboardLayout
} from "./dashboard-layout";

describe("parseLayout", () => {
	it("returns the defaults for a missing cookie", () => {
		expect(parseLayout(undefined)).toEqual(DEFAULT_LAYOUT);
	});

	it("returns the defaults for invalid JSON", () => {
		expect(parseLayout("{not json")).toEqual(DEFAULT_LAYOUT);
	});

	it("clamps widths into range", () => {
		const raw = JSON.stringify({ pinned: true, rail: 999, editor: 10 });
		expect(parseLayout(raw)).toEqual({ pinned: true, rail: 320, editor: 440 });
	});

	it("uses the default for fields of the wrong type", () => {
		const raw = JSON.stringify({ pinned: "yes", rail: "wide", editor: 800 });
		expect(parseLayout(raw)).toEqual({ ...DEFAULT_LAYOUT, editor: 800 });
	});
});

describe("serializeLayout", () => {
	const layout: DashboardLayout = { pinned: true, rail: 260, editor: 800 };
	const cookie = serializeLayout(layout);

	it("round-trips through parseLayout", () => {
		const value = cookie.split(";")[0].split("=")[1];
		expect(parseLayout(decodeURIComponent(value))).toEqual(layout);
	});

	it("sets the cookie attributes", () => {
		expect(cookie.toLowerCase()).toContain("path=/dashboard");
		expect(cookie.toLowerCase()).toContain("max-age=31536000");
		expect(cookie.toLowerCase()).toContain("samesite=lax");
	});
});

describe("showPinned", () => {
	const pinned = { ...DEFAULT_LAYOUT, pinned: true };

	it("needs a viewport of at least 1200px", () => {
		expect(showPinned(pinned, 1100)).toBe(false);
		expect(showPinned(pinned, 1200)).toBe(true);
	});

	it("is false when not pinned", () => {
		expect(showPinned(DEFAULT_LAYOUT, 1600)).toBe(false);
	});
});
