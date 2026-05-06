import { convex } from "$lib/server/convex";
import { api } from "$convex/_generated/api";

export async function load({ depends }) {
	depends("app:skins");
	depends("app:players");
	const [players, skins] = await Promise.all([
		convex.query(api.players.listPlayers, {}),
		convex.query(api.skins.listSkinsWithPlayers, {})
	]);
	return { players, skins };
}
