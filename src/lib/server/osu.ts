import { auth, v2 } from "osu-api-extended";
import { OSU_CLIENT_ID, OSU_CLIENT_SECRET } from "$env/static/private";
import { convex } from "$lib/server/convex";
import { api } from "$convex/_generated/api";
import { error } from "@sveltejs/kit";
import { mergeUsernames } from "$lib/utils/osu";
import type { UsersDetailsResponse } from "osu-api-extended/dist/types/v2/users_details";

type OsuProfile = Pick<
	UsersDetailsResponse,
	"id" | "username" | "cover_url" | "previous_usernames"
>;

/** Fetches the profile from osu! and creates or fully syncs the player. */
export async function fetchAndUpsertPlayer(osu_id: number) {
	await auth.login({
		type: "v2",
		client_id: Number(OSU_CLIENT_ID),
		client_secret: OSU_CLIENT_SECRET,
		scopes: ["public"]
	});

	const profile = await v2.users.details({ user: osu_id, key: "id" });
	if (!profile?.id) error(404, "osu! user not found");

	return syncPlayerFromProfile(profile);
}

/**
 * Writes osu! data to the player (creating it if needed) and marks it as synced.
 * Previous usernames are curated by admins, so new ones are added but none are dropped.
 */
export async function syncPlayerFromProfile(profile: OsuProfile) {
	const existing = await convex.query(api.players.getPlayerByOsuId, { osu_id: profile.id });

	return convex.mutation(api.players.upsertPlayer, {
		osu_id: profile.id,
		name: profile.username,
		cover_url: profile.cover_url,
		previous_usernames: mergeUsernames(
			existing?.previous_usernames ?? [],
			profile.previous_usernames ?? []
		),
		from_osu: true
	});
}
