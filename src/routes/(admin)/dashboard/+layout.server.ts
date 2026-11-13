import { api } from "$convex/_generated/api";
import { parseLayout, LAYOUT_COOKIE } from "$lib/dashboard-layout";
import { assertAdminPage } from "$lib/server/auth";
import { convex } from "$lib/server/convex";

export async function load({ locals, cookies, depends }) {
	assertAdminPage(locals);
	depends("app:skins");
	depends("app:players");
	depends("app:devices");
	const [players, skins, devices, deviceSync] = await Promise.all([
		convex.query(api.players.list, {}),
		convex.query(api.skins.listWithPlayers, {}),
		convex.query(api.devices.list, {}),
		convex.query(api.devices.lastSync, {})
	]);
	return { players, skins, devices, deviceSync, layout: parseLayout(cookies.get(LAYOUT_COOKIE)) };
}
