import type { DeviceType } from "../validators";
import type { DeviceLike } from "./devices";

/** Lowercases and keeps only letters and digits, so "Wacom CTL-472" and "wacom ctl472" compare equal. */
export function normalizeModel(text: string): string {
	return text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

/**
 * The normalized names a device answers to: its full name, plus (for OpenTabletDriver
 * devices) the name without its vendor when the name starts with the vendor.
 */
export function deviceKeys(device: DeviceLike): string[] {
	const full = normalizeModel(device.name);
	const keys = [full];
	const vendor = device.otd_path ? normalizeModel(device.otd_path.split("/")[0]) : "";
	if (vendor && full.startsWith(vendor) && full.length > vendor.length) {
		keys.push(full.slice(vendor.length));
	}
	return keys;
}

/**
 * The one device of this type whose keys include the typed model, or null when the
 * model is empty, nothing matches, or more than one device matches.
 */
export function confidentMatch<D extends DeviceLike>(
	model: string | undefined,
	type: DeviceType,
	devices: D[]
): D | null {
	const key = normalizeModel(model ?? "");
	if (key === "") return null;
	const hits = devices.filter((x) => x.type === type && deviceKeys(x).includes(key));
	return hits.length === 1 ? hits[0] : null;
}
