import { v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";

export const createSkin = mutation({
  args: {
    name: v.string(),
    author: v.optional(v.string()),
    download_url: v.string(),
    preview_images: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("skins", {
      ...args,
      download_count: 0,
    });
  },
});

export const listSkins = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db.query("skins").collect();
  },
});

export const getSkin = query({
  args: { id: v.id("skins") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateSkin = mutation({
  args: {
    _id: v.id("skins"),
    name: v.optional(v.string()),
    author: v.optional(v.string()),
    download_url: v.optional(v.string()),
    preview_images: v.optional(v.array(v.string())),
    download_count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { _id, ...data } = args;
    await ctx.db.patch(_id, data);
  },
});

export const deleteSkin = mutation({
  args: {
    _id: v.id("skins"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args._id);
  },
});

export const listSkinsWithPlayers = query({
  args: {},
  handler: async (ctx) => {
    const skins = await ctx.db.query("skins").collect();
    return await Promise.all(
      skins.map(async (skin) => {
        const relations = await ctx.db
          .query("playerSkins")
          .withIndex("by_skin", (q) => q.eq("skin_id", skin._id))
          .collect();

        const players = await Promise.all(relations.map((r) => ctx.db.get(r.player_id)));
        const playerNames = players.filter((p) => p !== null).map((p) => p!.name);

        return { ...skin, playerNames };
      }),
    );
  },
});
