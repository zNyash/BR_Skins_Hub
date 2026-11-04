import { json, type RequestEvent } from "@sveltejs/kit";
import { api } from "$convex/_generated/api";
import { requireAdmin } from "$lib/server/auth";
import { mutate } from "$lib/server/convex";
import { clamp } from "$lib/utils/helpers";
import { normalizeTags } from "$lib/tags";

export async function PATCH(event: RequestEvent) {
	const admin = requireAdmin(event);

	const body = await event.request.json();
	const { name, cover_url, previous_usernames, description, links, skin_ids } = body;
	const tags = Array.isArray(body.tags) ? normalizeTags(body.tags) : undefined;
	const hue = typeof body.hue === "number" ? clamp(body.hue, 0, 360) : body.hue;

	await mutate(api.players.update, {
		actor_osu_id: admin.osu_id,
		id: event.params.id!,
		name,
		cover_url,
		previous_usernames,
		hue,
		description,
		links,
		tags,
		skin_ids: skin_ids ?? []
	});

	return json({ success: true });
}

export async function DELETE(event: RequestEvent) {
	const admin = requireAdmin(event);
	await mutate(api.players.remove, { actor_osu_id: admin.osu_id, id: event.params.id! });
	return json({ success: true });
}
