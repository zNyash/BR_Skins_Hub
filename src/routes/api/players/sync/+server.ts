import { error } from "@sveltejs/kit";
import * as v from "valibot";
import { api } from "$convex/_generated/api";
import { isAdmin, requireUser } from "$lib/server/auth";
import { mutate } from "$lib/server/convex";
import { fetchOsuProfile } from "$lib/server/osu";
import { createRateLimiter } from "$lib/server/rateLimit";
import { osuId } from "$lib/server/schemas";
import { parseBody } from "$lib/server/validation";
import type { RequestHandler } from "./$types";

const rateLimiter = createRateLimiter({ key: "player-sync", maxRequests: 3, windowMs: 60_000 });

const SyncBody = v.object({ osu_id: osuId });

/** Refreshes an existing player from osu!. Never creates one. Admins skip the rate limit. */
export const POST: RequestHandler = async (event) => {
	const user = requireUser(event);
	if (!isAdmin(user.osu_id)) rateLimiter.check(event);
	const { osu_id } = await parseBody(event.request, SyncBody);

	const profile = await fetchOsuProfile(osu_id);
	const player = await mutate(api.players.syncFromOsu, {
		osu_id,
		name: profile.username,
		cover_url: profile.cover_url,
		previous_usernames: profile.previous_usernames,
		only_if_exists: true
	});
	if (!player) error(404, "Player not found");

	return new Response(null, { status: 204 });
};
