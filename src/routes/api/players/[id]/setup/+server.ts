import { error } from "@sveltejs/kit";
import { api } from "$convex/_generated/api";
import { isAdmin, requireUser } from "$lib/server/auth";
import { mutate, serverQuery } from "$lib/server/convex";
import { setupPatch } from "$lib/server/schemas";
import { parseBody } from "$lib/server/validation";
import type { RequestHandler } from "./$types";

/** A Setup tab card edit, by the player themself or an admin. Convex checks the same again. */
export const PATCH: RequestHandler = async (event) => {
	const user = requireUser(event);
	if (!isAdmin(user.osu_id)) {
		const authUser = await serverQuery(api.auth.getUser, { osu_id: user.osu_id });
		if (authUser?.player_id !== event.params.id) error(403, "You can only edit your own setup");
	}
	const body = await parseBody(event.request, setupPatch);

	// The session's id goes last so nothing in the body could ever override it.
	await mutate(api.players.updateSetup, {
		...body,
		id: event.params.id,
		actor_osu_id: user.osu_id
	});
	return new Response(null, { status: 204 });
};
