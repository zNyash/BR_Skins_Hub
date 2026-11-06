import * as v from "valibot";
import { api } from "$convex/_generated/api";
import { requireUser } from "$lib/server/auth";
import { mutate } from "$lib/server/convex";
import { bio, links, tabOrder } from "$lib/server/schemas";
import { parseBody } from "$lib/server/validation";
import type { RequestHandler } from "./$types";

const ProfileBody = v.object({
	description: v.optional(v.string()),
	bio: v.optional(bio),
	links: v.optional(links),
	tab_order: v.optional(tabOrder)
});

/** The logged-in player editing their own page. Who they are comes from the session, never the body. */
export const PATCH: RequestHandler = async (event) => {
	const user = requireUser(event);
	const body = await parseBody(event.request, ProfileBody);

	await mutate(api.players.updateOwnProfile, { actor_osu_id: user.osu_id, ...body });
	return new Response(null, { status: 204 });
};
