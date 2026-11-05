import type { Id } from "../_generated/dataModel";
import type { DatabaseReader, DatabaseWriter } from "../_generated/server";
import { fail } from "./functions";

/** A skin on a player's page: which one, and whether the player hid it. */
export type SkinEntry = { id: Id<"skins">; hidden: boolean };

function playerRelations(db: DatabaseReader, playerId: Id<"players">) {
	return db
		.query("playerSkins")
		.withIndex("by_player", (q) => q.eq("player_id", playerId))
		.collect();
}

/**
 * Makes the player use exactly `skins`, in that order (array index = position) and with those
 * hidden flags. Missing relations are added, the rest removed, and only changed rows are patched.
 * Duplicate ids: the first one wins.
 */
export async function setPlayerSkins(
	db: DatabaseWriter,
	playerId: Id<"players">,
	skins: SkinEntry[]
) {
	const current = await playerRelations(db, playerId);

	// Keyed by id, keeping the first occurrence (a Map keeps insertion order, so the order holds too).
	const firstOf = new Map<Id<"skins">, SkinEntry>();
	for (const s of skins) if (!firstOf.has(s.id)) firstOf.set(s.id, s);
	const wanted = [...firstOf.values()];

	const byId = new Map(current.map((r) => [r.skin_id, r]));
	const toRemove = current.filter((r) => !firstOf.has(r.skin_id));

	await Promise.all(toRemove.map((r) => db.delete(r._id)));
	await Promise.all(
		wanted.map(({ id, hidden }, position) => {
			const row = byId.get(id);
			if (!row) {
				return db.insert("playerSkins", { player_id: playerId, skin_id: id, position, hidden });
			}
			if (row.position !== position || (row.hidden ?? false) !== hidden) {
				return db.patch(row._id, { position, hidden });
			}
		})
	);
}

/**
 * Mirror of setPlayerSkins: makes exactly `playerIds` use the skin. A player who already has a
 * custom order gets the skin on top of it; without one, date order already shows it first.
 */
export async function setSkinPlayers(
	db: DatabaseWriter,
	skinId: Id<"skins">,
	playerIds: Id<"players">[]
) {
	const current = await db
		.query("playerSkins")
		.withIndex("by_skin", (q) => q.eq("skin_id", skinId))
		.collect();

	const target = new Set(playerIds);
	const currentIds = new Set(current.map((r) => r.player_id));

	const toRemove = current.filter((r) => !target.has(r.player_id));
	const toAdd = [...target].filter((id) => !currentIds.has(id));

	await Promise.all(toRemove.map((r) => db.delete(r._id)));
	await Promise.all(
		toAdd.map(async (playerId) => {
			const positions = (await playerRelations(db, playerId)).flatMap((r) =>
				r.position === undefined ? [] : [r.position]
			);
			const position = positions.length > 0 ? Math.min(...positions) - 1 : undefined;
			await db.insert("playerSkins", { player_id: playerId, skin_id: skinId, position });
		})
	);
}

/**
 * For the player settings page: puts the player's skins in the given order.
 * Can't add or remove relations: the list must be exactly the skins the player uses.
 */
export async function reorderSkins(
	db: DatabaseWriter,
	playerId: Id<"players">,
	skinIds: Id<"skins">[]
) {
	const current = await playerRelations(db, playerId);
	const currentIds = new Set(current.map((r) => r.skin_id));

	const isSameSet =
		new Set(skinIds).size === skinIds.length &&
		skinIds.length === current.length &&
		skinIds.every((id) => currentIds.has(id));
	if (!isSameSet) fail(400, "Skin list doesn't match the player's skins");

	const bySkin = new Map(current.map((r) => [r.skin_id, r]));
	await Promise.all(
		skinIds.map((skinId, position) => {
			const row = bySkin.get(skinId)!;
			if (row.position !== position) return db.patch(row._id, { position });
		})
	);
}

/**
 * For the player settings page: hides or shows one of the player's skins on their profile.
 * Can't add or remove relations.
 */
export async function setSkinHidden(
	db: DatabaseWriter,
	playerId: Id<"players">,
	skinId: Id<"skins">,
	hidden: boolean
) {
	const row = await db
		.query("playerSkins")
		.withIndex("by_player_skin", (q) => q.eq("player_id", playerId).eq("skin_id", skinId))
		.unique();
	if (!row) fail(404, "Player doesn't use this skin");

	await db.patch(row._id, { hidden });
}

/** Removes every relation of a player or a skin, used before deleting it. */
export async function deleteRelations(
	db: DatabaseWriter,
	by: { player: Id<"players"> } | { skin: Id<"skins"> }
) {
	const relations =
		"player" in by
			? await playerRelations(db, by.player)
			: await db
					.query("playerSkins")
					.withIndex("by_skin", (q) => q.eq("skin_id", by.skin))
					.collect();

	await Promise.all(relations.map((r) => db.delete(r._id)));
}
