import { describe, expect, it } from "vitest";
import type { Id } from "$convex/_generated/dataModel";
import { skinsChanged } from "./player-skins";

const s = (id: string, hidden = false) => ({ id: id as Id<"skins">, hidden });

describe("skinsChanged", () => {
	it("is false for identical lists", () => {
		expect(skinsChanged([s("a"), s("b")], [s("a"), s("b")])).toBe(false);
	});

	it("detects a reorder", () => {
		expect(skinsChanged([s("a"), s("b")], [s("b"), s("a")])).toBe(true);
	});

	it("detects a hidden change", () => {
		expect(skinsChanged([s("a")], [s("a", true)])).toBe(true);
	});

	it("detects an added skin", () => {
		expect(skinsChanged([s("a")], [s("a"), s("b")])).toBe(true);
	});
});
