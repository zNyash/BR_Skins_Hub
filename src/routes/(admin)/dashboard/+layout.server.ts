import { api } from "$convex/_generated/api";
import { parseLayout, LAYOUT_COOKIE } from "$lib/dashboard-layout";
import { assertAdminPage } from "$lib/server/auth";
import { convex } from "$lib/server/convex";

export async function load({ locals, cookies, depends }) {
	assertAdminPage(locals);
	depends("app:skins");
	depends("app:players");
	const [players, skins] = await Promise.all([
		convex.query(api.players.list, {}),
		convex.query(api.skins.listWithPlayers, {})
	]);
	return { players, skins, layout: parseLayout(cookies.get(LAYOUT_COOKIE)) };
}
