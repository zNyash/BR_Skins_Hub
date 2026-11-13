import { api } from "$convex/_generated/api";
import { requireAdmin } from "$lib/server/auth";
import { convex, mutate } from "$lib/server/convex";
import { deleteUploadThingImages } from "$lib/server/uploadthing";
import { parseBody } from "$lib/server/validation";
import { DeviceBody } from "../body";
import type { RequestHandler } from "./$types";

/** Saves the device. A replaced or removed image (UploadThing) is deleted afterwards. */
export const PATCH: RequestHandler = async (event) => {
	const admin = requireAdmin(event);
	const body = await parseBody(event.request, DeviceBody);

	const devices = await convex.query(api.devices.list, {});
	const before = devices.find((d) => d._id === event.params.id);
	await mutate(api.devices.upsert, { ...body, actor_osu_id: admin.osu_id, id: event.params.id });

	if (before?.image_url && before.image_url !== body.image_url) {
		await deleteUploadThingImages([before.image_url]);
	}
	return new Response(null, { status: 204 });
};

export const DELETE: RequestHandler = async (event) => {
	const admin = requireAdmin(event);
	const { image_url } = await mutate(api.devices.remove, {
		actor_osu_id: admin.osu_id,
		id: event.params.id
	});
	if (image_url) await deleteUploadThingImages([image_url]);
	return new Response(null, { status: 204 });
};
