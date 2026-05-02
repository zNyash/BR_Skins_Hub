import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function isAdminOsuId(osuId: number): boolean {
  const raw = process.env.ADMIN_OSU_IDS ?? "";
  const adminIds = raw
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => !Number.isNaN(id) && id > 0);

  return adminIds.includes(osuId);
}

export const createPlayer = mutation({
  args: {
    name: v.string(),
    osu_id: v.number(),
    cover_url: v.optional(v.string()),
    previous_usernames: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("players", {
      osu_id: args.osu_id,
      name: args.name,
      cover_url: args.cover_url,
      previous_usernames: args.previous_usernames || [],
    });
  },
});

export const listPlayers = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db.query("players").collect();
  },
});

export const getPlayer = query({
  args: {
    id: v.id("players"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPlayerByOsuId = query({
  args: { osu_id: v.number() },
  handler: async (ctx, args) => {
    const players = await ctx.db
      .query("players")
      .withIndex("by_osu_id", (q) => q.eq("osu_id", args.osu_id))
      .first();
    return players;
  },
});

// For basic player information update
export const updatePlayer = mutation({
  args: {
    id: v.id("players"),
    name: v.optional(v.string()),
    cover_url: v.optional(v.string()),
    previous_usernames: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const patch: Partial<Doc<"players">> = {};

    if (args.name !== undefined) patch.name = args.name;
    if (args.cover_url !== undefined) patch.cover_url = args.cover_url;
    if (args.previous_usernames !== undefined) patch.previous_usernames = args.previous_usernames;

    await ctx.db.patch(args.id, patch);
  },
});

// For the player's page update
export const updatePlayerProfile = mutation({
  args: {
    id: v.id("players"),
    requester_osu_id: v.number(),
    description: v.optional(v.string()),
    links: v.optional(
      v.array(
        v.object({
          type: v.union(
            v.literal("twitch"),
            v.literal("twitter"),
            v.literal("youtube"),
            v.literal("github"),
            v.literal("discord"),
            v.literal("custom"),
          ),
          value: v.string(),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const authUser = await ctx.db
      .query("authUsers")
      .withIndex("by_osu_id", (q) => q.eq("osu_id", args.requester_osu_id))
      .unique();

    const requesterOwnsProfile = authUser?.player_id === args.id;
    const requesterIsAdmin = isAdminOsuId(args.requester_osu_id);

    if (!requesterOwnsProfile && !requesterIsAdmin) {
      throw new Error("Forbidden");
    }

    const patch: Partial<Doc<"players">> = {};

    if (args.description !== undefined) patch.description = args.description;
    if (args.links !== undefined)
      patch.links = args.links.filter((link) => link.value.trim() !== "");

    await ctx.db.patch(args.id, patch);
  },
});

export const incrementPlayerViews = mutation({
  args: {
    id: v.id("players"),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.id);
    if (!player) return;

    await ctx.db.patch(args.id, {
      views: (player.views ?? 0) + 1,
    });
  },
});

export const deletePlayer = mutation({
  args: {
    player_id: v.id("players"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.player_id);
  },
});
