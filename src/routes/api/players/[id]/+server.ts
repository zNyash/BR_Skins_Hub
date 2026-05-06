import { json, error } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/admin";
import { convex } from "$lib/server/convex";
import { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel";

export async function PATCH(event) {
	requireAdmin(event);

	const body = await event.request.json();
	const { osu_id, name, cover_url, previous_usernames, hue, description, links } = body;

	if (!osu_id) error(400, "osu_id is required");

	await convex.mutation(api.players.upsertPlayer, {
		osu_id,
		name,
		cover_url,
		previous_usernames,
		hue,
		description,
		links
	});

	return json({ success: true });
}

export async function DELETE(event) {
	requireAdmin(event);

	const player_id = event.params.id as Id<"players">;

	await convex.mutation(api.players.deletePlayer, { player_id });

	return json({ success: true });
}
