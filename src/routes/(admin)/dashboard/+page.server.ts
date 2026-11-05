import { api } from "$convex/_generated/api";
import { convex } from "$lib/server/convex";

export async function load({ depends }) {
	depends("app:skins");
	depends("app:players");
	const [players, skins] = await Promise.all([
		convex.query(api.players.list, {}),
		convex.query(api.skins.listWithPlayers, {})
	]);
	return { players, skins };
}
