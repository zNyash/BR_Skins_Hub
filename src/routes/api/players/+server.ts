import { json, error } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/admin";
import { fetchAndUpsertPlayer } from "$lib/server/osu";

export async function POST(event) {
	requireAdmin(event);

	const { osu_id } = await event.request.json();
	if (!osu_id) error(400, "osu_id is required");

	const id = await fetchAndUpsertPlayer(Number(osu_id));

	return json({ id });
}
