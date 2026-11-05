import { v } from "convex/values";

export const playerLink = v.object({
	type: v.union(
		v.literal("twitch"),
		v.literal("twitter"),
		v.literal("youtube"),
		v.literal("github"),
		v.literal("discord"),
		v.literal("custom")
	),
	value: v.string()
});

/** Player fields an admin can edit. All optional: only the ones sent are changed. */
export const playerFields = {
	name: v.optional(v.string()),
	cover_url: v.optional(v.string()),
	/** null clears it (JSON drops undefined, so null is how "remove" reaches Convex). */
	hue: v.optional(v.union(v.number(), v.null())),
	description: v.optional(v.string()),
	previous_usernames: v.optional(v.array(v.string())),
	links: v.optional(v.array(playerLink)),
	tags: v.optional(v.array(v.string()))
};

export const skinFields = {
	name: v.string(),
	author: v.optional(v.string()),
	download_url: v.string(),
	preview_images: v.array(v.string()),
	tags: v.optional(v.array(v.string()))
};
