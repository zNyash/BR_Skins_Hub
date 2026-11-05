import { redirect } from "@sveltejs/kit";
import { auth } from "osu-api-extended";
import { CURRENT_DOMAIN, OSU_CLIENT_ID } from "$env/static/private";
import { safeRedirectTarget } from "$lib/server/redirect";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = (event) => {
	// Remember where to go back after login (read and cleared in /auth/callback).
	event.cookies.set(
		"post_login_redirect",
		safeRedirectTarget(event.url.searchParams.get("from"), CURRENT_DOMAIN),
		{ path: "/", httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 10 }
	);

	const oauthUrl = auth.build_url({
		client_id: Number(OSU_CLIENT_ID),
		redirect_url: `${CURRENT_DOMAIN}/auth/callback`,
		scopes: ["identify"]
	});

	redirect(302, oauthUrl);
};
