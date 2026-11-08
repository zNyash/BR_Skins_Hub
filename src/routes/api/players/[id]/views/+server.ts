import { api } from "$convex/_generated/api";
import { mutate, serverQuery } from "$lib/server/convex";
import { createRateLimiter } from "$lib/server/rateLimit";
import type { RequestHandler } from "./$types";

const rateLimiter = createRateLimiter({ key: "player-views", maxRequests: 5, windowMs: 60_000 });

export const POST: RequestHandler = async (event) => {
	// Per player, so browsing many profiles quickly doesn't drop views.
	rateLimiter.check(event, event.params.id);

	// Players looking at their own profile don't count.
	if (event.locals.user) {
		const authUser = await serverQuery(api.auth.getUser, { osu_id: event.locals.user.osu_id });
		if (authUser?.player_id === event.params.id) return new Response(null, { status: 204 });
	}

	await mutate(api.players.incrementViews, { id: event.params.id });
	return new Response(null, { status: 204 });
};
