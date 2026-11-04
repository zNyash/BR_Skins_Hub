import type { Id } from "../_generated/dataModel";
import type { DatabaseWriter } from "../_generated/server";

/** Makes the player use exactly `skinIds`: missing relations are added, the rest removed. */
export async function setPlayerSkins(
	db: DatabaseWriter,
	playerId: Id<"players">,
	skinIds: Id<"skins">[]
) {
	const current = await db
		.query("playerSkins")
		.withIndex("by_player", (q) => q.eq("player_id", playerId))
		.collect();

	const target = new Set(skinIds);
	const currentIds = new Set(current.map((r) => r.skin_id));

	const toRemove = current.filter((r) => !target.has(r.skin_id));
	const toAdd = [...target].filter((id) => !currentIds.has(id));

	await Promise.all(toRemove.map((r) => db.delete(r._id)));
	await Promise.all(
		toAdd.map((skinId) => db.insert("playerSkins", { player_id: playerId, skin_id: skinId }))
	);
}

/** Mirror of setPlayerSkins: makes exactly `playerIds` use the skin. */
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
		toAdd.map((playerId) => db.insert("playerSkins", { player_id: playerId, skin_id: skinId }))
	);
}

/** Removes every relation of a player or a skin, used before deleting it. */
export async function deleteRelations(
	db: DatabaseWriter,
	by: { player: Id<"players"> } | { skin: Id<"skins"> }
) {
	const relations =
		"player" in by
			? await db
					.query("playerSkins")
					.withIndex("by_player", (q) => q.eq("player_id", by.player))
					.collect()
			: await db
					.query("playerSkins")
					.withIndex("by_skin", (q) => q.eq("skin_id", by.skin))
					.collect();

	await Promise.all(relations.map((r) => db.delete(r._id)));
}
