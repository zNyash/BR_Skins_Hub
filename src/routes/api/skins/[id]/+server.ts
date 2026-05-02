import { json } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/admin";
import { convex } from "$lib/server/convex";
import { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel";

export async function PATCH(event) {
	requireAdmin(event);

	const _id = event.params.id as Id<"skins">;
	const body = await event.request.json();
	const { name, author, download_url, preview_images } = body;

	await convex.mutation(api.skins.updateSkin, {
		_id,
		name,
		author,
		download_url,
		preview_images
	});

	return json({ success: true });
}

export async function DELETE(event) {
	requireAdmin(event);

	const _id = event.params.id as Id<"skins">;

	await convex.mutation(api.skins.deleteSkin, { _id });

	return json({ success: true });
}
