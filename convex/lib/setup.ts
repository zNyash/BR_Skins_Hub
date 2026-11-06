import type { Infer } from "convex/values";
import type { setup } from "../validators";

export type Setup = Infer<typeof setup>;
export type SetupPatch = { [K in keyof Setup]?: Setup[K] | null };

/** A card without its undefined fields and an empty storage list, or null if nothing is left. */
function pruneCard(card: object): object | null {
	const entries = Object.entries(card).filter(
		([, value]) => value !== undefined && !(Array.isArray(value) && value.length === 0)
	);
	return entries.length > 0 ? Object.fromEntries(entries) : null;
}

/**
 * Applies a setup change: each key sent replaces what's stored, null (or an empty card) removes
 * it, keys not sent stay as they are. Returns undefined when nothing is left.
 */
export function applySetupPatch(current: Setup | undefined, patch: SetupPatch): Setup | undefined {
	const next: Record<string, unknown> = { ...current };
	for (const [key, value] of Object.entries(patch)) {
		if (value === undefined) continue;
		const kept = value === null ? null : typeof value === "object" ? pruneCard(value) : value;
		if (kept === null) delete next[key];
		else next[key] = kept;
	}
	return Object.keys(next).length > 0 ? (next as Setup) : undefined;
}
