import { json, error } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin';
import { convex } from '$lib/server/convex';
import { api } from '$convex/_generated/api';

export async function POST(event) {
	requireAdmin(event);

	const body = await event.request.json();
	const { name, author, download_url, preview_images } = body;

	if (!name || !download_url) error(400, 'name and download_url are required');

	const id = await convex.mutation(api.skins.createSkin, {
		name,
		author,
		download_url,
		preview_images: preview_images ?? []
	});

	return json({ id });
}
