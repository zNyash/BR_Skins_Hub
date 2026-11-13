import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { MAX_OSK_BYTES } from "$lib/osk";
import {
	bio,
	deviceType,
	hue,
	oskSize,
	playerSkins,
	positiveMm,
	setupPatch,
	tabOrder
} from "./schemas";

describe("playerSkins", () => {
	it("accepts ordered skins with hidden flags", () => {
		const body = [
			{ id: "a", hidden: true },
			{ id: "b", hidden: false }
		];
		expect(v.safeParse(playerSkins, body).success).toBe(true);
	});

	it("rejects duplicate skin ids", () => {
		const body = [
			{ id: "a", hidden: false },
			{ id: "a", hidden: true }
		];
		expect(v.safeParse(playerSkins, body).success).toBe(false);
	});

	it("rejects bare ids", () => {
		expect(v.safeParse(playerSkins, ["a"]).success).toBe(false);
	});
});

describe("bio", () => {
	it("trims and accepts up to 200 characters", () => {
		expect(v.parse(bio, "  hi  ")).toBe("hi");
		expect(v.safeParse(bio, "a".repeat(200)).success).toBe(true);
	});

	it("rejects 201 characters", () => {
		const result = v.safeParse(bio, "a".repeat(201));
		expect(result.success).toBe(false);
		expect(result.issues?.[0].message).toBe("must be at most 200 characters");
	});
});

describe("tabOrder", () => {
	it("accepts a permutation", () => {
		expect(v.safeParse(tabOrder, ["about", "setup", "skins"]).success).toBe(true);
	});

	it.each([
		[["skins", "skins", "about"]],
		[["skins", "about"]],
		[["skins", "about", "setup", "skins"]],
		[["skins", "about", "nope"]]
	])("rejects %j", (value) => {
		expect(v.safeParse(tabOrder, value).success).toBe(false);
	});

	it("uses the spec's message for a duplicate", () => {
		const result = v.safeParse(tabOrder, ["skins", "skins", "about"]);
		expect(result.issues?.[0].message).toBe("must list each tab exactly once");
	});
});

describe("hue", () => {
	it.each([0, 360, null])("accepts %j", (value) => {
		expect(v.safeParse(hue, value).success).toBe(true);
	});

	it.each([361, 1.5])("rejects %j", (value) => {
		expect(v.safeParse(hue, value).success).toBe(false);
	});
});

describe("setupPatch", () => {
	const parse = (body: unknown) => v.safeParse(setupPatch, body);

	it("trims text and drops empty strings", () => {
		const result = parse({ mouse: { model: "  G Pro  ", dpi: 800 }, pc: { cpu: "  " } });
		expect(result.output).toEqual({ mouse: { model: "G Pro", dpi: 800 }, pc: {} });
	});

	it("drops null numbers instead of storing zero", () => {
		expect(parse({ mouse: { dpi: null, polling_hz: 1000 } }).output).toEqual({
			mouse: { polling_hz: 1000 }
		});
	});

	it("keeps a null card so it can be removed", () => {
		expect(parse({ tablet: null }).output).toEqual({ tablet: null });
	});

	it("accepts tablet, mouse and null as main_input", () => {
		for (const main_input of ["tablet", "mouse", null]) {
			expect(parse({ main_input }).success).toBe(true);
		}
		expect(parse({ main_input: "keyboard" }).success).toBe(false);
	});

	it("rejects out-of-range values", () => {
		for (const body of [
			{ keyboard: { actuation: 0 } },
			{ keyboard: { actuation: 4.5 } },
			{ mouse: { dpi: 1.5 } },
			{ in_game: { audio_offset_ms: 1001 } }
		]) {
			const result = parse(body);
			expect(result.success).toBe(false);
			expect(result.issues?.[0].message).toContain("must be");
		}
	});

	it("accepts a negative audio offset", () => {
		expect(parse({ in_game: { audio_offset_ms: -12 } }).success).toBe(true);
	});

	it("drops storage rows with an empty name", () => {
		const storage = [
			{ kind: "nvme", name: " " },
			{ kind: "hdd", name: "WD Blue" }
		];
		expect(parse({ pc: { storage } }).output).toEqual({
			pc: { storage: [{ kind: "hdd", name: "WD Blue" }] }
		});
	});

	it("rejects 9 storage rows and unknown storage kinds", () => {
		const rows = Array.from({ length: 9 }, () => ({ kind: "hdd", name: "x" }));
		expect(parse({ pc: { storage: rows } }).success).toBe(false);
		expect(parse({ pc: { storage: [{ kind: "m2", name: "x" }] } }).success).toBe(false);
	});

	it("rejects unknown cards", () => {
		expect(parse({ speakers: {} }).success).toBe(false);
	});

	it("rejects text over 100 characters", () => {
		expect(parse({ keyboard: { model: "a".repeat(101) } }).success).toBe(false);
	});
});

describe("setupPatch tablet filters", () => {
	const parse = (tablet: unknown) => v.safeParse(setupPatch, { tablet });
	const filter = {
		path: "VoiDPlugins.Filter.RadialFollowSmoothing",
		settings: [{ property: "OuterRadius", value: "1.5" }]
	};

	it("accepts rotation and filters", () => {
		expect(parse({ rotation: 90, filters: [filter] }).output).toEqual({
			tablet: { rotation: 90, filters: [filter] }
		});
	});

	it("rejects a rotation outside -360 to 360", () => {
		expect(parse({ rotation: 400 }).success).toBe(false);
	});

	it("rejects more than 20 filters", () => {
		expect(parse({ filters: Array.from({ length: 21 }, () => filter) }).success).toBe(false);
	});

	it("rejects more than 50 settings on a filter", () => {
		const settings = Array.from({ length: 51 }, (_, i) => ({ property: `P${i}`, value: "1" }));
		expect(parse({ filters: [{ ...filter, settings }] }).success).toBe(false);
	});
});

describe("oskSize", () => {
	it("accepts 1 byte up to 300 MB", () => {
		expect(v.safeParse(oskSize, 1).success).toBe(true);
		expect(v.safeParse(oskSize, MAX_OSK_BYTES).success).toBe(true);
	});

	it("rejects empty, fractional and too-big sizes", () => {
		expect(v.safeParse(oskSize, 0).success).toBe(false);
		expect(v.safeParse(oskSize, 1.5).success).toBe(false);
		const tooBig = v.safeParse(oskSize, MAX_OSK_BYTES + 1);
		expect(tooBig.success).toBe(false);
		expect(tooBig.issues?.[0].message).toBe("must be at most 300 MB");
	});
});

describe("deviceType", () => {
	it("accepts the four types and names them on anything else", () => {
		expect(v.safeParse(deviceType, "mouse").success).toBe(true);
		const result = v.safeParse(deviceType, "pen");
		expect(result.success).toBe(false);
		expect(result.issues?.[0].message).toBe("must be tablet, keyboard, mouse or monitor");
	});
});

describe("positiveMm", () => {
	it("accepts missing and positive sizes", () => {
		expect(v.safeParse(positiveMm, undefined).success).toBe(true);
		expect(v.safeParse(positiveMm, 152).success).toBe(true);
	});

	it("rejects zero and negative sizes", () => {
		for (const n of [0, -1]) {
			const result = v.safeParse(positiveMm, n);
			expect(result.success).toBe(false);
			expect(result.issues?.[0].message).toBe("must be a positive number");
		}
	});
});
