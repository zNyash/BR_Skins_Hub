import { unzipSync } from "fflate";

/** Largest .osk the dashboard accepts (300 MB). */
export const MAX_OSK_BYTES = 300 * 1024 * 1024;

type SkinInfo = { name: string | null; author: string | null };

/** Reads `Name` and `Author` from the `[General]` section of an osu! skin.ini. */
export function parseSkinIni(text: string): SkinInfo {
	const info: SkinInfo = { name: null, author: null };
	let section = "";

	for (const raw of text.replace(/^﻿/, "").split(/\r?\n/)) {
		const line = raw.trim();
		if (line === "" || line.startsWith("//")) continue;

		const header = /^\[(.+)\]$/.exec(line);
		if (header) {
			section = header[1].trim().toLowerCase();
			continue;
		}
		if (section !== "general") continue;

		const colon = line.indexOf(":");
		if (colon === -1) continue;
		const key = line.slice(0, colon).trim().toLowerCase();
		const value = line.slice(colon + 1).trim() || null;
		if (key === "name") info.name = value;
		if (key === "author") info.author = value;
	}

	return info;
}

// skin.ini sits at the root, or one folder deep when the skin folder itself was zipped.
function isSkinIni(path: string) {
	const parts = path.split("/");
	return parts.length <= 2 && parts.at(-1)!.toLowerCase() === "skin.ini";
}

/**
 * Name and author of a .osk (a zip). Only skin.ini is inflated, so big skins stay fast.
 * Without a name in skin.ini, the file name is used.
 */
export async function readOsk(file: File): Promise<{ name: string; author: string | null }> {
	let entries: Record<string, Uint8Array>;
	try {
		entries = unzipSync(new Uint8Array(await file.arrayBuffer()), {
			filter: (entry) => isSkinIni(entry.name)
		});
	} catch {
		throw new Error("That file isn't a valid .osk");
	}

	// Prefer the root skin.ini when there are several.
	const path = Object.keys(entries).sort((a, b) => a.length - b.length)[0];
	const info = path ? parseSkinIni(new TextDecoder().decode(entries[path])) : null;

	return {
		name: info?.name ?? file.name.replace(/\.osk$/i, ""),
		author: info?.author ?? null
	};
}

/** The Drive folder a skin goes in: its first character, accents dropped, letters uppercased. */
export function letterFolder(skinName: string): string {
	const plain = skinName.trim().normalize("NFD").replace(/\p{M}/gu, "");
	const first = [...plain][0];
	return first ? first.toUpperCase() : "#";
}
