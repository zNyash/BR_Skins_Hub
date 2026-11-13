import { error, json } from "@sveltejs/kit";
import * as v from "valibot";
import { api } from "$convex/_generated/api";
import { requireAdmin, requireUser } from "$lib/server/auth";
import { convex, mutate } from "$lib/server/convex";
import { deviceType } from "$lib/server/schemas";
import { parseBody } from "$lib/server/validation";
import type { RequestHandler } from "./$types";
import { DeviceBody } from "./body";

/** Devices of one type for the setup pickers. */
export const GET: RequestHandler = async (event) => {
	requireUser(event);
	const parsed = v.safeParse(deviceType, event.url.searchParams.get("type"));
	if (!parsed.success) error(400, "type must be tablet, keyboard, mouse or monitor");

	return json(await convex.query(api.devices.listByType, { type: parsed.output }));
};

export const POST: RequestHandler = async (event) => {
	const admin = requireAdmin(event);
	const body = await parseBody(event.request, DeviceBody);

	const id = await mutate(api.devices.upsert, { ...body, actor_osu_id: admin.osu_id });
	return json({ id }, { status: 201 });
};
