import type { RequestEvent } from "@sveltejs/kit";
import { assertAdminPage } from "$lib/server/auth";

export function load(event: RequestEvent) {
	assertAdminPage(event.locals);
}
