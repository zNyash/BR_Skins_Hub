import { invalidate } from "$app/navigation";
import { request } from "$lib/api";

/** Saves fields of the logged-in player's own profile, then reloads the page's player data. */
export async function saveProfile(osuId: number, body: Record<string, unknown>) {
	await request("/api/me/profile", { method: "PATCH", body });
	await invalidate(`app:player:${osuId}`);
}

/** The API's message when there is one, so toasts say what actually went wrong. */
export const errorMessage = (err: unknown, fallback: string) =>
	err instanceof Error ? err.message : fallback;
