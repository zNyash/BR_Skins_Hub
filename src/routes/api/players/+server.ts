import { json, error } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin';
import { convex } from '$lib/server/convex';
import { api } from '$convex/_generated/api';

export async function POST(event) {
	requireAdmin(event);

	const body = await event.request.json();
	const { osu_id, name, cover_url, previous_usernames } = body;

	if (!osu_id || !name) error(400, 'osu_id and name are required');

	const id = await convex.mutation(api.players.upsertPlayer, {
		osu_id,
		name,
		cover_url,
		previous_usernames
	});

	return json({ id });
}
