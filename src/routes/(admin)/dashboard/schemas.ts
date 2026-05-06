import * as v from "valibot";

export const skinSchema = v.object({
	name: v.pipe(v.string(), v.minLength(3, "Skin name is required")),
	author: v.optional(v.string()),
	download_url: v.pipe(v.string(), v.url("Enter a valid URL for the skin download")),
	preview_images: v.array(v.pipe(v.string(), v.url("Some preview images are invalid")))
});

export const playerSchema = v.object({
	name: v.pipe(v.string(), v.minLength(3, "Name is required")),
	osu_id: v.pipe(v.number(), v.integer(), v.minValue(1)),
	cover_url: v.optional(v.pipe(v.string(), v.url())),
	hue: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(360))),
	description: v.optional(v.string()),
	previous_usernames: v.optional(v.array(v.string())),
	links: v.optional(
		v.array(
			v.object({
				type: v.picklist(["twitch", "twitter", "youtube", "github", "discord", "custom"]),
				value: v.pipe(v.string(), v.minLength(1))
			})
		)
	)
});
