import { describe, expect, it } from "vitest";
import {
	hasDescription,
	moveVisibleTab,
	pickTab,
	resolveTabs,
	visibleTabs,
	withSettings
} from "./profile-tabs";

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

describe("withSettings", () => {
	it("appends settings for the owner only", () => {
		expect(withSettings(["skins", "about"], true)).toEqual(["skins", "about", "settings"]);
		expect(withSettings(["skins", "about"], false)).toEqual(["skins", "about"]);
	});

	it("lets a visitor's ?tab=settings fall back", () => {
		expect(pickTab("settings", withSettings(["skins"], false))).toBe("skins");
		expect(pickTab("settings", withSettings(["skins"], true))).toBe("settings");
	});
});

describe("moveVisibleTab", () => {
	it("moves within the full order when nothing is hidden", () => {
		const all = ["skins", "about", "setup"] as const;
		expect(moveVisibleTab(all, all, 0, 2)).toEqual(["about", "setup", "skins"]);
	});

	it("keeps a hidden tab in place", () => {
		// setup is hidden from the bar, sitting between the two visible tabs
		expect(moveVisibleTab(["skins", "setup", "about"], ["skins", "about"], 1, 0)).toEqual([
			"about",
			"setup",
			"skins"
		]);
	});

	it("ignores out-of-range moves", () => {
		expect(moveVisibleTab(["skins", "about", "setup"], ["skins", "about"], 1, 2)).toEqual([
			"skins",
			"about",
			"setup"
		]);
	});
});
