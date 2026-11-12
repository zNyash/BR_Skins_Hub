// Pure helpers for shrinking a .osk before upload. The heavy lifting (PNG codecs) runs in
// osk-optimize.worker.ts; everything here is plain logic so it can be tested in node.

const JUNK_FILES = new Set([".ds_store", "thumbs.db", "desktop.ini"]);

/** OS leftovers that osu! never reads: macOS resource forks, Finder and Explorer metadata. */
export function isJunk(path: string): boolean {
	const parts = path.split("/");
	if (parts.some((part) => part === "__MACOSX")) return true;
	return JUNK_FILES.has(parts.at(-1)!.toLowerCase());
}

/** `dir/name@2x.png` → `dir/name.png`; null for anything that isn't an HD png. */
export function sdPathFor(path: string): string | null {
	const match = /^(.*)@2x(\.png)$/i.exec(path);
	return match ? match[1] + match[2] : null;
}

/**
 * For each HD png without an SD twin, the pair to generate. osu! matches file names
 * case-insensitively, so `Cursor.png` counts as the SD of `cursor@2x.png`.
 */
export function missingSdFiles(paths: string[]): { hd: string; sd: string }[] {
	const existing = new Set(paths.map((path) => path.toLowerCase()));
	return paths.flatMap((hd) => {
		const sd = sdPathFor(hd);
		return sd && !existing.has(sd.toLowerCase()) ? [{ hd, sd }] : [];
	});
}

type Rgba = { data: Uint8ClampedArray<ArrayBuffer>; width: number; height: number };

/**
 * Halves an RGBA image by averaging each 2×2 block. Colors are weighted by alpha, so the
 * (invisible) color of transparent pixels doesn't bleed into the edges of the sprite.
 * Odd sizes round up; the last row/column then averages fewer pixels.
 */
export function downscaleHalf({ data, width, height }: Rgba): Rgba {
	const outW = Math.ceil(width / 2);
	const outH = Math.ceil(height / 2);
	const out = new Uint8ClampedArray(outW * outH * 4);

	for (let oy = 0; oy < outH; oy++) {
		for (let ox = 0; ox < outW; ox++) {
			let [r, g, b, a, count] = [0, 0, 0, 0, 0];
			for (let y = oy * 2; y < Math.min(oy * 2 + 2, height); y++) {
				for (let x = ox * 2; x < Math.min(ox * 2 + 2, width); x++) {
					const i = (y * width + x) * 4;
					const alpha = data[i + 3];
					r += data[i] * alpha;
					g += data[i + 1] * alpha;
					b += data[i + 2] * alpha;
					a += alpha;
					count++;
				}
			}
			const o = (oy * outW + ox) * 4;
			if (a > 0) {
				out[o] = Math.round(r / a);
				out[o + 1] = Math.round(g / a);
				out[o + 2] = Math.round(b / a);
			}
			out[o + 3] = Math.round(a / count);
		}
	}

	return { data: out, width: outW, height: outH };
}
