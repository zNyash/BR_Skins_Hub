import { json, error } from "@sveltejs/kit";
import { auth, v2 } from "osu-api-extended";
import { OSU_CLIENT_ID, OSU_CLIENT_SECRET } from "$env/static/private";
import { convex } from "$lib/server/convex";
import { createRateLimiter } from "$lib/server/rateLimit";
import { api } from "$convex/_generated/api";

const rateLimiter = createRateLimiter({
	key: "player-refresh",
	maxRequests: 3,
	windowMs: 60_000
});

export async function GET(event) {
	if (!event.locals.user) error(401, "Unauthorized");

	rateLimiter.check(event);

	const osu_id = Number(event.url.searchParams.get("osu_id"));
	if (!osu_id) error(400, "osu_id is required");

	// Authenticate with osu! API using client credentials
	await auth.login({
		type: "v2",
		client_id: Number(OSU_CLIENT_ID),
		client_secret: OSU_CLIENT_SECRET,
		scopes: ["public"]
	});

	const osuUser = await v2.users.details({ user: osu_id, key: "id" });
	if (!osuUser || osuUser.error) error(404, "osu! user not found");

	await convex.mutation(api.players.upsertPlayer, {
		osu_id: osuUser.id,
		name: osuUser.username,
		cover_url: osuUser.cover_url,
		previous_usernames: osuUser.previous_usernames ?? []
	});

	return json({ success: true });
}
