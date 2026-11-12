import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { letterFolder, parseSkinIni, readOsk } from "./osk";

const INI = "[General]\nName: Blue\nAuthor: Rafis\n";

function oskFile(entries: Record<string, string>, fileName = "My Skin.osk") {
	const zipped = zipSync(
		Object.fromEntries(Object.entries(entries).map(([path, text]) => [path, strToU8(text)]))
	);
	return new File([zipped], fileName);
}

describe("parseSkinIni", () => {
	it("reads Name and Author from [General]", () => {
		expect(parseSkinIni(INI)).toEqual({ name: "Blue", author: "Rafis" });
	});

	it("ignores key case, BOM, CRLF, comments and other sections", () => {
		const ini =
			"﻿// comment\r\n[General]\r\nname:  Blue  \r\nAUTHOR:Rafis\r\n[Colours]\r\nName: nope\r\n";
		expect(parseSkinIni(ini)).toEqual({ name: "Blue", author: "Rafis" });
	});

	it("returns nulls for missing or empty values", () => {
		expect(parseSkinIni("[General]\nName:\n")).toEqual({ name: null, author: null });
	});
});

describe("readOsk", () => {
	it("reads skin.ini at the root", async () => {
		const file = oskFile({ "skin.ini": INI, "cursor.png": "png" });
		expect(await readOsk(file)).toEqual({ name: "Blue", author: "Rafis" });
	});

	it("reads skin.ini one folder deep, any case", async () => {
		const file = oskFile({ "Blue/Skin.INI": INI });
		expect(await readOsk(file)).toEqual({ name: "Blue", author: "Rafis" });
	});

	it("falls back to the file name without .osk", async () => {
		const file = oskFile({ "cursor.png": "png" }, "My Skin.OSK");
		expect(await readOsk(file)).toEqual({ name: "My Skin", author: null });
	});

	it("falls back to the file name when skin.ini has no Name", async () => {
		const file = oskFile({ "skin.ini": "[General]\nAuthor: Rafis\n" });
		expect(await readOsk(file)).toEqual({ name: "My Skin", author: "Rafis" });
	});

	it("rejects files that aren't zips", async () => {
		await expect(readOsk(new File(["hello"], "x.osk"))).rejects.toThrow(
			"That file isn't a valid .osk"
		);
	});
});

describe("letterFolder", () => {
	it.each([
		["abyss", "A"],
		["Ábyss", "A"],
		["  zeta", "Z"],
		["- Rafis -", "-"],
		["7th", "7"],
		["'quoted", "'"],
		["", "#"],
		["   ", "#"]
	])("%j → %j", (name, letter) => {
		expect(letterFolder(name)).toBe(letter);
	});
});
