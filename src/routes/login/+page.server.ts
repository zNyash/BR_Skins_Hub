import { auth } from "osu-api-extended";
import { OSU_CLIENT_ID, CURRENT_DOMAIN } from "$env/static/private";

export function load() {
	const oauthUrl = auth.build_url({
		client_id: Number(OSU_CLIENT_ID),
		redirect_url: `${CURRENT_DOMAIN}/auth/callback`,
		scopes: ["identify"]
	});

	return { oauthUrl };
}
