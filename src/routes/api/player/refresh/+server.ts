import { json, error } from "@sveltejs/kit";
import { createRateLimiter } from "$lib/server/rateLimit";
import { fetchAndUpsertPlayer } from "$lib/server/osu";

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

	await fetchAndUpsertPlayer(osu_id);

	return json({ success: true });
}
