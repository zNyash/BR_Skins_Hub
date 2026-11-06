import { describe, expect, it } from "vitest";
import { hasDescription, pickTab, resolveTabs, visibleTabs } from "./profile-tabs";

describe("resolveTabs", () => {
	it("defaults when nothing is stored", () => {
		expect(resolveTabs(undefined)).toEqual(["skins", "about", "setup"]);
	});

	it("keeps the stored order", () => {
		expect(resolveTabs(["setup", "about", "skins"])).toEqual(["setup", "about", "skins"]);
	});

	it("drops duplicates and unknown values, appends missing tabs in default order", () => {
		expect(resolveTabs(["about", "about", "nope"])).toEqual(["about", "skins", "setup"]);
	});
});

describe("visibleTabs", () => {
	const content = { skins: true, about: false, setup: false };

	it("shows only tabs with content to visitors", () => {
		expect(visibleTabs(["about", "skins", "setup"], content, false)).toEqual(["skins"]);
	});

	it("shows every tab to the owner", () => {
		expect(visibleTabs(["about", "skins", "setup"], content, true)).toEqual([
			"about",
			"skins",
			"setup"
		]);
	});
});

describe("hasDescription", () => {
	it.each([
		[undefined, false],
		["", false],
		["  \n ", false],
		["hi", true]
	])("%j → %s", (description, expected) => {
		expect(hasDescription(description)).toBe(expected);
	});
});

describe("pickTab", () => {
	it("uses the requested tab when visible", () => {
		expect(pickTab("about", ["skins", "about"])).toBe("about");
	});

	it("falls back to the first visible tab", () => {
		expect(pickTab("about", ["skins"])).toBe("skins");
		expect(pickTab(null, ["about", "skins"])).toBe("about");
	});
});
