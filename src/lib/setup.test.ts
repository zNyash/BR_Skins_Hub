import { describe, expect, it } from "vitest";
import {
	displaySetup,
	linkedDevices,
	hasSetup,
	importedTablet,
	keyboardBody,
	mainInputPatch,
	rtMode,
	setupLayout,
	tabletDiagram,
	visibleChips,
	diagramRatio,
	type CardId,
	type LinkedDevice
} from "./setup";

const shapes = (...ids: CardId[]) => setupLayout(new Set(ids)).map((c) => `${c.id}:${c.shape}`);

describe("setupLayout", () => {
	it("uses layout K when tablet, mouse and monitor are all there", () => {
		expect(shapes("keyboard", "tablet", "mouse", "monitor", "in_game", "pc")).toEqual([
			"keyboard:full",
			"tablet:tall",
			"mouse:half",
			"monitor:half",
			"in_game:full",
			"pc:full"
		]);
	});

	it("pairs mouse and monitor when there's no tablet", () => {
		expect(shapes("keyboard", "mouse", "monitor", "in_game", "pc")).toEqual([
			"keyboard:full",
			"mouse:half",
			"monitor:half",
			"in_game:full",
			"pc:full"
		]);
	});

	it("turns the tablet full width and pairs in-game with a lone half card", () => {
		expect(shapes("keyboard", "tablet", "monitor", "in_game", "pc")).toEqual([
			"keyboard:full",
			"tablet:full",
			"monitor:half",
			"in_game:half",
			"pc:full"
		]);
	});

	it("makes a lone half card full width when there's no in-game card", () => {
		expect(shapes("keyboard", "tablet", "mouse", "pc")).toEqual([
			"keyboard:full",
			"tablet:full",
			"mouse:full",
			"pc:full"
		]);
	});

	it("shows only in-game full width", () => {
		expect(shapes("in_game")).toEqual(["in_game:full"]);
	});

	it("leaves out keyboard and pc when they're missing", () => {
		expect(shapes("tablet", "mouse", "monitor")).toEqual([
			"tablet:tall",
			"mouse:half",
			"monitor:half"
		]);
	});

	it("never leaves a half card without a partner", () => {
		const middle: CardId[] = ["tablet", "mouse", "monitor", "in_game"];
		for (let mask = 0; mask < 16; mask++) {
			const present = middle.filter((_, i) => mask & (1 << i));
			const layout = setupLayout(new Set<CardId>(["keyboard", ...present, "pc"]));
			const halves = layout.filter((c) => c.shape === "half");
			expect(halves.length % 2).toBe(0);
			if (layout.some((c) => c.shape === "tall")) {
				expect(halves.map((c) => c.id)).toEqual(["mouse", "monitor"]);
			}
		}
	});
});

describe("hasSetup", () => {
	it("is true only when a card has data", () => {
		expect(hasSetup(undefined)).toBe(false);
		expect(hasSetup({})).toBe(false);
		expect(hasSetup({ main_input: "tablet" })).toBe(false);
		expect(hasSetup({ mouse: { dpi: 1 } })).toBe(true);
	});
});

describe("tabletDiagram", () => {
	const area = { area_w: 80, area_h: 50, full_w: 160, full_h: 100 };

	it("needs both the area and the full size", () => {
		expect(tabletDiagram(undefined)).toBeNull();
		expect(tabletDiagram({ area_w: 80, area_h: 50 })).toBeNull();
		expect(tabletDiagram({ full_w: 160, full_h: 100 })).toBeNull();
	});

	it("centres the area when there's no centre", () => {
		expect(tabletDiagram(area)).toEqual({ left: 25, top: 25, width: 50, height: 50 });
	});

	it("keeps an off-edge area inside the tablet", () => {
		const d = tabletDiagram({ ...area, center_x: 140, center_y: 90 })!;
		expect(d.left + d.width).toBeLessThanOrEqual(100);
		expect(d.top + d.height).toBeLessThanOrEqual(100);
		expect(d.left).toBe(50);
	});

	it("clamps an area bigger than the tablet", () => {
		expect(tabletDiagram({ area_w: 200, area_h: 150, full_w: 160, full_h: 100 })).toEqual({
			left: 0,
			top: 0,
			width: 100,
			height: 100
		});
	});
});

describe("rtMode", () => {
	it("shows nothing unless rapid trigger is enabled", () => {
		expect(rtMode(undefined)).toBe("none");
		expect(rtMode({ rapid_trigger: "disabled", rt_press: 0.1 })).toBe("none");
	});

	it("shows one value, or press and release when release is set", () => {
		expect(rtMode({ rapid_trigger: "enabled" })).toBe("single");
		expect(rtMode({ rapid_trigger: "enabled", rt_press: 0.1 })).toBe("single");
		expect(rtMode({ rapid_trigger: "enabled", rt_press: 0.1, rt_release: 0.2 })).toBe("split");
	});
});

