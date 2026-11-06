import { invalidate } from "$app/navigation";
import type { SetupPatch } from "$convex/lib/setup";
import { request } from "$lib/api";

/** Saves Setup tab cards (the owner's or, for admins, anyone's), then reloads the page's player data. */
export async function saveSetup(playerId: string, osuId: number, body: SetupPatch) {
	await request(`/api/players/${playerId}/setup`, { method: "PATCH", body });
	await invalidate(`app:player:${osuId}`);
}
