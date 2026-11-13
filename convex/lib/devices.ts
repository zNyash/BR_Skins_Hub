import type { DeviceType } from "../validators";

/** What an admin sends when creating or editing a device. */
export type DeviceInput = {
	name: string;
	type: DeviceType;
	full_w?: number;
	full_h?: number;
	image_url?: string;
};

/** The parts of a stored device the rules look at. */
export type DeviceLike = { _id: string; name: string; type: DeviceType; otd_path?: string };

type RuleError = { status: 400 | 409; message: string };

/** How names are compared: case, outer and repeated spaces don't make two names different. */
export function nameKey(name: string): string {
	return name.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Trims the name and drops the sizes from anything that isn't a tablet. */
export function cleanDevice(input: DeviceInput): DeviceInput {
	const { full_w, full_h, ...rest } = input;
	const device = { ...rest, name: input.name.trim() };
	return input.type === "tablet" ? { ...device, full_w, full_h } : device;
}

const notPositive = (n: number | undefined) => n !== undefined && !(n > 0);

/**
 * Why this create (`current` null) or edit can't be saved, or null when it can. The name is only
 * checked against the others when it or the type changes, so imported duplicates never block a
 * photo-only save.
 */
export function deviceEditError(
	next: DeviceInput,
	current: DeviceLike | null,
	all: DeviceLike[]
): RuleError | null {
	if (next.name.trim() === "") return { status: 400, message: "Name is required" };
	if (notPositive(next.full_w)) return { status: 400, message: "Width must be a positive number" };
	if (notPositive(next.full_h)) return { status: 400, message: "Height must be a positive number" };

	if (current?.otd_path && next.type !== current.type) {
		return { status: 409, message: "Imported tablets stay tablets" };
	}

	const key = nameKey(next.name);
	const renamed = !current || nameKey(current.name) !== key || current.type !== next.type;
	if (!renamed) return null;

	const twin = all.find(
		(d) => d._id !== current?._id && d.type === next.type && nameKey(d.name) === key
	);
	if (twin) return { status: 409, message: `A ${next.type} named "${twin.name}" already exists` };
	return null;
}

/** Why this device can't be deleted, or null when it can. */
export function deleteError(device: DeviceLike): { status: 409; message: string } | null {
	if (!device.otd_path) return null;
	return {
		status: 409,
		message: "Imported tablets can't be deleted; the next sync would bring them back"
	};
}

/** Whether saving this device can change which typed models match it: a create, a rename or a type change. */
export function relinkNeeded(next: DeviceInput, current: DeviceLike | null): boolean {
	if (!current) return true;
	return nameKey(next.name) !== nameKey(current.name) || next.type !== current.type;
}
