// Shrinks a .osk off the main thread: lossless PNG recompression, missing SD images, junk removal.
import { unzipSync, zipSync } from "fflate";
import optimisePng from "@jsquash/oxipng/optimise";
import decodePng from "@jsquash/png/decode";
import type { OskStatus } from "./drive-upload";
import { downscaleHalf, isJunk, missingSdFiles } from "./osk-optimize";

export type OptimizeMessage =
	| { type: "status"; status: OskStatus }
	| { type: "done"; bytes: Uint8Array; sdAdded: number }
	| { type: "error"; message: string };

const post = (message: OptimizeMessage, transfer: Transferable[] = []) =>
	self.postMessage(message, { transfer });

const status = (label: string, percent: number | null = null) =>
	post({ type: "status", status: { label, percent } });

/** "Compressing images (3/120)" with its percent. */
const counted = (label: string, done: number, total: number) =>
	status(`${label} (${done}/${total})`, Math.round((done / total) * 100));

/** Lossless recompression; keeps the original when oxipng can't beat it or can't read it. */
async function shrinkPng(bytes: Uint8Array): Promise<Uint8Array> {
	try {
		const out = new Uint8Array(await optimisePng(bytes.slice().buffer));
		return out.length < bytes.length ? out : bytes;
	} catch {
		return bytes;
	}
}

async function makeSd(hd: Uint8Array): Promise<Uint8Array | null> {
	try {
		const image = await decodePng(hd.slice().buffer);
		const small = downscaleHalf(image);
		return new Uint8Array(await optimisePng(new ImageData(small.data, small.width, small.height)));
	} catch {
		return null;
	}
}

self.onmessage = async (event: MessageEvent<File>) => {
	try {
		status("Unzipping .osk");
		const all = unzipSync(new Uint8Array(await event.data.arrayBuffer()));
		const files = new Map<string, Uint8Array>();
		for (const [path, bytes] of Object.entries(all)) {
			// Directory entries end with "/"; the file paths recreate the folders.
			if (!path.endsWith("/") && !isJunk(path)) files.set(path, bytes);
		}

		const pngs = [...files.keys()].filter((path) => /\.png$/i.test(path));
		const missing = missingSdFiles([...files.keys()]);

		// SDs first, from the untouched HD bytes.
		let sdAdded = 0;
		for (const [i, { hd, sd }] of missing.entries()) {
			counted("Making SD versions", i, missing.length);
			const bytes = await makeSd(files.get(hd)!);
			if (bytes) {
				files.set(sd, bytes);
				sdAdded++;
			}
		}
		for (const [i, path] of pngs.entries()) {
			counted("Compressing images", i, pngs.length);
			files.set(path, await shrinkPng(files.get(path)!));
		}

		status("Packaging skin");
		// Max deflate for everything: even PNGs often shrink further, and it's never much bigger.
		const zipped = zipSync(Object.fromEntries(files), { level: 9 });
		post({ type: "done", bytes: zipped, sdAdded }, [zipped.buffer]);
	} catch (e) {
		post({ type: "error", message: (e as Error).message });
	}
};
