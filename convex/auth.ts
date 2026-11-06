import { v } from "convex/values";
import { serverMutation, serverQuery } from "./lib/functions";

/** The logged-in user, plus their player's color (the site uses it on every page but profiles). */
export const getUser = serverQuery({
	args: { osu_id: v.number() },
	handler: async (ctx, { osu_id }) => {
		const user = await ctx.db
			.query("authUsers")
			.withIndex("by_osu_id", (q) => q.eq("osu_id", osu_id))
			.unique();
		if (!user) return null;

		const player = user.player_id ? await ctx.db.get(user.player_id) : null;
		return { ...user, hue: player?.hue ?? null };
	}
});

/** Called on every login: keeps the username fresh and links the account to its player page, if any. */
export const upsertUser = serverMutation({
	args: { osu_id: v.number(), username: v.string() },
	handler: async (ctx, { osu_id, username }) => {
		const [user, player] = await Promise.all([
			ctx.db
				.query("authUsers")
				.withIndex("by_osu_id", (q) => q.eq("osu_id", osu_id))
				.unique(),
			ctx.db
				.query("players")
				.withIndex("by_osu_id", (q) => q.eq("osu_id", osu_id))
				.unique()
		]);

		if (user) {
			await ctx.db.patch(user._id, { username, player_id: player?._id });
			return user._id;
		}
		return await ctx.db.insert("authUsers", { osu_id, username, player_id: player?._id });
	}
});
