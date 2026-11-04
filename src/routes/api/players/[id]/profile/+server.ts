import { error, json, type RequestEvent } from "@sveltejs/kit";
import { api } from "$convex/_generated/api";
import { mutate } from "$lib/server/convex";

export async function PATCH(event: RequestEvent) {
	if (!event.locals.user) error(401, "Unauthorized");

	const { description, links } = await event.request.json();

	await mutate(api.players.updateOwnProfile, {
		actor_osu_id: event.locals.user.osu_id,
		description,
		links
	});

	return json({ success: true });
}
