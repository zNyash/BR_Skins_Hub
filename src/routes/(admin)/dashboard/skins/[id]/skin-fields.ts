import type { Id } from "$convex/_generated/dataModel";
import type { SkinWithPlayers } from "$lib/types";
import type { ImageItem } from "../../skin-images";

/** Everything the skin editor edits. Images can be pending files, uploaded on save. */
export type SkinDraft = {
	skin: { name: string; author: string; download_url: string; tags: string[] };
	images: ImageItem[];
	playerIds: Id<"players">[];
	/** A dropped .osk, uploaded to Google Drive on save; its link replaces `download_url`. */
	osk: File | null;
};

/** The skin as a draft, with a missing author and tags as empty values. */
export function snapshotFromSkin(s: SkinWithPlayers): SkinDraft {
	return {
		skin: {
			name: s.name,
			author: s.author ?? "",
			download_url: s.download_url,
			tags: s.tags ?? []
		},
		images: s.preview_images.map((url) => ({ id: url, kind: "url", url })),
		playerIds: s.players.map((p) => p._id),
		osk: null
	};
}

const json = (v: unknown) => JSON.stringify(v);

/**
 * Whether the draft differs from the loaded skin. Files can't be JSON-compared, so images are
 * compared by id (url or blob preview), in order; players by who is assigned, in any order.
 */
export function draftChanged(draft: SkinDraft, base: SkinDraft): boolean {
	const ids = (d: SkinDraft) => d.images.map((i) => i.id);
	const players = (d: SkinDraft) => [...d.playerIds].sort();
	return (
		json(draft.skin) !== json(base.skin) ||
		json(ids(draft)) !== json(ids(base)) ||
		json(players(draft)) !== json(players(base)) ||
		draft.osk !== base.osk
	);
}

/** Why the draft can't be saved yet, or null when it can. */
export function draftError(draft: SkinDraft): string | null {
	if (draft.skin.name.trim() === "") return "Give the skin a name.";
	// A pending .osk brings its own link.
	if (!draft.osk && !URL.canParse(draft.skin.download_url.trim())) {
		return "Enter a valid download link.";
	}
	return null;
}

/**
 * The PATCH body: the whole skin, with `preview_images` already resolved to urls. The server
 * deletes uploaded images that are no longer in the list.
 */
export function skinBody(draft: SkinDraft, preview_images: string[]) {
	return {
		name: draft.skin.name.trim(),
		author: draft.skin.author.trim(),
		download_url: draft.skin.download_url.trim(),
		tags: draft.skin.tags,
		preview_images,
		player_ids: draft.playerIds
	};
}
