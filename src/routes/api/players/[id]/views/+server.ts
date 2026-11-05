import { api } from "$convex/_generated/api";
import { mutate } from "$lib/server/convex";
import { createRateLimiter } from "$lib/server/rateLimit";
import type { RequestHandler } from "./$types";

const rateLimiter = createRateLimiter({ key: "player-views", maxRequests: 5, windowMs: 60_000 });

export const POST: RequestHandler = async (event) => {
	rateLimiter.check(event);
	await mutate(api.players.incrementViews, { id: event.params.id });
	return new Response(null, { status: 204 });
};
