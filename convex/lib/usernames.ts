/**
 * Adds usernames from osu! to the ones we already store.
 * Existing names keep their order and are never removed; new names go at the end.
 */
export function mergeUsernames(existing: string[], incoming: string[]): string[] {
	return [...new Set([...existing, ...incoming])];
}
