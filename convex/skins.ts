import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { query, type QueryCtx } from "./_generated/server";
import { adminMutation, fail, serverMutation } from "./lib/functions";
import { deleteRelations, setSkinPlayers } from "./lib/relations";
import { skinFields } from "./validators";

function normalizeSkinId(ctx: QueryCtx, id: string): Id<"skins"> {
	return ctx.db.normalizeId("skins", id) ?? fail(404, "Skin not found");
}

/** All skins, without players (keeps the public listing small). */
export const list = query({
	args: {},
	handler: (ctx) => ctx.db.query("skins").collect()
});

/** All skins with the players using them, joined in memory from three collects. */
export const listWithPlayers = query({
	args: {},
	handler: async (ctx) => {
		const [skins, relations, players] = await Promise.all([
			ctx.db.query("skins").collect(),
			ctx.db.query("playerSkins").collect(),
			ctx.db.query("players").collect()
		]);

		const playersById = new Map(players.map((p) => [p._id, p]));
		const relationsBySkin = new Map<Id<"skins">, Doc<"playerSkins">[]>();
		for (const r of relations) {
			relationsBySkin.set(r.skin_id, [...(relationsBySkin.get(r.skin_id) ?? []), r]);
		}

		// Each player also carries this skin's place and visibility on their page (for the dashboard editor).
		return skins.map((skin) => ({
			...skin,
			players: (relationsBySkin.get(skin._id) ?? []).flatMap((r) => {
				const player = playersById.get(r.player_id);
				return player ? [{ ...player, position: r.position, hidden: r.hidden ?? false }] : [];
			})
		}));
	}
});

/** The skin with the players using it, or null (also for malformed ids). */
export const get = query({
	args: { id: v.string() },
	handler: async (ctx, { id }) => {
		const skinId = ctx.db.normalizeId("skins", id);
		const skin = skinId && (await ctx.db.get(skinId));
		if (!skin) return null;

		const relations = await ctx.db
			.query("playerSkins")
			.withIndex("by_skin", (q) => q.eq("skin_id", skin._id))
			.collect();
		const players = await Promise.all(relations.map((r) => ctx.db.get(r.player_id)));

		return { ...skin, players: players.filter((p) => p !== null) };
	}
});

/** Creates the skin when no id is given, otherwise updates it. player_ids, when sent, sets exactly who uses it. */
export const upsert = adminMutation({
	args: {
		id: v.optional(v.string()),
		...skinFields,
		player_ids: v.optional(v.array(v.id("players")))
	},
	handler: async (ctx, { id, player_ids, ...fields }) => {
		const now = Date.now();
		let skinId: Id<"skins">;

		if (id === undefined) {
			skinId = await ctx.db.insert("skins", { ...fields, download_count: 0, updated_at: now });
		} else {
			skinId = normalizeSkinId(ctx, id);
			if (!(await ctx.db.get(skinId))) fail(404, "Skin not found");
			await ctx.db.patch(skinId, { ...fields, updated_at: now });
		}

		if (player_ids) await setSkinPlayers(ctx.db, skinId, player_ids);
		return skinId;
	}
});

export const incrementDownloads = serverMutation({
	args: { id: v.string() },
	handler: async (ctx, { id }) => {
		const skin = await ctx.db.get(normalizeSkinId(ctx, id));
		if (!skin) fail(404, "Skin not found");
		await ctx.db.patch(skin._id, { download_count: skin.download_count + 1 });
	}
});

/** Deletes the skin and its relations. Returns its image urls so the caller can delete the files. */
export const remove = adminMutation({
	args: { id: v.string() },
	handler: async (ctx, { id }) => {
		const skinId = normalizeSkinId(ctx, id);
		const skin = await ctx.db.get(skinId);
		if (!skin) fail(404, "Skin not found");

		await deleteRelations(ctx.db, { skin: skinId });
		await ctx.db.delete(skinId);
		return { images: skin.preview_images, download_url: skin.download_url };
	}
});
