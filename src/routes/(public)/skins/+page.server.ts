import { convex } from "$lib/server/convex";
import { api } from "$convex/_generated/api";

export async function load({ depends }) {
	depends("app:skins");
	const skins = await convex.query(api.skins.listSkins);
	return { skins };
}
