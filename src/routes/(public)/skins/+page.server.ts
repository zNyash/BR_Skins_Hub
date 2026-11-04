import { api } from "$convex/_generated/api";
import { convex } from "$lib/server/convex";

export async function load({ depends }) {
	depends("app:skins");
	return { skins: await convex.query(api.skins.list, {}) };
}
