import { describe, expect, it, vi } from "vitest";
import { createDrive, getDriveFileId, trashDriveFile } from "./drive";

const config = { clientId: "cid", clientSecret: "secret", refreshToken: "rt", folderId: "SKINS" };

type Call = { url: string; init: RequestInit };

/**
 * A fake Google: answers by url, records every request. `folders` is what the letter-folder
 * search returns.
 */
function fakeGoogle({
	folders = [] as { id: string }[],
	status = 200,
	/** Metadata for `GET files/<id>?fields=mimeType,parents`. */
	meta = {} as Record<string, { mimeType: string; parents: string[] }>
} = {}) {
	const calls: Call[] = [];
	const fetchFn = vi.fn(async (input: string | URL | Request, init: RequestInit = {}) => {
		const url = String(input);
		calls.push({ url, init });
		if (status !== 200) return new Response("nope", { status });
		if (url.startsWith("https://oauth2.googleapis.com/token")) {
			return Response.json({ access_token: "AT", expires_in: 3600 });
		}
		if (url.includes("/upload/drive/v3/files")) {
			return new Response(null, { headers: { Location: "https://upload.example/session" } });
		}
		if (url.includes("/permissions")) return Response.json({ id: "perm" });
		if (url.startsWith("https://www.googleapis.com/drive/v3/files?q=")) {
			return Response.json({ files: folders });
		}
		const metaId = /\/files\/([^/?]+)\?fields=mimeType/.exec(url)?.[1];
		if (metaId && (!init.method || init.method === "GET")) {
			return meta[metaId] ? Response.json(meta[metaId]) : new Response("", { status: 404 });
		}
		if (url.startsWith("https://www.googleapis.com/drive/v3/files")) {
			return Response.json({ id: init.method === "POST" ? "NEW" : "x" });
		}
		throw new Error(`unexpected request ${url}`);
	});
	const find = (part: string) => calls.filter((c) => c.url.includes(part));
	return { fetchFn: fetchFn as unknown as typeof fetch, calls, find };
}

const upload = { fileName: "Blue.osk", size: 123, skinName: "abyss", origin: "https://x.dev" };

describe("getDriveFileId", () => {
	it("reads uc / open / file/d links", () => {
		expect(getDriveFileId("https://drive.google.com/uc?export=download&id=abc")).toBe("abc");
		expect(getDriveFileId("https://drive.google.com/open?id=abc")).toBe("abc");
		expect(getDriveFileId("https://drive.google.com/file/d/abc/view?usp=sharing")).toBe("abc");
	});

	it("returns null for other hosts, look-alikes and junk", () => {
		expect(getDriveFileId("https://abc.ufs.sh/f/key")).toBeNull();
		expect(getDriveFileId("https://drive.google.com.evil.com/uc?id=abc")).toBeNull();
		expect(getDriveFileId("not a url")).toBeNull();
		expect(getDriveFileId("https://drive.google.com/drive/folders/xyz")).toBeNull();
	});
});

