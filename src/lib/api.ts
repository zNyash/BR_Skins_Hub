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

/**
 * Calls our API with a JSON body. Resolves the parsed response (undefined for 204),
 * or rejects with the backend's error message, ready to show in a toast.
 */
export async function request<T = undefined>(
	path: string,
	options: { method?: string; body?: unknown } = {}
): Promise<T> {
	const response = await fetch(path, {
		method: options.method ?? "GET",
		...(options.body !== undefined && {
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(options.body)
		})
	});

	if (!response.ok) throw new Error(await readErrorMessage(response));
	if (response.status === 204) return undefined as T;
	return (await response.json()) as T;
}
