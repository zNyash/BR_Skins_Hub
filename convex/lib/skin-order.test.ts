import { describe, expect, it } from "vitest";
import { sortPlayerSkins } from "./skin-order";

const entry = (id: string, created: number, position?: number) => ({
	id,
	position,
	skin: { _creationTime: created }
});
const ids = (list: { id: string }[]) => list.map((x) => x.id);

describe("sortPlayerSkins", () => {
	it("sorts positioned entries by position", () => {
		const sorted = sortPlayerSkins([entry("a", 1, 2), entry("b", 2, 0), entry("c", 3, 1)]);
		expect(ids(sorted)).toEqual(["b", "c", "a"]);
	});

	it("sorts unpositioned entries newest first", () => {
		const sorted = sortPlayerSkins([entry("a", 1), entry("b", 3), entry("c", 2)]);
		expect(ids(sorted)).toEqual(["b", "c", "a"]);
	});

	it("mixes positioned and unpositioned", () => {
		const sorted = sortPlayerSkins([
			entry("old", 1),
			entry("new", 9),
			entry("p1", 5, -1),
			entry("p0", 2, 0)
		]);
		expect(ids(sorted)).toEqual(["p1", "p0", "new", "old"]);
	});

	it("does not mutate the input", () => {
		const input = [entry("a", 1), entry("b", 2)];
		sortPlayerSkins(input);
		expect(ids(input)).toEqual(["a", "b"]);
	});
});
