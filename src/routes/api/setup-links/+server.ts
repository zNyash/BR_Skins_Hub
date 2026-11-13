import { api } from "$convex/_generated/api";
import { requireAdmin } from "$lib/server/auth";
import { mutate } from "$lib/server/convex";
import { setupLinkBody } from "$lib/server/schemas";
import { parseBody } from "$lib/server/validation";
import type { RequestHandler } from "./$types";

/** Dashboard: link players' cards to one catalog device by hand. */
export const POST: RequestHandler = async (event) => {
	const admin = requireAdmin(event);
	const body = await parseBody(event.request, setupLinkBody);

	await mutate(api.setupLinks.link, { ...body, actor_osu_id: admin.osu_id });
	return new Response(null, { status: 204 });
};
