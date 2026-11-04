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
