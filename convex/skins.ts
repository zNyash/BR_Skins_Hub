import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSkin = mutation({
	args: {
		name: v.string(),
		author: v.optional(v.string()),
		download_url: v.string(),
		preview_images: v.array(v.string())
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("skins", {
			...args,
			download_count: 0
		});
	}
});

export const listSkins = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("skins").collect();
	}
});

export const getSkin = query({
	args: { id: v.id("skins") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	}
});

export const updateSkin = mutation({
	args: {
		_id: v.id("skins"),
		name: v.optional(v.string()),
		author: v.optional(v.string()),
		download_url: v.optional(v.string()),
		preview_images: v.optional(v.array(v.string()))
	},
	handler: async (ctx, args) => {
		const { _id, ...data } = args;
		await ctx.db.patch(_id, data);
	}
});

export const incrementSkinDownloads = mutation({
	args: {
		id: v.id("skins")
	},
	handler: async (ctx, args) => {
		const skin = await ctx.db.get(args.id);
		if (!skin) return;
		await ctx.db.patch(args.id, {
			download_count: (skin.download_count ?? 0) + 1
		});
	}
});

export const deleteSkin = mutation({
	args: {
		_id: v.id("skins")
	},
	handler: async (ctx, args) => {
		await ctx.db.delete(args._id);
	}
});

export const listSkinsWithPlayers = query({
	args: {},
	handler: async (ctx) => {
		const [skins, allRelations, allPlayers] = await Promise.all([
			ctx.db.query("skins").collect(),
			ctx.db.query("playerSkins").collect(),
			ctx.db.query("players").collect()
		]);

		// Maps for quick lookup
		const playerMap = new Map(allPlayers.map((p) => [p._id, p])); // Map of players with _id as key
		const relationsMap = new Map<string, typeof allRelations>(); // Map of relations with skin _id as key

		// Store all the relations for a given skin by its _id
		for (const relation of allRelations) {
			const list = relationsMap.get(relation.skin_id) ?? [];
			list.push(relation);
			relationsMap.set(relation.skin_id, list);
		}

		return skins.map((skin) => {
			const players = (relationsMap.get(skin._id) ?? [])
				.map((r) => playerMap.get(r.player_id))
				.filter((p) => p !== undefined);
			return { ...skin, players };
		});
	}
});
