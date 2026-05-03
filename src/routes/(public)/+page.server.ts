import { convex } from "$lib/server/convex";
import { api } from "$convex/_generated/api";

export async function load({ depends }) {
	depends("app:players");
	const players = await convex.query(api.players.listPlayers);
	return { players };
}
