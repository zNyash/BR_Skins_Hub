import { type RequestEvent } from "@sveltejs/kit";
import { json, error } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/admin";
import { convex } from "$lib/server/convex";
import { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel";

export async function PUT(event: RequestEvent) {
	requireAdmin(event);

	const skin_id = event.params.skinId as Id<"skins">;
	const { player_ids } = await event.request.json();
	if (!Array.isArray(player_ids)) error(400, "player_ids must be an array");

	await convex.mutation(api.playerSkins.updateSkinPlayers, { skin_id, player_ids });

	return json({ success: true });
}
