import { api } from "$convex/_generated/api";
import { convex } from "$lib/server/convex";

export async function load({ depends }) {
	depends("app:players");
	return { players: await convex.query(api.players.list, {}) };
}
