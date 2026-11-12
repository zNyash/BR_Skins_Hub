import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { directDriveLink } from "./lib/links";

/**
 * One-off: rewrites Google Drive share links (`/file/d/<id>/view`) as direct downloads. Run with
 * `bunx convex run migrations:directDriveLinks '{"dry": true}'` to list the changes first.
 * `updated_at` is left alone: the skin's content didn't change.
 */
export const directDriveLinks = internalMutation({
	args: { dry: v.boolean() },
	handler: async (ctx, { dry }) => {
		const changes = [];
		for (const skin of await ctx.db.query("skins").collect()) {
			const next = directDriveLink(skin.download_url);
			if (next === skin.download_url) continue;
			changes.push({ name: skin.name, from: skin.download_url, to: next });
			if (!dry) await ctx.db.patch(skin._id, { download_url: next });
		}
		return { dry, changed: changes.length, changes };
	}
});
