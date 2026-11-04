import { json } from "@sveltejs/kit";
import * as v from "valibot";
import { api } from "$convex/_generated/api";
import { requireAdmin } from "$lib/server/auth";
import { convex, mutate } from "$lib/server/convex";
import { fetchOsuProfile } from "$lib/server/osu";
import { osuId } from "$lib/server/schemas";
import { parseBody } from "$lib/server/validation";
import type { RequestHandler } from "./$types";

const CreatePlayerBody = v.object({ osu_id: osuId });

/** Creates a player from their osu! profile. An existing player is re-synced and returned with 200. */
export const POST: RequestHandler = async (event) => {
	requireAdmin(event);
	const { osu_id } = await parseBody(event.request, CreatePlayerBody);

	const existed = (await convex.query(api.players.get, { osu_id })) !== null;
	const profile = await fetchOsuProfile(osu_id);
	const player = await mutate(api.players.syncFromOsu, {
		osu_id,
		name: profile.username,
		cover_url: profile.cover_url,
		previous_usernames: profile.previous_usernames,
		only_if_exists: false
	});

	return json({ player }, { status: existed ? 200 : 201 });
};
