import { auth, v2 } from "osu-api-extended";
import { OSU_CLIENT_ID, OSU_CLIENT_SECRET } from "$env/static/private";
import { convex } from "$lib/server/convex";
import { api } from "$convex/_generated/api";
import { error } from "@sveltejs/kit";

export async function fetchAndUpsertPlayer(osu_id: number) {
	await auth.login({
		type: "v2",
		client_id: Number(OSU_CLIENT_ID),
		client_secret: OSU_CLIENT_SECRET,
		scopes: ["public"]
	});

	const profile = await v2.users.details({ user: osu_id, key: "id" });
	if (!profile?.id) error(404, "osu! user not found");

	return convex.mutation(api.players.upsertPlayer, {
		osu_id: profile.id,
		name: profile.username,
		cover_url: profile.cover_url,
		previous_usernames: profile.previous_usernames ?? []
	});
}
