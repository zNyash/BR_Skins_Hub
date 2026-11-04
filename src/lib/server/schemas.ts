import * as v from "valibot";
import { normalizeTags } from "$lib/tags";

/** Building blocks for request body schemas. Messages read as "<field> <message>". */

export const trimmedString = v.pipe(v.string(), v.trim(), v.minLength(1, "is required"));

export const httpUrl = v.pipe(v.string(), v.trim(), v.url("must be a valid URL"));

export const osuId = v.pipe(
	v.number("must be a valid osu! ID"),
	v.integer("must be a valid osu! ID"),
	v.minValue(1, "must be a valid osu! ID")
);

export const convexId = v.pipe(v.string(), v.minLength(1, "is required"));

/** null clears the color. */
export const hue = v.nullish(
	v.pipe(
		v.number("must be between 0 and 360"),
		v.integer("must be between 0 and 360"),
		v.minValue(0, "must be between 0 and 360"),
		v.maxValue(360, "must be between 0 and 360")
	)
);

/** Links with an empty value are dropped. */
export const links = v.pipe(
	v.array(
		v.object({
			type: v.picklist(["twitch", "twitter", "youtube", "github", "discord", "custom"]),
			value: v.pipe(v.string(), v.trim())
		})
	),
	v.transform((list) => list.filter((link) => link.value !== ""))
);

export const tags = v.pipe(v.array(v.string()), v.transform(normalizeTags));
