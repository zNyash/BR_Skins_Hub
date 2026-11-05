import * as v from "valibot";
import { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel";
import { requireAdmin } from "$lib/server/auth";
import { mutate } from "$lib/server/convex";
import { hue, links, playerSkins, tags, trimmedString } from "$lib/server/schemas";
import { parseBody } from "$lib/server/validation";
import type { RequestHandler } from "./$types";

const PlayerBody = v.object({
	name: v.optional(trimmedString),
	cover_url: v.optional(v.pipe(v.string(), v.trim())),
	hue,
	description: v.optional(v.string()),
	// Blank rows from the editor are dropped rather than rejected.
	previous_usernames: v.optional(
		v.pipe(
			v.array(v.pipe(v.string(), v.trim())),
			v.transform((names) => names.filter(Boolean))
		)
	),
	links: v.optional(links),
	tags: v.optional(tags),
	skins: playerSkins
});

export const PATCH: RequestHandler = async (event) => {
	const admin = requireAdmin(event);
	const { skins, ...fields } = await parseBody(event.request, PlayerBody);

	await mutate(api.players.update, {
		actor_osu_id: admin.osu_id,
		id: event.params.id,
		...fields,
		skins: skins.map((s) => ({ ...s, id: s.id as Id<"skins"> }))
	});
	return new Response(null, { status: 204 });
};

export const DELETE: RequestHandler = async (event) => {
	const admin = requireAdmin(event);
	await mutate(api.players.remove, { actor_osu_id: admin.osu_id, id: event.params.id });
	return new Response(null, { status: 204 });
};
