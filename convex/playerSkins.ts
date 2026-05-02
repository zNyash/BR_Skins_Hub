import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getSkinsByPlayer = query({
  args: { player_id: v.id("players") },
  handler: async (ctx, args) => {
    const relations = await ctx.db
      .query("playerSkins")
      .withIndex("by_player", (q) => q.eq("player_id", args.player_id))
      .collect();

    const skins = await Promise.all(relations.map((r) => ctx.db.get(r.skin_id)));
    return skins.filter((s) => s !== null);
  },
});

export const getSkinsByOsuId = query({
  args: { osu_id: v.number() },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_osu_id", (q) => q.eq("osu_id", args.osu_id))
      .first();

    if (!player) return [];

    const relations = await ctx.db
      .query("playerSkins")
      .withIndex("by_player", (q) => q.eq("player_id", player._id))
      .collect();

    const skins = await Promise.all(relations.map((r) => ctx.db.get(r.skin_id)));
    return skins.filter((s) => s !== null);
  },
});

export const updatePlayerSkins = mutation({
  args: {
    player_id: v.id("players"),
    skin_ids: v.array(v.id("skins")),
  },
  handler: async (ctx, args) => {
    // 1. Get current relations
    const currentRelations = await ctx.db
      .query("playerSkins")
      .withIndex("by_player", (q) => q.eq("player_id", args.player_id))
      .collect();

    const currentSkinIds = new Set(currentRelations.map((r) => r.skin_id));
    const targetSkinIds = new Set(args.skin_ids);

    // 2. Identify skins to remove (in current but not in target)
    const toRemove = currentRelations.filter((r) => !targetSkinIds.has(r.skin_id));

    // 3. Identify skins to add (in target but not in current)
    const toAdd = args.skin_ids.filter((id) => !currentSkinIds.has(id));

    // 4. Perform deletions
    await Promise.all(toRemove.map((r) => ctx.db.delete(r._id)));

    // 5. Perform insertions
    await Promise.all(
      toAdd.map((skinId) =>
        ctx.db.insert("playerSkins", {
          player_id: args.player_id,
          skin_id: skinId,
        }),
      ),
    );
  },
});
