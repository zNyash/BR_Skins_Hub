import { json, error } from "@sveltejs/kit";
import { convex } from "$lib/server/convex";
import { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel";

export async function PATCH(event) {
	if (!event.locals.user) error(401, "Unauthorized");

	const body = await event.request.json();
	const { description, links } = body;

	const id = event.params.id as Id<"players">;

	await convex.mutation(api.players.updatePlayerProfile, {
		id,
		requester_osu_id: event.locals.user.osu_id,
		description,
		links
	});

	return json({ success: true });
}
