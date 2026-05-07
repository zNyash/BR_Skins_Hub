import { json } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/admin";
import { convex } from "$lib/server/convex";
import { api } from "$convex/_generated/api";
import { UTApi } from "uploadthing/server";
import type { Id } from "$convex/_generated/dataModel";

const utapi = new UTApi();

// Only UploadThing-hosted images can be deleted via the API.
// Guard against external URLs that may end up in preview_images.
function isUploadThingUrl(url: string) {
	return url.includes("ufs.uploadthing.com") || url.includes("utfs.io");
}

function extractKey(url: string) {
	return url.split("/").at(-1)!;
}

async function deleteUploadThingImages(urls: string[]) {
	const keys = urls.filter(isUploadThingUrl).map(extractKey);
	if (keys.length) await utapi.deleteFiles(keys);
}

export async function PATCH(event) {
	requireAdmin(event);

	const _id = event.params.id as Id<"skins">;
	const body = await event.request.json();
	const { name, author, download_url, preview_images } = body;

	// Delete images that were removed during editing
	const existing = await convex.query(api.skins.getSkin, { id: _id });
	if (existing && Array.isArray(preview_images)) {
		const incoming = new Set<string>(preview_images);
		const removed = existing.preview_images.filter((url) => !incoming.has(url));
		await deleteUploadThingImages(removed);
	}

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

	const skin = await convex.query(api.skins.getSkin, { id: _id });
	if (skin) await deleteUploadThingImages(skin.preview_images);

	await convex.mutation(api.skins.deleteSkin, { _id });

	return json({ success: true });
}
