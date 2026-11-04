import { type RequestEvent } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";
import { mutate } from "$lib/server/convex";
import { createRateLimiter } from "$lib/server/rateLimit";
import { api } from "$convex/_generated/api";

const rateLimiter = createRateLimiter({
	key: "skin-downloads",
	maxRequests: 5,
	windowMs: 60_000
});

export async function POST(event: RequestEvent) {
	rateLimiter.check(event);

	await mutate(api.skins.incrementDownloads, { id: event.params.id! });

	return json({ success: true });
}
