import { tick, untrack } from "svelte";
import { toast } from "svelte-sonner";
import { invalidate } from "$app/navigation";
import type { Doc } from "$convex/_generated/dataModel";
import { request } from "$lib/api";
import { hasBlankLink } from "$lib/links";
import type { SkinWithPlayers } from "$lib/types";
import {
	draftChanged,
	playerPatch,
	playerSkinItems,
	snapshotFromPlayer,
	type PlayerDraft
} from "./player-fields";

/**
 * One editable copy of a player (all tabs), compared with the loaded player to know whether
 * there's anything to save. Call it while a component initializes.
 */
export function createPlayerDraft(player: () => Doc<"players">, skins: () => SkinWithPlayers[]) {
	const loaded = $derived<PlayerDraft>({
		player: snapshotFromPlayer(player()),
		skins: playerSkinItems(skins(), player()._id)
	});

	// The loaded data the draft was made from: Reset goes back to it, and Save sends what differs.
	let base = $state.raw(untrack(() => loaded));
	let draft = $state(structuredClone(untrack(() => loaded)));

	const dirty = $derived(draftChanged($state.snapshot(draft), base));

	// When the data reloads (e.g. after an osu! sync), an untouched draft follows it; one with edits
	// is kept, and only compared against the fresh data from now on.
	$effect.pre(() => {
		const next = loaded;
		untrack(() => {
			if (next === base) return;
			if (!dirty) draft = structuredClone(next);
			base = next;
		});
	});

	function reset() {
		draft = structuredClone(base);
	}

	async function save() {
		if (hasBlankLink(draft.player.links)) {
			toast.error("Fill in or remove the empty link before saving.");
			return;
		}
		try {
			await request(`/api/players/${player()._id}`, {
				method: "PATCH",
				body: playerPatch($state.snapshot(draft), base)
			});
		} catch (e) {
			// The draft stays, so nothing typed is lost.
			toast.error((e as Error).message);
			return;
		}
		toast.success("Player saved");
		await Promise.all([invalidate("app:players"), invalidate("app:skins")]);
		await tick();
		// The server tidies some values (trims, drops blank usernames), so take what it stored.
		base = loaded;
		reset();
	}

	return {
		get draft() {
			return draft;
		},
		set draft(value) {
			draft = value;
		},
		isDirty: () => dirty,
		reset,
		save
	};
}
