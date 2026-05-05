import { auth } from "osu-api-extended";
import { OSU_CLIENT_ID, CURRENT_DOMAIN } from "$env/static/private";
import { redirect } from "@sveltejs/kit";

export function GET() {
	const oauthUrl = auth.build_url({
		client_id: Number(OSU_CLIENT_ID),
		redirect_url: `${CURRENT_DOMAIN}/auth/callback`,
		scopes: ["identify"]
	});

	redirect(302, oauthUrl);
}
