import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { query, type QueryCtx } from "./_generated/server";
import { adminMutation, fail, serverMutation } from "./lib/functions";
import { deleteRelations, setPlayerSkins } from "./lib/relations";
import { mergeUsernames } from "./lib/usernames";
import { playerFields, playerLink } from "./validators";

function findByOsuId(ctx: QueryCtx, osuId: number) {
	return ctx.db
		.query("players")
		.withIndex("by_osu_id", (q) => q.eq("osu_id", osuId))
		.unique();
}

function normalizePlayerId(ctx: QueryCtx, id: string): Id<"players"> {
	return ctx.db.normalizeId("players", id) ?? fail(404, "Player not found");
}

export const list = query({
	args: {},
	handler: (ctx) => ctx.db.query("players").collect()
});

/** The player with the skins they use, or null. */
export const get = query({
	args: { osu_id: v.number() },
	handler: async (ctx, { osu_id }) => {
		const player = await findByOsuId(ctx, osu_id);
		if (!player) return null;

		const relations = await ctx.db
			.query("playerSkins")
			.withIndex("by_player", (q) => q.eq("player_id", player._id))
			.collect();
		const skins = await Promise.all(relations.map((r) => ctx.db.get(r.skin_id)));

		return { ...player, skins: skins.filter((s) => s !== null) };
	}
});

/**
 * Writes osu! data to the player, creating it if needed, and marks it as synced.
 * Previous usernames are curated by admins, so new ones are added but none are dropped.
 * With only_if_exists (logins, refreshes) a missing player is not created and null is returned.
 */
export const syncFromOsu = serverMutation({
	args: {
		osu_id: v.number(),
		name: v.string(),
		cover_url: v.optional(v.string()),
		previous_usernames: v.array(v.string()),
		only_if_exists: v.boolean()
	},
	handler: async (ctx, { osu_id, name, cover_url, previous_usernames, only_if_exists }) => {
		const now = Date.now();
		const existing = await findByOsuId(ctx, osu_id);

		if (existing) {
			await ctx.db.patch(existing._id, {
				name,
				cover_url,
				previous_usernames: mergeUsernames(existing.previous_usernames ?? [], previous_usernames),
				updated_at: now,
				synced_at: now
			});
			return await ctx.db.get(existing._id);
		}

		if (only_if_exists) return null;

		const id = await ctx.db.insert("players", {
			osu_id,
			name,
			cover_url,
			previous_usernames,
			updated_at: now,
			synced_at: now
		});
		return await ctx.db.get(id);
	}
});

/** Admin edit: changes only the fields sent, and sets exactly which skins the player uses. */
export const update = adminMutation({
	args: { id: v.string(), ...playerFields, skin_ids: v.array(v.id("skins")) },
	handler: async (ctx, { id, skin_ids, hue, ...fields }) => {
		const playerId = normalizePlayerId(ctx, id);
		if (!(await ctx.db.get(playerId))) fail(404, "Player not found");

		await ctx.db.patch(playerId, {
			...fields,
			...(hue !== undefined && { hue: hue ?? undefined }),
			updated_at: Date.now()
		});
		await setPlayerSkins(ctx.db, playerId, skin_ids);
	}
});

/** A player editing their own page. The server passes who is asking (actor_osu_id). */
export const updateOwnProfile = serverMutation({
	args: {
		actor_osu_id: v.number(),
		description: v.optional(v.string()),
		links: v.optional(v.array(playerLink))
	},
	handler: async (ctx, { actor_osu_id, description, links }) => {
		const authUser = await ctx.db
			.query("authUsers")
			.withIndex("by_osu_id", (q) => q.eq("osu_id", actor_osu_id))
			.unique();
		if (!authUser?.player_id) fail(403, "You can only edit your own profile");

		await ctx.db.patch(authUser.player_id, {
			...(description !== undefined && { description }),
			...(links !== undefined && { links: links.filter((link) => link.value.trim() !== "") }),
			updated_at: Date.now()
		});
	}
});

export const incrementViews = serverMutation({
	args: { id: v.string() },
	handler: async (ctx, { id }) => {
		const player = await ctx.db.get(normalizePlayerId(ctx, id));
		if (!player) fail(404, "Player not found");
		await ctx.db.patch(player._id, { views: (player.views ?? 0) + 1 });
	}
});

/** Deletes the player, its skin relations, and unlinks any login account pointing at it. */
export const remove = adminMutation({
	args: { id: v.string() },
	handler: async (ctx, { id }) => {
		const playerId = normalizePlayerId(ctx, id);
		if (!(await ctx.db.get(playerId))) fail(404, "Player not found");

		await deleteRelations(ctx.db, { player: playerId });

		const linkedUsers = await ctx.db
			.query("authUsers")
			.filter((q) => q.eq(q.field("player_id"), playerId))
			.collect();
		await Promise.all(linkedUsers.map((user) => ctx.db.patch(user._id, { player_id: undefined })));

		await ctx.db.delete(playerId);
	}
});
