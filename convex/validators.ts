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

/** The tabs of a player's profile page. */
export const profileTab = v.union(v.literal("skins"), v.literal("about"), v.literal("setup"));

/** Player fields an admin can edit. All optional: only the ones sent are changed. */
export const playerFields = {
	name: v.optional(v.string()),
	cover_url: v.optional(v.string()),
	/** null clears it (JSON drops undefined, so null is how "remove" reaches Convex). */
	hue: v.optional(v.union(v.number(), v.null())),
	description: v.optional(v.string()),
	bio: v.optional(v.string()),
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

/* ------------ */
/* Player setup */
/* ------------ */

// Lengths are in mm. Every field is optional: empty fields are dropped, and a card with
// nothing left is removed (see applySetupPatch).
export const keyboardCard = v.object({
	model: v.optional(v.string()),
	switch: v.optional(v.string()),
	actuation: v.optional(v.number()),
	rapid_trigger: v.optional(
		v.union(v.literal("enabled"), v.literal("disabled"), v.literal("unsupported"))
	),
	/** Only shown when rapid_trigger is "enabled", but kept so toggling RT doesn't lose it. */
	rt_press: v.optional(v.number()),
	/** Set = press and release are shown separately. */
	rt_release: v.optional(v.number())
});

export const tabletCard = v.object({
	model: v.optional(v.string()),
	area_w: v.optional(v.number()),
	area_h: v.optional(v.number()),
	center_x: v.optional(v.number()),
	center_y: v.optional(v.number()),
	full_w: v.optional(v.number()),
	full_h: v.optional(v.number())
});

export const mouseCard = v.object({
	model: v.optional(v.string()),
	dpi: v.optional(v.number()),
	polling_hz: v.optional(v.number())
});

export const monitorCard = v.object({
	model: v.optional(v.string()),
	refresh_hz: v.optional(v.number()),
	res_w: v.optional(v.number()),
	res_h: v.optional(v.number()),
	size_in: v.optional(v.number())
});

export const inGameCard = v.object({
	sensitivity: v.optional(v.number()),
	raw_input: v.optional(v.boolean()),
	cursor_size: v.optional(v.number()),
	frame_limiter: v.optional(v.string()),
	audio_offset_ms: v.optional(v.number())
});

export const pcCard = v.object({
	cpu: v.optional(v.string()),
	gpu: v.optional(v.string()),
	motherboard: v.optional(v.string()),
	ram: v.optional(v.string()),
	cooler: v.optional(v.string()),
	storage: v.optional(
		v.array(
			v.object({
				kind: v.union(v.literal("nvme"), v.literal("sata_ssd"), v.literal("hdd")),
				name: v.string()
			})
		)
	)
});

const mainInput = v.union(v.literal("tablet"), v.literal("mouse"));

export const setup = v.object({
	main_input: v.optional(mainInput),
	keyboard: v.optional(keyboardCard),
	tablet: v.optional(tabletCard),
	mouse: v.optional(mouseCard),
	monitor: v.optional(monitorCard),
	in_game: v.optional(inGameCard),
	pc: v.optional(pcCard)
});

/** A setup change: each card sent replaces the stored one; null removes it. */
export const setupPatchFields = {
	main_input: v.optional(v.union(mainInput, v.null())),
	keyboard: v.optional(v.union(keyboardCard, v.null())),
	tablet: v.optional(v.union(tabletCard, v.null())),
	mouse: v.optional(v.union(mouseCard, v.null())),
	monitor: v.optional(v.union(monitorCard, v.null())),
	in_game: v.optional(v.union(inGameCard, v.null())),
	pc: v.optional(v.union(pcCard, v.null()))
};
