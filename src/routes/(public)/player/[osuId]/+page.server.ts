import { error } from "@sveltejs/kit";
import { api } from "$convex/_generated/api";
import { convex } from "$lib/server/convex";

export async function load({ params, depends }) {
	depends("app:player:" + params.osuId);

	const player = await convex.query(api.players.get, { osu_id: Number(params.osuId) });
	if (!player) error(404, "Player not found");

	return { player, pageHue: player.hue ?? null };
}
