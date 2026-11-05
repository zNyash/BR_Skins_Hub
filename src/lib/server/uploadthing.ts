import { createUploadthing, UploadThingError, UTApi, type FileRouter } from "uploadthing/server";
import { getSessionUser, isAdmin } from "./auth";

// --- Upload route ---

const f = createUploadthing();

export const ourFileRouter = {
	imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
		.middleware(async ({ req }) => {
			const user = await getSessionUser(req);
			if (!user || !isAdmin(user.osu_id)) throw new UploadThingError("Only admins can do this");
			return {};
		})
		.onUploadComplete(({ file }) => ({ url: file.ufsUrl }))
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// --- File cleanup ---

// Current files live on "<app-id>.ufs.sh"; older ones on utfs.io or "*.ufs.uploadthing.com".
const UPLOADTHING_HOSTS = ["ufs.sh", "utfs.io", "ufs.uploadthing.com"];

/** Returns the UploadThing file key of an image url, or null if it isn't hosted on UploadThing. */
export function getUploadThingKey(url: string): string | null {
	if (!URL.canParse(url)) return null;
	const { hostname, pathname } = new URL(url);

	const isUploadThing = UPLOADTHING_HOSTS.some(
		(host) => hostname === host || hostname.endsWith(`.${host}`)
	);
	if (!isUploadThing) return null;

	// Urls look like /f/<key>, so the key is the last path segment.
	return pathname.split("/").filter(Boolean).at(-1) ?? null;
}

const utapi = new UTApi();

/**
 * Deletes the UploadThing-hosted images among `urls`; external urls (Drive, s-ul, ...) are skipped.
 * Called after the database write succeeds, and a failure here never fails the request:
 * a leftover file only wastes storage, while a missing file would break the skin.
 */
export async function deleteUploadThingImages(urls: string[]) {
	const keys = urls.map(getUploadThingKey).filter((key) => key !== null);
	if (keys.length === 0) return;

	try {
		const { deletedCount } = await utapi.deleteFiles(keys);
		if (deletedCount < keys.length) {
			console.warn(`[uploadthing] deleted ${deletedCount}/${keys.length} files`, keys);
		}
	} catch (e) {
		console.error("[uploadthing] failed to delete files", keys, e);
	}
}
