import * as v from "valibot";
import { MAX_OSK_BYTES } from "$lib/osk";
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

/** A player's skins in display order, each with its hidden flag. The same skin twice would make the order ambiguous. */
export const playerSkins = v.pipe(
	v.array(v.object({ id: convexId, hidden: v.boolean() })),
	v.check(
		(list) => new Set(list.map((s) => s.id)).size === list.length,
		"must not contain the same skin twice"
	)
);

/** The short plain-text bio shown in the profile sidebar. */
export const bio = v.pipe(v.string(), v.trim(), v.maxLength(200, "must be at most 200 characters"));

const PROFILE_TABS = ["skins", "about", "setup"] as const;

/** The owner's profile tab order: every tab exactly once. */
export const tabOrder = v.pipe(
	v.array(v.picklist(PROFILE_TABS, "must list each tab exactly once")),
	v.check(
		(tabs) => tabs.length === PROFILE_TABS.length && new Set(tabs).size === PROFILE_TABS.length,
		"must list each tab exactly once"
	)
);

/* ------------ */
/* Player setup */
/* ------------ */

// Empty inputs arrive as "" or null and become undefined, so they're dropped instead of stored.

const setupText = v.pipe(
	v.nullish(v.pipe(v.string(), v.trim(), v.maxLength(100, "must be at most 100 characters"))),
	v.transform((text) => text || undefined)
);

function setupNumber(min: number, max: number, integer = false) {
	const range = `must be between ${min} and ${max}`;
	return v.pipe(
		v.nullish(
			v.pipe(
				v.number(range),
				integer ? v.integer("must be a whole number") : v.finite(range),
				v.minValue(min, range),
				v.maxValue(max, range)
			)
		),
		v.transform((n) => n ?? undefined)
	);
}

const mm = setupNumber(0.01, 4);
const tabletMm = setupNumber(0.01, 500);

/** A Setup tab change: each card sent replaces the stored one, null removes it. */
export const setupPatch = v.strictObject({
	main_input: v.nullish(v.picklist(["tablet", "mouse"])),
	keyboard: v.nullish(
		v.object({
			model: setupText,
			switch: setupText,
			actuation: mm,
			rapid_trigger: v.pipe(
				v.nullish(v.picklist(["enabled", "disabled", "unsupported"])),
				v.transform((rt) => rt ?? undefined)
			),
			rt_press: mm,
			rt_release: mm
		})
	),
	tablet: v.nullish(
		v.object({
			model: setupText,
			area_w: tabletMm,
			area_h: tabletMm,
			center_x: setupNumber(0, 500),
			center_y: setupNumber(0, 500),
			full_w: tabletMm,
			full_h: tabletMm,
			rotation: setupNumber(-360, 360),
			filters: v.optional(
				v.pipe(
					v.array(
						v.object({
							path: v.pipe(
								v.string(),
								v.trim(),
								v.minLength(1, "is required"),
								v.maxLength(200, "must be at most 200 characters")
							),
							settings: v.pipe(
								v.array(
									v.object({
										property: v.pipe(
											v.string(),
											v.maxLength(200, "must be at most 200 characters")
										),
										value: v.pipe(v.string(), v.maxLength(200, "must be at most 200 characters"))
									})
								),
								v.maxLength(50, "must have at most 50 settings")
							)
						})
					),
					v.maxLength(20, "must have at most 20 filters")
				)
			)
		})
	),
	mouse: v.nullish(
		v.object({
			model: setupText,
			dpi: setupNumber(1, 100000, true),
			polling_hz: setupNumber(1, 10000, true)
		})
	),
	monitor: v.nullish(
		v.object({
			model: setupText,
			refresh_hz: setupNumber(1, 1000),
			res_w: setupNumber(1, 10000, true),
			res_h: setupNumber(1, 10000, true),
			size_in: setupNumber(1, 100)
		})
	),
	in_game: v.nullish(
		v.object({
			sensitivity: setupNumber(0.01, 10),
			raw_input: v.pipe(
				v.nullish(v.boolean()),
				v.transform((on) => on ?? undefined)
			),
			cursor_size: setupNumber(0.01, 10),
			frame_limiter: setupText,
			audio_offset_ms: setupNumber(-1000, 1000, true)
		})
	),
	pc: v.nullish(
		v.object({
			cpu: setupText,
			gpu: setupText,
			motherboard: setupText,
			ram: setupText,
			cooler: setupText,
			storage: v.pipe(
				v.nullish(
					v.pipe(
						v.array(
							v.object({
								kind: v.picklist(["nvme", "sata_ssd", "hdd"], "must be NVMe SSD, SATA SSD or HDD"),
								name: setupText
							})
						),
						v.maxLength(8, "must have at most 8 drives")
					)
				),
				// Rows without a name are dropped rather than rejected, like blank links.
				v.transform((rows) =>
					rows?.flatMap((row) => (row.name ? [{ kind: row.kind, name: row.name }] : []))
				)
			)
		})
	)
});

/** Size in bytes of a .osk about to be uploaded to Google Drive. */
export const oskSize = v.pipe(
	v.number("must be a size in bytes"),
	v.integer("must be a size in bytes"),
	v.minValue(1, "must not be empty"),
	v.maxValue(MAX_OSK_BYTES, "must be at most 300 MB")
);

export const deviceType = v.picklist(
	["tablet", "keyboard", "mouse", "monitor"],
	"must be tablet, keyboard, mouse or monitor"
);

/** A device size in mm (a tablet's full area). Missing = unset. */
export const positiveMm = v.optional(
	v.pipe(
		v.number("must be a number"),
		v.check((n) => n > 0, "must be a positive number")
	)
);
