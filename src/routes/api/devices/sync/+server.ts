import { api } from "$convex/_generated/api";
import { requireAdmin } from "$lib/server/auth";
import { mutate } from "$lib/server/convex";
import type { RequestHandler } from "./$types";

/** "Sync now": the OpenTabletDriver sync starts in the background; its result shows on the next load. */
export const POST: RequestHandler = async (event) => {
	const admin = requireAdmin(event);
	await mutate(api.devices.requestSync, { actor_osu_id: admin.osu_id });
	return new Response(null, { status: 202 });
};
