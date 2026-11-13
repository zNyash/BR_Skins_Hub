import { json } from "@sveltejs/kit";
import { api } from "$convex/_generated/api";
import { requireAdmin } from "$lib/server/auth";
import { mutate } from "$lib/server/convex";
import { parseBody } from "$lib/server/validation";
import type { RequestHandler } from "./$types";
import { DeviceBody } from "./body";

export const POST: RequestHandler = async (event) => {
	const admin = requireAdmin(event);
	const body = await parseBody(event.request, DeviceBody);

	const id = await mutate(api.devices.upsert, { ...body, actor_osu_id: admin.osu_id });
	return json({ id }, { status: 201 });
};
