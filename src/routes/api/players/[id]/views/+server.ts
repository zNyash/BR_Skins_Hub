import { json } from "@sveltejs/kit";
import { convex } from "$lib/server/convex";
import { createRateLimiter } from "$lib/server/rateLimit";
import { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel";

const rateLimiter = createRateLimiter({
	key: "player-views",
	maxRequests: 5,
	windowMs: 60_000
});

export async function POST(event) {
	rateLimiter.check(event);

	const id = event.params.id as Id<"players">;

	await convex.mutation(api.players.incrementPlayerViews, { id });

	return json({ success: true });
}
