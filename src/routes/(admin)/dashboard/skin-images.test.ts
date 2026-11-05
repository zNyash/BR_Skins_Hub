import { describe, expect, it } from "vitest";
import { resolveImageUrls, type ImageItem } from "./skin-images";

describe("resolveImageUrls", () => {
	const url = (u: string): ImageItem => ({ id: u, kind: "url", url: u });
	const file = (name: string): ImageItem => ({
		id: `blob:${name}`,
		kind: "file",
		file: new File([], name),
		preview: `blob:${name}`
	});

	it("keeps existing urls as they are", () => {
		expect(resolveImageUrls([url("a"), url("b")], [])).toEqual(["a", "b"]);
	});

	it("replaces files with uploaded urls in order, keeping positions", () => {
		const items = [file("new1"), url("old"), file("new2")];
		expect(resolveImageUrls(items, ["up1", "up2"])).toEqual(["up1", "old", "up2"]);
	});

	it("throws when the number of uploads does not match the number of files", () => {
		expect(() => resolveImageUrls([file("x"), file("y")], ["only-one"])).toThrow();
		expect(() => resolveImageUrls([url("a")], ["extra"])).toThrow();
	});
});
