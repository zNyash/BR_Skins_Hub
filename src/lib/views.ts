const KEY = "viewed-players";

/**
 * Records a profile view for this tab session. Returns true the first time a player is seen,
 * false on repeats. When storage is blocked or broken the view still counts: undercounting
 * real visitors is worse than the odd extra view, and the server rate limit caps abuse.
 */
export function claimView(
	playerId: string,
	storage: () => Storage = () => sessionStorage
): boolean {
	try {
		const store = storage();
		let viewed: string[] = [];
		try {
			viewed = JSON.parse(store.getItem(KEY) ?? "[]");
		} catch {
			// Corrupt value: start over.
		}
		if (viewed.includes(playerId)) return false;
		store.setItem(KEY, JSON.stringify([...viewed, playerId]));
		return true;
	} catch {
		return true;
	}
}
