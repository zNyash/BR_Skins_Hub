import * as v from "valibot";
import { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel";
import { requireAdmin } from "$lib/server/auth";
import { convex, mutate } from "$lib/server/convex";
import { convexId, httpUrl, tags, trimmedString } from "$lib/server/schemas";
import { deleteUploadThingImages } from "$lib/server/uploadthing";
import { parseBody } from "$lib/server/validation";
import type { RequestHandler } from "./$types";

const SkinBody = v.object({
	name: trimmedString,
	author: v.optional(v.pipe(v.string(), v.trim())),
	download_url: httpUrl,
	preview_images: v.array(httpUrl),
	tags: v.optional(tags),
	player_ids: v.optional(v.array(convexId))
});

/** Saves the skin and who uses it. Images removed from the list are deleted from UploadThing afterwards. */
export const PATCH: RequestHandler = async (event) => {
	const admin = requireAdmin(event);
	const { player_ids, ...fields } = await parseBody(event.request, SkinBody);

	const before = await convex.query(api.skins.get, { id: event.params.id });
	await mutate(api.skins.upsert, {
		actor_osu_id: admin.osu_id,
		id: event.params.id,
		...fields,
		player_ids: player_ids as Id<"players">[] | undefined
	});

	const kept = new Set(fields.preview_images);
	await deleteUploadThingImages(before?.preview_images.filter((url) => !kept.has(url)) ?? []);

	return new Response(null, { status: 204 });
};

export const DELETE: RequestHandler = async (event) => {
	const admin = requireAdmin(event);
	const images = await mutate(api.skins.remove, { actor_osu_id: admin.osu_id, id: event.params.id });
	await deleteUploadThingImages(images);
	return new Response(null, { status: 204 });
};
