import { api } from "$convex/_generated/api";
import { isAdmin } from "$lib/server/auth";
import { serverQuery } from "$lib/server/convex";
import type { AuthUser } from "$lib/types";
import { osuAvatar } from "$lib/osu";

export async function load({ locals }) {
	if (!locals.user) return { user: null };

	const authUser = await serverQuery(api.auth.getUser, { osu_id: locals.user.osu_id });

	return {
		user: {
			osu_id: locals.user.osu_id,
			isAdmin: isAdmin(locals.user.osu_id),
			username: authUser?.username ?? null,
			player_id: authUser?.player_id ?? null,
			avatar_url: osuAvatar(locals.user.osu_id)
		} satisfies AuthUser
	};
}
