export function osuAvatar(osu_id: number): string {
	return `https://a.ppy.sh/${osu_id}`;
}

/**
 * Adds usernames from osu! to the ones we already store.
 * Existing names keep their order and are never removed; new names go at the end.
 */
export function mergeUsernames(existing: string[], incoming: string[]): string[] {
	return [...new Set([...existing, ...incoming])];
}

/** Accepts "12345" or an osu! profile link ("osu.ppy.sh/users/12345/osu"). */
export function parseOsuId(input: string): number | null {
	const value = input.trim();
	const match = /^\d+$/.test(value)
		? value
		: value.match(/^(?:https?:\/\/)?osu\.ppy\.sh\/(?:users|u)\/(\d+)/)?.[1];

	const id = Number(match);
	return match && id > 0 ? id : null;
}
