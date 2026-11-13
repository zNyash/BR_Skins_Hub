import type { Id } from "../_generated/dataModel";
import type { DatabaseWriter } from "../_generated/server";
import type { DeviceType } from "../validators";
import { confidentMatch } from "./device-match";
import type { Setup, SetupPatch } from "./setup";

export const LINKABLE_CARDS = ["keyboard", "tablet", "mouse", "monitor"] as const;
export type LinkableCard = (typeof LINKABLE_CARDS)[number];

export type LinkDevice = { _id: Id<"devices">; name: string; type: DeviceType; otd_path?: string };

type LinkFields = { model?: string; device_id?: Id<"devices">; link?: "manual" };

/**
 * Applies the link rules to the cards of a setup change:
 * 1. a picked device must exist and be of the card's type; a stray manual flag is dropped;
 * 2. a manual flag stays only while the model is unchanged from the stored card;
 * 3. otherwise a card whose typed model confidently matches one device gets linked.
 * A card already linked and still carrying its device_id keeps it (rule 1 covers it).
 */
export function linkPatch(
	patch: SetupPatch,
	current: Setup | undefined,
	devices: LinkDevice[]
): { patch: SetupPatch } | { status: 400; message: string } {
	const next: SetupPatch = { ...patch };
	for (const card of LINKABLE_CARDS) {
		const value = patch[card] as LinkFields | null | undefined;
		if (!value) continue;
		const { link, ...rest } = value;

		if (rest.device_id) {
			const device = devices.find((d) => d._id === rest.device_id);
			if (!device) return { status: 400, message: "That device no longer exists" };
			if (device.type !== card) return { status: 400, message: `That device isn't a ${card}` };
			next[card] = rest;
			continue;
		}

		if (link === "manual" && value.model === (current?.[card] as LinkFields | undefined)?.model) {
			next[card] = value;
			continue;
		}

		const match = confidentMatch(rest.model, card, devices);
		next[card] = match ? { ...rest, device_id: match._id } : rest;
	}
	return { patch: next };
}

/** Links every unlinked, unflagged card whose model confidently matches. Null when nothing changed. */
export function relinkSetup(setup: Setup | undefined, devices: LinkDevice[]): Setup | null {
	if (!setup) return null;
	let changed = false;
	const next: Setup = { ...setup };
	for (const card of LINKABLE_CARDS) {
		const value = setup[card] as LinkFields | undefined;
		if (!value || value.device_id || value.link === "manual") continue;
		const match = confidentMatch(value.model, card, devices);
		if (!match) continue;
		next[card] = { ...value, device_id: match._id };
		changed = true;
	}
	return changed ? next : null;
}

/** Removes the link to a deleted device from every card (no manual flag). Null when nothing changed. */
export function unlinkDevice(setup: Setup | undefined, deviceId: Id<"devices">): Setup | null {
	if (!setup) return null;
	let changed = false;
	const next: Setup = { ...setup };
	for (const card of LINKABLE_CARDS) {
		const value = setup[card] as LinkFields | undefined;
		if (value?.device_id !== deviceId) continue;
		const { device_id: _unused, ...rest } = value;
		next[card] = rest;
		changed = true;
	}
	return changed ? next : null;
}

/** Unlinks a device from every player's cards, e.g. before the device is deleted. */
export async function clearDeviceLinks(db: DatabaseWriter, deviceId: Id<"devices">): Promise<void> {
	for (const player of await db.query("players").collect()) {
		const setup = unlinkDevice(player.setup, deviceId);
		if (setup) await db.patch(player._id, { setup });
	}
}
