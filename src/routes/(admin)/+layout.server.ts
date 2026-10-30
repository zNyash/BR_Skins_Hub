import { type RequestEvent } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { isAdminId } from "$lib/server/admin";

export function load(event: RequestEvent) {
	if (!event.locals.user) redirect(302, "/login");
	if (!isAdminId(event.locals.user.osu_id)) redirect(302, "/");
}
