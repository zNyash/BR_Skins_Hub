import { auth, v2 } from "osu-api-extended";
import { OSU_CLIENT_ID, OSU_CLIENT_SECRET } from "$env/static/private";
import { mutate } from "$lib/server/convex";
import { api } from "$convex/_generated/api";
import { error } from "@sveltejs/kit";
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

	return syncPlayerFromProfile(profile, false);
}

/** Writes osu! data to the player and marks it as synced. With onlyIfExists, never creates one. */
export async function syncPlayerFromProfile(profile: OsuProfile, onlyIfExists: boolean) {
	return mutate(api.players.syncFromOsu, {
		osu_id: profile.id,
		name: profile.username,
		cover_url: profile.cover_url,
		previous_usernames: profile.previous_usernames ?? [],
		only_if_exists: onlyIfExists
	});
}
