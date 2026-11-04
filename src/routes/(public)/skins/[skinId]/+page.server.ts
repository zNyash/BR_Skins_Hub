import { error } from "@sveltejs/kit";
import { api } from "$convex/_generated/api";
import { convex } from "$lib/server/convex";

export async function load({ params, depends }) {
	depends("app:skin:" + params.skinId);

	const skin = await convex.query(api.skins.get, { id: params.skinId });
	if (!skin) error(404, "Skin not found");

	return { skin };
}