describe("createDrive", () => {
	it("refreshes the token once and reuses it", async () => {
		const google = fakeGoogle();
		const drive = createDrive(config, google.fetchFn);
		await drive.publish("f1");
		await drive.publish("f2");
		const tokens = google.find("oauth2.googleapis.com/token");
		expect(tokens).toHaveLength(1);
		expect(String(tokens[0].init.body)).toContain("refresh_token=rt");
		const perm = google.find("/permissions")[1];
		expect(new Headers(perm.init.headers).get("Authorization")).toBe("Bearer AT");
	});

	it("uploads into an existing letter folder", async () => {
		const google = fakeGoogle({ folders: [{ id: "A1" }] });
		const url = await createDrive(config, google.fetchFn).startUpload(upload);
		expect(url).toBe("https://upload.example/session");
		const session = google.find("/upload/drive/v3/files")[0];
		expect(JSON.parse(String(session.init.body))).toEqual({ name: "Blue.osk", parents: ["A1"] });
		const creates = google.calls.filter(
			(c) =>
				c.init.method === "POST" &&
				c.url.startsWith("https://www.googleapis.com/drive/v3/files?fields")
		);
		expect(creates).toHaveLength(0);
	});

	it("creates the letter folder when missing", async () => {
		const google = fakeGoogle({ folders: [] });
		await createDrive(config, google.fetchFn).startUpload(upload);
		const create = google.calls.find(
			(c) =>
				c.init.method === "POST" &&
				c.url.startsWith("https://www.googleapis.com/drive/v3/files?fields")
		);
		expect(JSON.parse(String(create?.init.body))).toEqual({
			name: "A",
			mimeType: "application/vnd.google-apps.folder",
			parents: ["SKINS"]
		});
		const session = google.find("/upload/drive/v3/files")[0];
		expect(JSON.parse(String(session.init.body)).parents).toEqual(["NEW"]);
	});

	it("escapes quotes in the folder query", async () => {
		const google = fakeGoogle({ folders: [{ id: "Q" }] });
		await createDrive(config, google.fetchFn).startUpload({ ...upload, skinName: "'quoted" });
		const q = new URL(google.find("files?q=")[0].url).searchParams.get("q");
		expect(q).toBe(
			"'SKINS' in parents and name = '\\'' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
		);
	});

	it("sends size and origin on the session request", async () => {
		const google = fakeGoogle({ folders: [{ id: "A1" }] });
		await createDrive(config, google.fetchFn).startUpload(upload);
		const headers = new Headers(google.find("/upload/drive/v3/files")[0].init.headers);
		expect(headers.get("X-Upload-Content-Length")).toBe("123");
		expect(headers.get("Origin")).toBe("https://x.dev");
	});

	it("publishes with anyone/reader and returns the uc link", async () => {
		const google = fakeGoogle();
		const link = await createDrive(config, google.fetchFn).publish("f1");
		expect(link).toBe("https://drive.google.com/uc?export=download&id=f1");
		const perm = google.find("/files/f1/permissions")[0];
		expect(JSON.parse(String(perm.init.body))).toEqual({ role: "reader", type: "anyone" });
	});

	const OSK = "application/octet-stream";
	const trashed = (google: ReturnType<typeof fakeGoogle>) =>
		google.calls.filter((c) => c.init.method === "PATCH");

	it("trashes a file in a letter folder inside skins", async () => {
		const google = fakeGoogle({
			meta: {
				f9: { mimeType: OSK, parents: ["A1"] },
				A1: { mimeType: "application/vnd.google-apps.folder", parents: ["SKINS"] }
			}
		});
		await createDrive(config, google.fetchFn).trash("https://drive.google.com/file/d/f9/view");
		const [patch] = trashed(google);
		expect(patch?.url).toBe("https://www.googleapis.com/drive/v3/files/f9");
		expect(JSON.parse(String(patch?.init.body))).toEqual({ trashed: true });
	});

	it("trashes a file directly inside skins", async () => {
		const google = fakeGoogle({ meta: { f9: { mimeType: OSK, parents: ["SKINS"] } } });
		await createDrive(config, google.fetchFn).trash("https://drive.google.com/uc?id=f9");
		expect(trashed(google)).toHaveLength(1);
	});

	it("never trashes folders", async () => {
		const google = fakeGoogle({
			meta: { A1: { mimeType: "application/vnd.google-apps.folder", parents: ["SKINS"] } }
		});
		await createDrive(config, google.fetchFn).trash("https://drive.google.com/open?id=A1");
		expect(trashed(google)).toHaveLength(0);
	});

	it("leaves files outside the skins folder alone", async () => {
		const google = fakeGoogle({
			meta: {
				f9: { mimeType: OSK, parents: ["OTHER"] },
				OTHER: { mimeType: "application/vnd.google-apps.folder", parents: ["root"] }
			}
		});
		await createDrive(config, google.fetchFn).trash("https://drive.google.com/uc?id=f9");
		expect(trashed(google)).toHaveLength(0);
	});

	it("keeps a file that a kept link still points to, in any link form", async () => {
		const google = fakeGoogle({ meta: { f9: { mimeType: OSK, parents: ["SKINS"] } } });
		await createDrive(config, google.fetchFn).trash("https://drive.google.com/file/d/f9/view", [
			"https://example.com/other.osk",
			"https://drive.google.com/uc?export=download&id=f9"
		]);
		expect(google.calls).toHaveLength(0);
	});

	it("throws on a failed Drive response", async () => {
		const google = fakeGoogle({ status: 403 });
		await expect(createDrive(config, google.fetchFn).publish("f1")).rejects.toThrow(
			/Google Drive: 403/
		);
	});
});

describe("trashDriveFile", () => {
	it("ignores non-Drive links without calling Google", async () => {
		const spy = vi.spyOn(globalThis, "fetch");
		await expect(trashDriveFile("https://abc.ufs.sh/f/key")).resolves.toBeUndefined();
		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});
});
