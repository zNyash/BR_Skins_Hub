import { auth } from "osu-api-extended";
import { OSU_CLIENT_ID, CURRENT_DOMAIN } from "$env/static/private";
import { redirect } from "@sveltejs/kit";

export function GET(event) {
	const from = event.url.searchParams.get("from") ?? "/";
	const safeFrom = from.startsWith(CURRENT_DOMAIN) ? from : `${CURRENT_DOMAIN}/`; // allow only same-origin redirects.

	// Create a temporary cookie to remember where to go back after login
	event.cookies.set("post_login_redirect", safeFrom, {
		path: "/",
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		maxAge: 60 * 10 // 10 minutes
	})

	const oauthUrl = auth.build_url({
		client_id: Number(OSU_CLIENT_ID),
		redirect_url: `${CURRENT_DOMAIN}/auth/callback`,
		scopes: ["identify"]
	});

	redirect(302, oauthUrl);
}
