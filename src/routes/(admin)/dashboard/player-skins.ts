import type { Id } from "$convex/_generated/dataModel";

/** A skin in the player editor's list: its place is its index, plus whether the player hid it. */
export type DraftSkin = { id: Id<"skins">; hidden: boolean };

/** Whether two skin lists differ in membership, order or visibility. */
export function skinsChanged(a: readonly DraftSkin[], b: readonly DraftSkin[]): boolean {
	return a.length !== b.length || a.some((s, i) => s.id !== b[i].id || s.hidden !== b[i].hidden);
}
