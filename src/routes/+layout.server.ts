import { convex } from "$lib/server/convex";
import { isAdminId } from "$lib/server/admin";
import { api } from "$convex/_generated/api";
import type { AuthUser } from "$lib/types.js";
import { osuAvatar } from "$lib/utils/osu";

export async function load({ locals }) {
	if (!locals.user) return { user: null };

	const authUser = await convex.query(api.auth.getAuthUser, {
		osu_id: locals.user.osu_id
	});

	return {
		user: {
			osu_id: locals.user.osu_id,
			isAdmin: isAdminId(locals.user.osu_id),
			username: authUser?.username ?? null,
			player_id: authUser?.player_id ?? null,
			avatar_url: osuAvatar(locals.user.osu_id)
		} satisfies AuthUser
	};
}
