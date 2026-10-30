import { type RequestEvent } from "@sveltejs/kit";
import { json, error } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/admin";
import { convex } from "$lib/server/convex";
import { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel";
import { clamp } from "$lib/utils/helpers";

export async function PATCH(event: RequestEvent) {
	requireAdmin(event);

	const body = await event.request.json();
	const { osu_id, name, cover_url, previous_usernames, description, links } = body;

	// Handling the min and max values for hue here before sending to the database
	let { hue } = body;
	hue = hue !== undefined ? clamp(hue, 0, 360) : undefined;

	if (!osu_id) error(400, "osu_id is required");

	try {
		const player = await convex.mutation(api.players.upsertPlayer, {
			osu_id,
			name,
			cover_url,
			previous_usernames,
			hue,
			description,
			links
		});

		if (!player) return error(500, "Impossible case happend: convex returned a null player.");

		return json({ player });
	} catch (e) {
		error(500, e instanceof Error ? e.message : "Failed to update player");
	}
}

export async function DELETE(event: RequestEvent) {
	requireAdmin(event);

	const player_id = event.params.id as Id<"players">;

	try {
		await convex.mutation(api.players.deletePlayer, { player_id });

		return json({ success: true });
	} catch (e) {
		error(500, e instanceof Error ? e.message : "Failed to delete player");
	}
}
