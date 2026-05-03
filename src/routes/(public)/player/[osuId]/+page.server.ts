import { api } from "$convex/_generated/api";
import { convex } from "$lib/server/convex.js";
import { error } from "@sveltejs/kit";

export async function load({ params, depends }) {
	depends("app:player:" + params.osuId);

	const player = await convex.query(api.players.getPlayerByOsuId, { osu_id: Number(params.osuId) });
	const skins = await convex.query(api.playerSkins.getSkinsByOsuId, {
		osu_id: Number(params.osuId)
	});

	if (!player) {
		error(404, "Player not found");
	}

	return { player, skins };
}
