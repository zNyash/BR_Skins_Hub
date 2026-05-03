import { error } from "@sveltejs/kit";
import { convex } from "$lib/server/convex";
import { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel.js";

export async function load({ params, depends }) {
	depends("app:skin:" + params.skinId);

	const skin = await convex.query(api.skins.getSkin, { id: params.skinId as Id<"skins"> });
	if (!skin) error(404, "Skin not found");

	const players = await convex.query(api.playerSkins.getPlayersBySkin, {
		skin_id: skin._id
	});

	return { skin, players };
}
