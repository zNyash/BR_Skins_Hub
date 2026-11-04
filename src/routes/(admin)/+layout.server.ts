import { type RequestEvent } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { isAdmin } from "$lib/server/auth";

export function load(event: RequestEvent) {
	if (!event.locals.user) redirect(302, "/auth/login");
	if (!isAdmin(event.locals.user.osu_id)) redirect(302, "/");
}
