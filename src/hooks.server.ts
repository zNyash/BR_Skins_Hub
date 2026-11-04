import type { Handle, HandleServerError } from "@sveltejs/kit";
import { verifyToken } from "$lib/server/auth";

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get("session");
	event.locals.user = null;

	if (token) {
		const payload = await verifyToken(token);
		if (payload) event.locals.user = payload;
	}

	return resolve(event);
};

// Runs only for unexpected errors (not error()/redirect()). `error` is the original thrown value,
// so logging it directly keeps details that SvelteKit's own "Error: {}" message loses.
export const handleError: HandleServerError = ({ error, event, status, message }) => {
	const errorId = crypto.randomUUID().slice(0, 8);
	const kind = error instanceof Error ? error.name : `non-Error value (${typeof error})`;

	console.error(
		`[error ${errorId}] ${status} ${event.request.method} ${event.url.pathname} threw a ${kind}:`,
		error
	);

	// Never leak internals to the client, just a reference to look up in the logs.
	return { message: `${message} (ref ${errorId})`, errorId };
};
