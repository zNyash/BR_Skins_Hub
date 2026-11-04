import { type RequestEvent } from "@sveltejs/kit";
import { json, error } from "@sveltejs/kit";
import { createRateLimiter } from "$lib/server/rateLimit";
import { fetchAndUpsertPlayer } from "$lib/server/osu";
import { isAdminId } from "$lib/server/admin";

const rateLimiter = createRateLimiter({
	key: "player-refresh",
	maxRequests: 3,
	windowMs: 60_000
});

export async function GET(event: RequestEvent) {
	const user = event.locals.user;
	if (!user) error(401, "You need to be logged in to refresh a player");

	// locals.user comes from the signed session cookie (see hooks.server.ts), so its osu_id
	// can't be forged without JWT_SECRET. Admins are trusted and skip the limit.
	if (!isAdminId(user.osu_id)) rateLimiter.check(event);

	const osu_id = Number(event.url.searchParams.get("osu_id"));
	if (!Number.isInteger(osu_id) || osu_id <= 0) error(400, "A valid osu_id is required");

	await fetchAndUpsertPlayer(osu_id);

	return json({ success: true });
}
