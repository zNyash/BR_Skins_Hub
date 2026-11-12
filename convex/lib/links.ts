/**
 * Turns a Google Drive share link (`/file/d/<id>/view…`, always a file) into its direct-download
 * form (`uc?export=download&id=<id>`), so clicking Download starts the download instead of opening
 * Drive's preview page. Everything else comes back unchanged: links that are already direct,
 * folders, `open?id=` links (which can be folders), other hosts and anything unparseable.
 */
export function directDriveLink(url: string): string {
	if (!URL.canParse(url)) return url;
	const { hostname, pathname } = new URL(url);
	if (hostname !== "drive.google.com") return url;

	const id = /^\/file\/d\/([^/]+)/.exec(pathname)?.[1];
	return id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
}
