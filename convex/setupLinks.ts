import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { adminMutation, fail } from "./lib/functions";
import { relinkSetup } from "./lib/setupLinks";

/** Links every unlinked card whose typed model now matches a catalog device. Run after the catalog changes. */
export const relinkAll = internalMutation({
	args: {},
	handler: async (ctx) => {
		const devices = await ctx.db.query("devices").collect();
		for (const player of await ctx.db.query("players").collect()) {
			const setup = relinkSetup(player.setup, devices);
			if (setup) await ctx.db.patch(player._id, { setup });
		}
	}
});

/** Dashboard: points players' cards at one device by hand. Stays unlinked-by-match; the flag is cleared. */
export const link = adminMutation({
	args: {
		device_id: v.string(),
		cards: v.array(
			v.object({
				player_id: v.string(),
				card: v.union(
					v.literal("keyboard"),
					v.literal("tablet"),
					v.literal("mouse"),
					v.literal("monitor")
				)
			})
		)
	},
	handler: async (ctx, { device_id, cards }) => {
		const device = ctx.db.normalizeId("devices", device_id);
		const found = device && (await ctx.db.get(device));
		if (!found) fail(404, "Device not found");

		for (const { player_id, card } of cards) {
			if (found.type !== card) fail(400, `That device isn't a ${card}`);
			const id = ctx.db.normalizeId("players", player_id) ?? fail(404, "Player not found");
			const player = await ctx.db.get(id);
			if (!player) fail(404, "Player not found");
			const current = player.setup?.[card];
			// The card was removed meanwhile.
			if (!current) continue;

			const next = { ...current, device_id: found._id } as typeof current & { link?: "manual" };
			delete next.link;
			await ctx.db.patch(id, { setup: { ...player.setup, [card]: next } });
		}
	}
});
