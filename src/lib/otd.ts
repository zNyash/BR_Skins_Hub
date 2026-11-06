/** Reading OpenTabletDriver's settings.json, in the browser, to fill in the Tablet card. */

export type OtdFilter = { path: string; settings: { property: string; value: string }[] };

export type OtdProfile = {
	/** OTD's name for the tablet, e.g. "Wacom CTL-472". */
	tablet: string;
	/** The absolute-mode tablet area in mm; X/Y are its centre. Missing for relative-mode profiles. */
	area?: { area_w: number; area_h: number; center_x: number; center_y: number; rotation: number };
	/** Only the filters that are turned on. */
	filters: OtdFilter[];
};

const NOT_OTD = "That doesn't look like an OpenTabletDriver settings.json";

type Json = Record<string, unknown>;
const isObject = (value: unknown): value is Json =>
	typeof value === "object" && value !== null && !Array.isArray(value);
const round = (n: number, digits: number) => Number(n.toFixed(digits));

function settingValue(value: unknown): string | null {
	if (value === null || value === undefined) return null;
	if (typeof value === "number") return String(round(value, 4));
	if (typeof value === "string" || typeof value === "boolean") return String(value);
	return JSON.stringify(value);
}

function readArea(profile: Json): OtdProfile["area"] {
	const absolute = profile.AbsoluteModeSettings;
	const area = isObject(absolute) ? absolute.Tablet : undefined;
	if (!isObject(area)) return undefined;
	const num = (key: string) => (typeof area[key] === "number" ? round(area[key], 2) : 0);
	return {
		area_w: num("Width"),
		area_h: num("Height"),
		center_x: num("X"),
		center_y: num("Y"),
		rotation: num("Rotation")
	};
}

function readFilters(profile: Json): OtdFilter[] {
	const filters = Array.isArray(profile.Filters) ? profile.Filters : [];
	return filters.filter(isObject).flatMap((filter) => {
		if (filter.Enable !== true || typeof filter.Path !== "string") return [];
		const settings = (Array.isArray(filter.Settings) ? filter.Settings : [])
			.filter(isObject)
			.flatMap((s) => {
				const value = settingValue(s.Value);
				return typeof s.Property === "string" && value !== null
					? [{ property: s.Property, value }]
					: [];
			});
		return [{ path: filter.Path, settings }];
	});
}

/** Every tablet profile in the file. Throws a readable error for anything that isn't OTD's settings. */
export function parseOtdSettings(text: string): OtdProfile[] {
	let root: unknown;
	try {
		root = JSON.parse(text);
	} catch {
		throw new Error(NOT_OTD);
	}
	const profiles =
		isObject(root) && Array.isArray(root.Profiles) ? root.Profiles.filter(isObject) : [];
	if (profiles.length === 0) throw new Error(NOT_OTD);

	return profiles.map((profile) => ({
		tablet: typeof profile.Tablet === "string" ? profile.Tablet : "Unknown tablet",
		area: readArea(profile),
		filters: readFilters(profile)
	}));
}

/** "VoiDPlugins.Filter.RadialFollowSmoothing" → "Radial Follow Smoothing"; also snake_case and lowerCamel. */
export function humanize(name: string): string {
	const last = name.split(".").pop() ?? name;
	return last
		.replace(/_+/g, " ")
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
		.replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
		.trim();
}

/** Where OTD keeps settings.json on the visitor's system, and how to paste a path into the file picker. */
export function otdSettingsHint(userAgent: string): { path: string; howTo: string } {
	if (/Windows/i.test(userAgent)) {
		return {
			path: "%localappdata%\\OpenTabletDriver\\settings.json",
			howTo: "Paste it into the file name box of the file picker."
		};
	}
	if (/Mac OS X|Macintosh/i.test(userAgent)) {
		return {
			path: "~/Library/Application Support/OpenTabletDriver/settings.json",
			howTo: "In the file picker, press Cmd+Shift+G and paste it."
		};
	}
	return {
		path: "~/.config/OpenTabletDriver/settings.json",
		howTo: "In the file picker, press Ctrl+L and paste it."
	};
}
