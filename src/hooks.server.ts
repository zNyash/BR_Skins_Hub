import type { Handle } from '@sveltejs/kit';
import { verifyToken } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session');
	event.locals.user = null;

	if (token) {
		const payload = await verifyToken(token);
		if (payload) event.locals.user = payload;
	}

	return resolve(event);
};
