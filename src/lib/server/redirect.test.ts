import { describe, expect, it } from "vitest";
import { safeRedirectTarget } from "./redirect";

const site = "https://brskins.com";

describe("safeRedirectTarget", () => {
	it("accepts same-origin urls", () => {
		expect(safeRedirectTarget("https://brskins.com/skins", site)).toBe("https://brskins.com/skins");
	});

	it("resolves paths against the site", () => {
		expect(safeRedirectTarget("/player/1", site)).toBe("https://brskins.com/player/1");
	});

	it("falls back to / without a target", () => {
		expect(safeRedirectTarget(null, site)).toBe("/");
	});

	it("rejects lookalike domains that start with the site url", () => {
		expect(safeRedirectTarget("https://brskins.com.evil.com/x", site)).toBe("/");
	});

	it("rejects protocol-relative urls", () => {
		expect(safeRedirectTarget("//evil.com", site)).toBe("/");
	});

	it("rejects other schemes", () => {
		expect(safeRedirectTarget("javascript:alert(1)", site)).toBe("/");
	});

	it("rejects unparseable urls", () => {
		expect(safeRedirectTarget("http://[bad", site)).toBe("/");
	});
});
