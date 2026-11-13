import Fuse from "fuse.js";
import type { Doc, Id } from "$convex/_generated/dataModel";
import { confidentMatch, normalizeModel } from "$convex/lib/deviceMatch";
import { LINKABLE_CARDS, type LinkableCard } from "$convex/lib/setupLinks";
import type { Device } from "$lib/types";

export type LinkGroup = {
	type: LinkableCard;
	/** The normalized model. */
	key: string;
	/** The most common typed variant, upper-cased. */
	label: string;
	/** Distinct typed variants, most common first. */
	variants: string[];
	cards: { player_id: Id<"players">; card: LinkableCard }[];
	/** Every card has `link: "manual"`: the player removed the link. */
	allKept: boolean;
	/** Best Fuse match among the type's devices. */
	closest: Device | null;
};

/**
 * Unlinked setup cards with a typed model, grouped by (type, normalized model). A card flagged
 * "manual" is listed even when its text confidently matches; an unflagged confident match is not
 * (it is linked, or the re-check will link it).
 */
export function linkGroups(players: Doc<"players">[], devices: Device[]): LinkGroup[] {
	type Draft = {
		type: LinkableCard;
		key: string;
		typed: Map<string, number>;
		cards: LinkGroup["cards"];
		kept: number;
	};
	const drafts = new Map<string, Draft>();

	for (const player of players) {
		for (const card of LINKABLE_CARDS) {
			const value = player.setup?.[card] as { model?: string; device_id?: string; link?: "manual" };
			if (!value || value.device_id) continue;
			const model = value.model?.trim() ?? "";
			const key = normalizeModel(model);
			if (key === "") continue;
			if (value.link !== "manual" && confidentMatch(model, card, devices)) continue;

			const id = `${card}:${key}`;
			let draft = drafts.get(id);
			if (!draft) {
				draft = { type: card, key, typed: new Map(), cards: [], kept: 0 };
				drafts.set(id, draft);
			}
			draft.typed.set(model, (draft.typed.get(model) ?? 0) + 1);
			draft.cards.push({ player_id: player._id, card });
			if (value.link === "manual") draft.kept++;
		}
	}

	return [...drafts.values()]
		.map((d): LinkGroup => {
			const variants = [...d.typed.entries()].sort((a, b) => b[1] - a[1]).map(([text]) => text);
			const ofType = devices.filter((x) => x.type === d.type);
			const closest =
				ofType.length === 0
					? null
					: (new Fuse(ofType, { keys: ["name"], threshold: 0.4 }).search(variants[0])[0]?.item ??
						null);
			return {
				type: d.type,
				key: d.key,
				label: variants[0].toUpperCase(),
				variants,
				cards: d.cards,
				allKept: d.kept === d.cards.length,
				closest
			};
		})
		.sort((a, b) => b.cards.length - a.cards.length || a.label.localeCompare(b.label));
}
