import { type RequestEvent } from "@sveltejs/kit";
import { json, error } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/auth";
import { mutate } from "$lib/server/convex";
import { api } from "$convex/_generated/api";
import { normalizeTags } from "$lib/tags";

export async function POST(event: RequestEvent) {
	const admin = requireAdmin(event);

	const body = await event.request.json();
	const { name, author, download_url, preview_images } = body;
	const tags = Array.isArray(body.tags) ? normalizeTags(body.tags) : undefined;

	if (!name || !download_url) error(400, "name and download_url are required");

	const id = await mutate(api.skins.upsert, {
		actor_osu_id: admin.osu_id,
		name,
		author,
		download_url,
		preview_images: preview_images ?? [],
		tags
	});

	return json({ id });
}
