import { describe, expect, it } from "vitest";
import {
	OTD_DIR,
	changedEntries,
	otdEntries,
	parseOtdConfig,
	planOtdWrite,
	rawUrl
} from "./otd";

describe("otdEntries", () => {
	const blob = (path: string, sha = "s") => ({ path, type: "blob", sha });

	it("keeps config json files under the configurations folder", () => {
		const tree = [
			blob(`${OTD_DIR}Wacom/CTL-472.json`, "abc"),
			{ path: `${OTD_DIR}Wacom`, type: "tree", sha: "t" },
			blob(`${OTD_DIR}README.md`),
			blob("OpenTabletDriver/Other/thing.json")
		];
		expect(otdEntries({ truncated: false, tree })).toEqual([
			{ otdPath: "Wacom/CTL-472", sha: "abc" }
		]);
	});

	it("refuses a truncated tree", () => {
		expect(() => otdEntries({ truncated: true, tree: [] })).toThrow("OTD tree is truncated");
	});
});

describe("changedEntries", () => {
	it("returns new files and files whose sha changed", () => {
		const stored = new Map([
			["A/x", "1"],
			["A/y", "2"]
		]);
		const entries = [
			{ otdPath: "A/x", sha: "1" },
			{ otdPath: "A/y", sha: "3" },
			{ otdPath: "A/z", sha: "4" }
		];
		expect(changedEntries(entries, stored)).toEqual([
			{ otdPath: "A/y", sha: "3" },
			{ otdPath: "A/z", sha: "4" }
		]);
	});
});

describe("parseOtdConfig", () => {
	const sample = {
		Name: "Wacom CTL-472",
		Specifications: { Digitizer: { Width: 152, Height: 95, MaxX: 15200 }, Pen: {} }
	};

	it("reads the name and full area", () => {
		expect(parseOtdConfig(sample)).toEqual({ name: "Wacom CTL-472", full_w: 152, full_h: 95 });
	});

	it("returns null when something is missing or invalid", () => {
		expect(parseOtdConfig({ ...sample, Name: undefined })).toBeNull();
		expect(parseOtdConfig({ Name: "X", Specifications: {} })).toBeNull();
		expect(
			parseOtdConfig({ Name: "X", Specifications: { Digitizer: { Width: 0, Height: 95 } } })
		).toBeNull();
		expect(parseOtdConfig("nope")).toBeNull();
		expect(parseOtdConfig(null)).toBeNull();
	});
});

describe("rawUrl", () => {
	it("points at the raw file on the pinned branch", () => {
		expect(rawUrl("Wacom/CTL-472")).toBe(
			"https://raw.githubusercontent.com/OpenTabletDriver/OpenTabletDriver/0.6.x/OpenTabletDriver.Configurations/Configurations/Wacom/CTL-472.json"
		);
	});
});

describe("planOtdWrite", () => {
	it("inserts only when no row has the path yet", () => {
		expect(planOtdWrite(null)).toBe("insert");
		expect(planOtdWrite({ _id: "d1" })).toBe("patch");
	});
});
