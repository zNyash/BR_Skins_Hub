import type { Doc, Id } from "$convex/_generated/dataModel";
import { sortPlayerSkins } from "$convex/lib/order";
import type { SkinWithPlayers } from "$lib/types";
import { skinsChanged, type DraftSkin } from "../../player-skins";

/** The player fields the editor changes, with missing lists and bio as empty values. */
export function snapshotFromPlayer(p: Doc<"players">) {
	return {
		name: p.name,
		cover_url: p.cover_url,
		hue: p.hue,
		description: p.description,
		bio: p.bio ?? "",
		previous_usernames: p.previous_usernames ?? [],
		links: p.links ?? [],
		tags: p.tags ?? []
	} satisfies Partial<Doc<"players">>;
}

export type PlayerSnapshot = ReturnType<typeof snapshotFromPlayer>;

/** Each list item carries its skin doc, so the list renders without looking skins up by id. */
export type SkinItem = DraftSkin & { skin: SkinWithPlayers };

/** Everything the editor edits, across all tabs. */
export type PlayerDraft = { player: PlayerSnapshot; skins: SkinItem[] };

/**
 * The player's skins in profile order: the player's relation on each skin has its position and
 * visibility.
 */
export function playerSkinItems(skins: SkinWithPlayers[], playerId: Id<"players">): SkinItem[] {
	return sortPlayerSkins(
		skins.flatMap((skin) => {
			const relation = skin.players.find((p) => p._id === playerId);
			return relation ? [{ skin, position: relation.position, hidden: relation.hidden }] : [];
		})
	).map((e) => ({ id: e.skin._id, hidden: e.hidden, skin: e.skin }));
}

const fieldKeys = (draft: PlayerDraft) => Object.keys(draft.player) as (keyof PlayerSnapshot)[];

// Field values are plain JSON (strings, numbers, arrays of objects), so comparing their JSON is enough.
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Whether the draft differs from the loaded player: any field, or skin membership/order/visibility. */
export function draftChanged(draft: PlayerDraft, base: PlayerDraft): boolean {
	return (
		fieldKeys(draft).some((key) => !same(draft.player[key], base.player[key])) ||
		skinsChanged(draft.skins, base.skins)
	);
}

/**
 * The PATCH body: only the fields that changed, plus the whole skin list (the API always takes it,
 * so assignments, order and visibility are saved together with the fields, in one transaction).
 */
export function playerPatch(draft: PlayerDraft, base: PlayerDraft) {
	const changed = fieldKeys(draft).filter((key) => !same(draft.player[key], base.player[key]));
	return {
		...(Object.fromEntries(
			changed.map((key) => [key, draft.player[key]])
		) as Partial<PlayerSnapshot>),
		skins: draft.skins.map(({ id, hidden }) => ({ id, hidden }))
	};
}
