import { type RequestEvent } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { auth } from "osu-api-extended";
import { OSU_CLIENT_ID, OSU_CLIENT_SECRET, CURRENT_DOMAIN } from "$env/static/private";
import { createToken } from "$lib/server/auth";
import { convex } from "$lib/server/convex";
import { api } from "$convex/_generated/api";

export async function GET(event: RequestEvent) {
	const code = event.url.searchParams.get("code");
	if (!code) redirect(302, "/login");

	// Fetch osu! profile
	const profile = await auth.authorize({
		code,
		client_id: Number(OSU_CLIENT_ID),
		client_secret: OSU_CLIENT_SECRET,
		redirect_url: `${CURRENT_DOMAIN}/auth/callback`
	});
	if (!profile) redirect(302, "/login");

	await convex.mutation(api.auth.upsertUser, {
		osu_id: profile.id,
		username: profile.username,
		cover_url: profile.cover_url
	});

	const token = await createToken({ osu_id: profile.id });

	// Create session token cookie
	event.cookies.set("session", token, {
		path: "/",
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 30 // 30 days
	});

	// Read and clear the redirect target post login
	const redirectTo = event.cookies.get("post_login_redirect") ?? "/";
	event.cookies.delete("post_login_redirect", { path: "/" });

	redirect(302, redirectTo);
}
