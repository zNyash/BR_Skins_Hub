import { describe, expect, it } from "vitest";
import type { PlayerSkin } from "$lib/types";
import { PLAYER_SKIN_LIST } from "./list-query.svelte";

describe("PLAYER_SKIN_LIST", () => {
	const custom = PLAYER_SKIN_LIST.sortOptions.find((o) => o.value === "custom")!;
	const skin = (order: number) => ({ order }) as PlayerSkin;

	it("defaults to custom ascending", () => {
		expect([PLAYER_SKIN_LIST.defaultSort, PLAYER_SKIN_LIST.defaultOrder]).toEqual([
			"custom",
			"asc"
		]);
	});

	it("compares by server order", () => {
		const sorted = [skin(2), skin(0), skin(1)].sort(custom.compare);
		expect(sorted.map((s) => s.order)).toEqual([0, 1, 2]);
	});
});
