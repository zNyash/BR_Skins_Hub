import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAuthUser = query({
  args: { osu_id: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("authUsers")
      .withIndex("by_osu_id", (q) => q.eq("osu_id", args.osu_id))
      .unique();
  },
});

export const upsertUser = mutation({
  args: {
    osu_id: v.number(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("authUsers")
      .withIndex("by_osu_id", (q) => q.eq("osu_id", args.osu_id))
      .unique();

    // Check if a public player profile already exists for this osu! account
    const matchingPlayer = await ctx.db
      .query("players")
      .withIndex("by_osu_id", (q) => q.eq("osu_id", args.osu_id))
      .unique();

    // Keep player's public name in sync with latest osu! username
    if (matchingPlayer && matchingPlayer.name !== args.username) {
      await ctx.db.patch(matchingPlayer._id, { name: args.username });
    }

    if (existingUser) {
      const usernameChanged = existingUser.username !== args.username;
      const playerLinkChanged = matchingPlayer
        ? existingUser.player_id !== matchingPlayer._id
        : false;

      if (usernameChanged || playerLinkChanged) {
        await ctx.db.patch(existingUser._id, {
          ...(usernameChanged ? { username: args.username } : {}),
          ...(playerLinkChanged ? { player_id: matchingPlayer!._id } : {}),
        });
      }

      return existingUser._id;
    }

    return await ctx.db.insert("authUsers", {
      osu_id: args.osu_id,
      username: args.username,
      ...(matchingPlayer ? { player_id: matchingPlayer._id } : {}),
    });
  },
});