describe("mainInputPatch", () => {
	it("sets the card as main input when turned on", () => {
		expect(mainInputPatch(undefined, "tablet", true)).toEqual({ main_input: "tablet" });
		expect(mainInputPatch("mouse", "tablet", true)).toEqual({ main_input: "tablet" });
	});

	it("clears it only when it points at this card", () => {
		expect(mainInputPatch("tablet", "tablet", false)).toEqual({ main_input: null });
		expect(mainInputPatch("mouse", "tablet", false)).toEqual({});
	});

	it("sends nothing when nothing changes", () => {
		expect(mainInputPatch("mouse", "mouse", true)).toEqual({});
	});
});

describe("keyboardBody", () => {
	const draft = { model: "Wooting", rt_press: 0.1, rt_release: 0.2 };

	it("keeps press and release when rapid trigger is turned off", () => {
		expect(keyboardBody(draft, "disabled", true)).toMatchObject({
			rapid_trigger: "disabled",
			rt_press: 0.1,
			rt_release: 0.2
		});
	});

	it("clears the release only when the different-release box is unchecked", () => {
		expect(keyboardBody(draft, "enabled", false)).toMatchObject({
			rt_press: 0.1,
			rt_release: null
		});
	});

	it("sends null for an unset rapid trigger state", () => {
		expect(keyboardBody(draft, "", true).rapid_trigger).toBeNull();
	});
});

describe("visibleChips", () => {
	it("shows all when they fit", () => {
		expect(visibleChips([100, 100], 220, 40, 8)).toBe(2);
	});

	it("reserves room for the +N chip", () => {
		expect(visibleChips([100, 100, 100], 250, 40, 8)).toBe(1);
	});

	it("counts an exact fit", () => {
		expect(visibleChips([100, 100, 100], 256, 40, 8)).toBe(2);
	});

	it("shows none when the first chip alone is too wide", () => {
		expect(visibleChips([400, 100], 300, 40, 8)).toBe(0);
	});

	it("handles no filters", () => {
		expect(visibleChips([], 300, 40, 8)).toBe(0);
	});
});

describe("diagramRatio", () => {
	it("uses the full tablet size", () => {
		expect(diagramRatio({ full_w: 152, full_h: 95, area_w: 76, area_h: 76 })).toBe(1.6);
	});

	it("falls back to the area without a full size", () => {
		expect(diagramRatio({ area_w: 80, area_h: 40 })).toBe(2);
	});

	it("is square with neither", () => {
		expect(diagramRatio({})).toBe(1);
	});
});

describe("displaySetup / linkedDevices", () => {
	const id = (s: string) => s as LinkedDevice["_id"];
	const tabletDevice: LinkedDevice = {
		_id: id("t1"),
		name: "Wacom CTL-472",
		full_w: 152,
		full_h: 95
	};
	const setup = {
		tablet: {
			model: "my wacom",
			full_w: 150,
			full_h: 94,
			area_w: 50,
			area_h: 30,
			device_id: id("t1")
		},
		mouse: { model: "G Pro" }
	};

	it("shows the linked tablet's name and full area", () => {
		const shown = displaySetup(setup, { tablet: tabletDevice });
		expect(shown.tablet).toMatchObject({
			model: "Wacom CTL-472",
			full_w: 152,
			full_h: 95,
			area_w: 50
		});
	});

	it("keeps the card's own size when the device has none", () => {
		const shown = displaySetup(setup, { tablet: { _id: id("t1"), name: "Wacom" } });
		expect(shown.tablet).toMatchObject({ model: "Wacom", full_w: 150, full_h: 94 });
	});

	it("leaves unlinked cards unchanged", () => {
		expect(displaySetup(setup, { tablet: tabletDevice }).mouse).toEqual({ model: "G Pro" });
	});

	it("finds linked devices and skips ids missing from the catalog", () => {
		expect(linkedDevices(setup, [tabletDevice])).toEqual({ tablet: tabletDevice });
		expect(linkedDevices(setup, [])).toEqual({});
		expect(linkedDevices(undefined, [tabletDevice])).toEqual({});
	});
});

describe("importedTablet", () => {
	it("names an empty card after the imported tablet", () => {
		expect(importedTablet({}, undefined, "Wacom CTL-472")).toEqual({ model: "Wacom CTL-472" });
	});

	it("changes nothing when the linked device is the imported tablet", () => {
		const card = { model: "Wacom CTL-472", device_id: "t1" };
		expect(importedTablet(card, "Wacom CTL-472", "Wacom CTL-472")).toBeNull();
	});

	it("replaces a linked device with a different imported tablet", () => {
		const card = { model: "Wacom CTL-472", device_id: "t1" };
		expect(importedTablet(card, "Wacom CTL-472", "Huion H420")).toEqual({
			model: "Huion H420",
			device_id: undefined,
			link: undefined
		});
	});

	it("replaces a kept-as-typed name that only partly matches, clearing the flag", () => {
		const card = { model: "ctl472", link: "manual" };
		expect(importedTablet(card, undefined, "Wacom CTL-472")).toEqual({
			model: "Wacom CTL-472",
			device_id: undefined,
			link: undefined
		});
	});
});
