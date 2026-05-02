import { json } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/admin";
import { convex } from "$lib/server/convex";
import { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel";

export async function PUT(event) {
	requireAdmin(event);

	const player_id = event.params.playerId as Id<"players">;
	const body = await event.request.json();
	const { skin_ids } = body;

	await convex.mutation(api.playerSkins.updatePlayerSkins, {
		player_id,
		skin_ids: skin_ids ?? []
	});

	return json({ success: true });
}
