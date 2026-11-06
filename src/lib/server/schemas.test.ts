import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { bio, playerSkins, tabOrder } from "./schemas";

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
