import { describe, expect, it } from "vitest";
import {
	OTD_DIR,
	blobUrl,
	changedEntries,
	configFromBlob,
	otdEntries,
	parseOtdConfig,
	planOtdWrite
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

describe("blobUrl", () => {
	it("points at the file's content by its sha, so it can't be a cached older version", () => {
		expect(blobUrl("abc123")).toBe(
			"https://api.github.com/repos/OpenTabletDriver/OpenTabletDriver/git/blobs/abc123"
		);
	});
});

describe("configFromBlob", () => {
	// GitHub sends blob content as base64 with line breaks every 60 characters.
	const blob = (text: string) => {
		const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(text)));
		return { encoding: "base64", content: b64.replace(/(.{60})/g, "$1\n") };
	};

	it("decodes the config, including non-ASCII names", () => {
		const json = JSON.stringify({
			Name: "Gaomon M10K Pro – Ünïcode",
			Specifications: { Digitizer: { Width: 254, Height: 158.75 } }
		});
		expect(configFromBlob(blob(json))).toEqual({
			name: "Gaomon M10K Pro – Ünïcode",
			full_w: 254,
			full_h: 158.75
		});
	});

	it("returns null for malformed JSON instead of throwing", () => {
		expect(configFromBlob(blob("{ not json"))).toBeNull();
	});

	it("returns null for an unexpected blob shape", () => {
		expect(configFromBlob({ encoding: "utf-8", content: "{}" })).toBeNull();
		expect(configFromBlob(null)).toBeNull();
	});
});

describe("planOtdWrite", () => {
	it("inserts only when no row has the path yet", () => {
		expect(planOtdWrite(null)).toBe("insert");
		expect(planOtdWrite({ _id: "d1" })).toBe("patch");
	});
});
