import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { playerSkins } from "./schemas";

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
