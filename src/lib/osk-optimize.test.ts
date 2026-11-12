import { describe, expect, it } from "vitest";
import { downscaleHalf, isJunk, missingSdFiles, sdPathFor } from "./osk-optimize";

describe("isJunk", () => {
	it("flags OS metadata", () => {
		expect(isJunk("__MACOSX/skin/._cursor.png")).toBe(true);
		expect(isJunk("skin/.DS_Store")).toBe(true);
		expect(isJunk("Thumbs.db")).toBe(true);
		expect(isJunk("desktop.ini")).toBe(true);
	});

	it("keeps skin files", () => {
		expect(isJunk("skin.ini")).toBe(false);
		expect(isJunk("skin/cursor@2x.png")).toBe(false);
		expect(isJunk("source.psd")).toBe(false);
	});
});

describe("sdPathFor", () => {
	it("drops @2x from HD pngs", () => {
		expect(sdPathFor("hitcircle@2x.png")).toBe("hitcircle.png");
		expect(sdPathFor("skin/score-0@2x.PNG")).toBe("skin/score-0.PNG");
	});

	it("ignores everything else", () => {
		expect(sdPathFor("hitcircle.png")).toBeNull();
		expect(sdPathFor("menu-background@2x.jpg")).toBeNull();
	});
});

describe("missingSdFiles", () => {
	it("lists HD pngs with no SD twin, matching case-insensitively", () => {
		expect(
			missingSdFiles([
				"cursor@2x.png",
				"Cursor.png",
				"hitcircle@2x.png",
				"followpoint-0@2x.png",
				"followpoint-1@2x.png",
				"followpoint-1.png",
				"approachcircle.png"
			])
		).toEqual([
			{ hd: "hitcircle@2x.png", sd: "hitcircle.png" },
			{ hd: "followpoint-0@2x.png", sd: "followpoint-0.png" }
		]);
	});
});

const rgba = (width: number, height: number, pixels: number[][]) => ({
	data: new Uint8ClampedArray(pixels.flat()),
	width,
	height
});

describe("downscaleHalf", () => {
	it("averages each 2x2 block", () => {
		const out = downscaleHalf(
			rgba(2, 2, [
				[0, 0, 0, 255],
				[100, 100, 100, 255],
				[200, 200, 200, 255],
				[100, 100, 100, 255]
			])
		);
		expect(out.width).toBe(1);
		expect(out.height).toBe(1);
		expect([...out.data]).toEqual([100, 100, 100, 255]);
	});

	it("doesn't let transparent pixels tint the color", () => {
		const out = downscaleHalf(
			rgba(2, 2, [
				[255, 0, 0, 255],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0]
			])
		);
		expect([...out.data]).toEqual([255, 0, 0, 64]);
	});

	it("rounds odd sizes up", () => {
		const out = downscaleHalf(
			rgba(3, 1, [
				[10, 10, 10, 255],
				[30, 30, 30, 255],
				[50, 50, 50, 255]
			])
		);
		expect(out.width).toBe(2);
		expect(out.height).toBe(1);
		expect([...out.data]).toEqual([20, 20, 20, 255, 50, 50, 50, 255]);
	});
});
