import { error } from "@sveltejs/kit";
import { auth, v2 } from "osu-api-extended";
import { OSU_CLIENT_ID, OSU_CLIENT_SECRET } from "$env/static/private";

export type OsuProfile = {
	id: number;
	username: string;
	cover_url?: string;
	previous_usernames: string[];
};

/** Fetches a public osu! profile. 404 if the user doesn't exist, 502 if osu! can't be reached. */
export async function fetchOsuProfile(osuId: number): Promise<OsuProfile> {
	let profile: Awaited<ReturnType<typeof v2.users.details>>;
	try {
		await auth.login({
			type: "v2",
			client_id: Number(OSU_CLIENT_ID),
			client_secret: OSU_CLIENT_SECRET,
			scopes: ["public"]
		});
		profile = await v2.users.details({ user: osuId, key: "id" });
	} catch (e) {
		// osu! answers an unknown user with { "error": null }, which osu-api-extended throws as "empty error".
		if (e instanceof Error && e.message.includes("osu returned empty error")) {
			error(404, `No osu! user with ID ${osuId}`);
		}
		console.error("[osu] request failed", e);
		error(502, "Couldn't reach osu!, try again in a moment");
	}

	if (!profile?.id) error(404, `No osu! user with ID ${osuId}`);

	return {
		id: profile.id,
		username: profile.username,
		cover_url: profile.cover_url,
		previous_usernames: profile.previous_usernames ?? []
	};
}
