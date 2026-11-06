import * as v from "valibot";
import { api } from "$convex/_generated/api";
import { requireUser } from "$lib/server/auth";
import { mutate } from "$lib/server/convex";
import { parseBody } from "$lib/server/validation";
import type { RequestHandler } from "./$types";

const PreferencesBody = v.object({ use_my_color: v.boolean("must be true or false") });

/** The logged-in user's own browsing preferences. Who they are comes from the session, never the body. */
export const PATCH: RequestHandler = async (event) => {
	const user = requireUser(event);
	const body = await parseBody(event.request, PreferencesBody);

	await mutate(api.auth.setUseMyColor, { ...body, actor_osu_id: user.osu_id });
	return new Response(null, { status: 204 });
};
