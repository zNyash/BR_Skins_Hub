import { type RequestEvent } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/auth";
import { convex, mutate } from "$lib/server/convex";
import { api } from "$convex/_generated/api";
import { normalizeTags } from "$lib/utils/tags";
import { deleteUploadThingImages } from "$lib/server/uploadthing";

export async function PATCH(event: RequestEvent) {
	const admin = requireAdmin(event);

	const id = event.params.id!;
	const body = await event.request.json();
	const { name, author, download_url, preview_images, player_ids } = body;
	const tags = Array.isArray(body.tags) ? normalizeTags(body.tags) : undefined;

	// Work out which images were removed during editing (before the update overwrites them)
	const existing = await convex.query(api.skins.get, { id });
	const incoming = new Set<string>(Array.isArray(preview_images) ? preview_images : []);
	const removed =
		existing && Array.isArray(preview_images)
			? existing.preview_images.filter((url) => !incoming.has(url))
			: [];

	await mutate(api.skins.upsert, {
		actor_osu_id: admin.osu_id,
		id,
		name,
		author,
		download_url,
		preview_images,
		tags,
		player_ids
	});

	await deleteUploadThingImages(removed);

	return json({ success: true });
}

export async function DELETE(event: RequestEvent) {
	const admin = requireAdmin(event);
	const images = await mutate(api.skins.remove, { actor_osu_id: admin.osu_id, id: event.params.id! });
	await deleteUploadThingImages(images);
	return json({ success: true });
}
