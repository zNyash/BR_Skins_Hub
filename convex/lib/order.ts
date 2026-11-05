/**
 * The order of a player's skins: the ones with a custom position first (lowest first),
 * then the rest newest first. Players who never reordered have no positions, so they get date order.
 *
 * Pure (no Convex server imports) so the dashboard can sort the same way as the server.
 */
export function sortPlayerSkins<T extends { position?: number; skin: { _creationTime: number } }>(
	entries: readonly T[]
): T[] {
	return [...entries].sort((a, b) => {
		if (a.position !== undefined && b.position !== undefined) return a.position - b.position;
		if (a.position !== undefined) return -1;
		if (b.position !== undefined) return 1;
		return b.skin._creationTime - a.skin._creationTime;
	});
}
