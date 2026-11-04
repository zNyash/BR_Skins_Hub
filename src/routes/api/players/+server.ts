import { type RequestEvent } from "@sveltejs/kit";
import { json, error } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/admin";
import { convex } from "$lib/server/convex";
import { api } from "$convex/_generated/api";
import { fetchAndUpsertPlayer } from "$lib/server/osu";

export async function POST(event: RequestEvent) {
	requireAdmin(event);

	const { osu_id } = await event.request.json();
	const osuId = Number(osu_id);
	if (!Number.isInteger(osuId) || osuId <= 0) error(400, "A valid osu_id is required");

	// Creating an existing player would overwrite it, so hand back the existing one instead.
	const existing = await convex.query(api.players.getPlayerByOsuId, { osu_id: osuId });
	if (existing) return json({ id: existing._id, name: existing.name, existed: true });

	const player = await fetchAndUpsertPlayer(osuId);
	if (!player) error(500, "Failed to create player");

	return json({ id: player._id, name: player.name, existed: false });
}
