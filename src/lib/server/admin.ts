import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ADMIN_OSU_IDS } from '$env/static/private';

const getAdminIds = () =>
	new Set(
		(ADMIN_OSU_IDS ?? '')
			.split(',')
			.map(Number)
			.filter(Boolean)
	);

export const isAdminId = (id: number) => getAdminIds().has(id);

export function requireAdmin(event: RequestEvent) {
	if (!event.locals.user) error(401, 'Unauthorized');
	if (!isAdminId(event.locals.user.osu_id)) error(403, 'Forbidden');
	return event.locals.user;
}
