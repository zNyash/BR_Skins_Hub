import { error } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { letterFolder } from "$lib/osk";

/** Uploads skins to the admin's Google Drive with a refresh token from env vars. Plain REST, no SDK. */

export type DriveConfig = {
	clientId: string;
	clientSecret: string;
	refreshToken: string;
	/** The `skins` folder: each skin goes into a per-letter folder inside it. */
	folderId: string;
};

const FILES = "https://www.googleapis.com/drive/v3/files";
const FOLDER = "application/vnd.google-apps.folder";

/** The Drive file id in a drive.google.com link (`uc?id=`, `open?id=`, `/file/d/<id>/`), or null. */
export function getDriveFileId(url: string): string | null {
	if (!URL.canParse(url)) return null;
	const { hostname, pathname, searchParams } = new URL(url);
	if (hostname !== "drive.google.com") return null;
	return searchParams.get("id") ?? /^\/file\/d\/([^/]+)/.exec(pathname)?.[1] ?? null;
}

// Drive query strings are single-quoted: backslashes and quotes inside need escaping.
const quote = (value: string) => `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;

export function createDrive(config: DriveConfig, fetchFn: typeof fetch = fetch) {
	let token: { value: string; expiresAt: number } | null = null;

	async function accessToken() {
		if (token && Date.now() < token.expiresAt) return token.value;
		const response = await fetchFn("https://oauth2.googleapis.com/token", {
			method: "POST",
			body: new URLSearchParams({
				client_id: config.clientId,
				client_secret: config.clientSecret,
				refresh_token: config.refreshToken,
				grant_type: "refresh_token"
			})
		});
		const body = await ok(response).json();
		// Refresh a minute early, so a token never expires mid-request.
		token = { value: body.access_token, expiresAt: Date.now() + (body.expires_in - 60) * 1000 };
		return token.value;
	}

	function ok(response: Response) {
		if (!response.ok) throw new Error(`Google Drive: ${response.status} ${response.statusText}`);
		return response;
	}

	async function call(url: string, init: RequestInit & { json?: unknown } = {}) {
		const { json, ...rest } = init;
		const headers = new Headers(rest.headers);
		headers.set("Authorization", `Bearer ${await accessToken()}`);
		if (json !== undefined) headers.set("Content-Type", "application/json; charset=UTF-8");
		return ok(
			await fetchFn(url, {
				...rest,
				headers,
				...(json !== undefined && { body: JSON.stringify(json) })
			})
		);
	}

	/** The id of the letter folder inside `skins`, created when missing. The oldest wins if there are several. */
	async function folderFor(skinName: string) {
		const name = letterFolder(skinName);
		const q = `${quote(config.folderId)} in parents and name = ${quote(name)} and mimeType = '${FOLDER}' and trashed = false`;
		const search = new URLSearchParams({
			q,
			orderBy: "createdTime",
			fields: "files(id)",
			pageSize: "1"
		});
		const { files } = await (await call(`${FILES}?${search}`)).json();
		if (files[0]) return files[0].id as string;

		const created = await call(`${FILES}?fields=id`, {
			method: "POST",
			json: { name, mimeType: FOLDER, parents: [config.folderId] }
		});
		return (await created.json()).id as string;
	}

	async function meta(id: string): Promise<{ mimeType: string; parents: string[] }> {
		const response = await call(`${FILES}/${encodeURIComponent(id)}?fields=mimeType,parents`);
		const body = await response.json();
		return { mimeType: body.mimeType, parents: body.parents ?? [] };
	}

	return {
		/**
		 * Opens a resumable upload in the skin's letter folder and returns its session url. The
		 * browser PUTs the file there directly; `origin` is what lets it do that cross-origin.
		 */
		async startUpload(o: { fileName: string; size: number; skinName: string; origin: string }) {
			const parent = await folderFor(o.skinName);
			const response = await call(
				"https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
				{
					method: "POST",
					headers: {
						"X-Upload-Content-Length": String(o.size),
						"X-Upload-Content-Type": "application/octet-stream",
						Origin: o.origin
					},
					json: { name: o.fileName, parents: [parent] }
				}
			);
			const location = response.headers.get("Location");
			if (!location) throw new Error("Google Drive: no upload url in the response");
			return location;
		},

		/** Makes the file public (anyone with the link) and returns its direct download link. */
		async publish(fileId: string) {
			await call(`${FILES}/${encodeURIComponent(fileId)}/permissions`, {
				method: "POST",
				json: { role: "reader", type: "anyone" }
			});
			return `https://drive.google.com/uc?export=download&id=${fileId}`;
		},

		/**
		 * Moves the file a Drive link points to into the trash. With full Drive access this could
		 * reach anything, so it only trashes files (never folders) inside `skins` or one of its
		 * letter folders, and skips a file that a `keep` link (in any link form) still points to.
		 */
		async trash(url: string, keep: string[] = []) {
			const id = getDriveFileId(url);
			if (!id || keep.some((link) => getDriveFileId(link) === id)) return;

			const file = await meta(id);
			if (file.mimeType === FOLDER) return;
			const inSkins = async () => {
				if (file.parents.includes(config.folderId)) return true;
				// One level down: the letter folders.
				for (const parent of file.parents) {
					if ((await meta(parent)).parents.includes(config.folderId)) return true;
				}
				return false;
			};
			if (!(await inSkins())) return;

			await call(`${FILES}/${encodeURIComponent(id)}`, {
				method: "PATCH",
				json: { trashed: true }
			});
		}
	};
}

let drive: ReturnType<typeof createDrive> | null = null;

/** The Drive client from env vars. Fails with 500 when they aren't set. */
export function getDrive() {
	if (drive) return drive;
	const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_DRIVE_FOLDER_ID } =
		env;
	if (
		!GOOGLE_CLIENT_ID ||
		!GOOGLE_CLIENT_SECRET ||
		!GOOGLE_REFRESH_TOKEN ||
		!GOOGLE_DRIVE_FOLDER_ID
	) {
		error(500, "Google Drive isn't configured");
	}
	drive = createDrive({
		clientId: GOOGLE_CLIENT_ID,
		clientSecret: GOOGLE_CLIENT_SECRET,
		refreshToken: GOOGLE_REFRESH_TOKEN,
		folderId: GOOGLE_DRIVE_FOLDER_ID
	});
	return drive;
}

/**
 * Trashes the Drive file behind a skin's old link, unless a `keep` link still uses it. Cleanup must
 * never fail a save, so errors are only logged.
 */
export async function trashDriveFile(url: string, keep: string[] = []) {
	if (!getDriveFileId(url)) return;
	try {
		await getDrive().trash(url, keep);
	} catch (e) {
		console.error("[drive] failed to trash", url, e);
	}
}
