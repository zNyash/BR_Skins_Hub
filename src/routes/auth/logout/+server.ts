import { type RequestEvent } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";

export async function POST(event: RequestEvent) {
	event.cookies.delete("session", { path: "/" });
	redirect(302, "/");
}
