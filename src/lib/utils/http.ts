/**
 * Turns a failed fetch response into a message worth showing to a person.
 * SvelteKit's error() responds with JSON like { "message": "..." }; other errors may be plain text.
 */
export async function readErrorMessage(response: Response): Promise<string> {
	const fallback = `Request failed (${response.status})`;
	const text = (await response.text()).trim();
	if (!text) return fallback;

	try {
		const body: unknown = JSON.parse(text);
		const message =
			body && typeof body === "object" && "message" in body ? body.message : undefined;
		return typeof message === "string" && message ? message : fallback;
	} catch {
		return text; // not JSON, so it's already a plain text message
	}
}
