import { describe, expect, it } from "vitest";
import { humanize, otdSettingsHint, parseOtdSettings } from "./otd";

const filter = (path: string, enable: boolean, settings: [string, unknown][]) => ({
	Path: path,
	Enable: enable,
	Settings: settings.map(([Property, Value]) => ({ Property, Value }))
});

const profile = {
	Tablet: "Wacom CTL-472",
	OutputMode: { Path: "OpenTabletDriver.Desktop.Output.AbsoluteMode" },
	Filters: [
		filter("VoiDPlugins.Filter.RadialFollowSmoothing", true, [
			["OuterRadius", 1.5],
			["SmoothingCoefficient", 0.30000000000000004],
			["Enabled", true],
			["Unset", null]
		]),
		filter("OpenTabletDriver.Plugin.Off", false, [["X", 1]])
	],
	AbsoluteModeSettings: {
		Display: { Width: 1920, Height: 1080, X: 960, Y: 540, Rotation: 0 },
		Tablet: { Width: 85.004, Height: 58.12, X: 108.5, Y: 63, Rotation: 90 }
	}
};

describe("parseOtdSettings", () => {
	it("reads the tablet name, area and only the enabled filters", () => {
		expect(parseOtdSettings(JSON.stringify({ Profiles: [profile] }))).toEqual([
			{
				tablet: "Wacom CTL-472",
				area: { area_w: 85, area_h: 58.12, center_x: 108.5, center_y: 63, rotation: 90 },
				filters: [
					{
						path: "VoiDPlugins.Filter.RadialFollowSmoothing",
						settings: [
							{ property: "OuterRadius", value: "1.5" },
							{ property: "SmoothingCoefficient", value: "0.3" },
							{ property: "Enabled", value: "true" }
						]
					}
				]
			}
		]);
	});

	it("returns every tablet profile", () => {
		const other = { ...profile, Tablet: "XP-Pen Star G640" };
		const result = parseOtdSettings(JSON.stringify({ Profiles: [profile, other] }));
		expect(result.map((p) => p.tablet)).toEqual(["Wacom CTL-472", "XP-Pen Star G640"]);
	});

	it("leaves out the area when the profile has none", () => {
		const relative = { ...profile, AbsoluteModeSettings: undefined };
		expect(parseOtdSettings(JSON.stringify({ Profiles: [relative] }))[0].area).toBeUndefined();
	});

	it("rejects files that aren't OpenTabletDriver settings", () => {
		expect(() => parseOtdSettings("not json")).toThrow("OpenTabletDriver");
		expect(() => parseOtdSettings(JSON.stringify({ foo: 1 }))).toThrow("OpenTabletDriver");
		expect(() => parseOtdSettings(JSON.stringify({ Profiles: [] }))).toThrow("OpenTabletDriver");
	});
});

describe("humanize", () => {
	it("keeps the last part of a type path and spaces out its words", () => {
		expect(humanize("VoiDPlugins.Filter.RadialFollowSmoothing")).toBe("Radial Follow Smoothing");
		expect(humanize("OuterRadius")).toBe("Outer Radius");
		expect(humanize("XOffset")).toBe("X Offset");
	});

	it("handles snake_case and lowerCamel names from plugins", () => {
		expect(humanize("slimy_scylla_position_smoothing")).toBe("Slimy Scylla Position Smoothing");
		expect(humanize("followRadius")).toBe("Follow Radius");
		expect(humanize("catch_up")).toBe("Catch Up");
	});
});

describe("otdSettingsHint", () => {
	it("picks the settings path for the visitor's system", () => {
		expect(otdSettingsHint("Mozilla/5.0 (Windows NT 10.0; Win64; x64)").path).toBe(
			"%localappdata%\\OpenTabletDriver\\settings.json"
		);
		expect(otdSettingsHint("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)").path).toBe(
			"~/Library/Application Support/OpenTabletDriver/settings.json"
		);
		expect(otdSettingsHint("Mozilla/5.0 (X11; Linux x86_64)").path).toBe(
			"~/.config/OpenTabletDriver/settings.json"
		);
	});
});
