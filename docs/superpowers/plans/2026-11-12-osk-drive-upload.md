# .osk Upload to Google Drive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The admin drops a `.osk` in the dashboard; name and author are read from its `skin.ini`, and the file is uploaded to the admin's Google Drive (`skins/<letter>/`) with a public download link saved on the skin.

**Architecture:** `src/lib/osk.ts` parses the `.osk` in the browser (fflate). `src/lib/server/drive.ts` talks to the Drive REST API with plain `fetch` using a refresh token from env vars. Two admin API routes start a resumable upload session and publish the finished file; the browser PUTs the file straight to Google (`src/lib/drive-upload.ts`). The existing skin PATCH/DELETE routes trash replaced/deleted Drive files.

**Tech Stack:** SvelteKit (Svelte 5 runes), valibot, Convex, fflate (new), vitest, bun.

**Spec:** `docs/superpowers/specs/2026-11-12-osk-drive-upload-design.md`

## Global Constraints

- Admin only: every new API route starts with `requireAdmin(event)`.
- Google config is read from `$env/dynamic/private` (not static), so a missing var fails at request time with 500 "Google Drive isn't configured" instead of breaking the build.
- Env var names: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_DRIVE_FOLDER_ID`.
- OAuth scope: `https://www.googleapis.com/auth/drive`.
- Max `.osk` size: 300 MB (`300 * 1024 * 1024`), checked on the client and in the start route's schema.
- Public link format: `https://drive.google.com/uc?export=download&id=<fileId>`.
- Letter folder: trimmed name, NFD + strip combining marks, first character, letters uppercased; empty → `#`.
- No `googleapis` SDK. No schema change to the `skins` table.
- Drive cleanup (`trashDriveFile`) logs and never throws.
- Commits: `type(scope): summary`, **no Co-Authored-By trailer** (user preference).

## Review Focus

1. **Skin names with `'` or `\`** (e.g. `Rafis' Blue`) as letter folders: the Drive `q` string must escape them. Only the first char is a folder name, so `'` itself can be a folder. → test in Task 2.
2. **`skin.ini` not at the zip root** (packed as `My Skin/skin.ini`) or with a UTF-8 BOM / CRLF line endings → tests in Task 1.
3. **A `.osk` with no `skin.ini`** (or no `Name:`): name falls back to the file name without extension, never empty. → test in Task 1.
4. **Editor: a pending file with an empty/old download link** must be savable (the link comes from the upload), and Reset must drop the pending file. → tests in Task 6.
5. **Non-Drive download links** (old links on other hosts) on PATCH/DELETE must be left alone, and look-alike hosts (`drive.google.com.evil.com`) must not match. → test in Task 2.

---

### Task 1: Read name and author from a .osk

**Files:**

- Create: `src/lib/osk.ts`
- Test: `src/lib/osk.test.ts`
- Modify: `package.json` / `bun.lock` (`bun add fflate`)

**Interfaces:**

- Produces:
  - `parseSkinIni(text: string): { name: string | null; author: string | null }`
  - `readOsk(file: File): Promise<{ name: string; author: string | null }>`: throws `Error("That file isn't a valid .osk")` when not a zip
  - `letterFolder(skinName: string): string`
  - `MAX_OSK_BYTES = 300 * 1024 * 1024`

- [ ] **Step 1: `bun add fflate`**

- [ ] **Step 2: Write failing tests** (server project; build zips in the test with fflate's `zipSync` + `strToU8`, wrap in `new File([bytes], "My Skin.osk")`)

```ts
describe("parseSkinIni", () => {
	it("reads Name and Author from [General]", () => {
		expect(parseSkinIni("[General]\nName: Blue\nAuthor: Rafis\n")).toEqual({
			name: "Blue",
			author: "Rafis"
		});
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
		/* zip { "skin.ini": ... } → { name: "Blue", author: "Rafis" } */
	});
	it("reads skin.ini one folder deep, any case", async () => {
		/* "Blue/Skin.INI" */
	});
	it("falls back to the file name without .osk", async () => {
		/* no ini → { name: "My Skin", author: null } */
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
	])("%j → %j", (name, letter) => expect(letterFolder(name)).toBe(letter));
});
```

- [ ] **Step 3: Run** `bunx vitest run src/lib/osk.test.ts`: FAIL (module missing).

- [ ] **Step 4: Implement `src/lib/osk.ts`.** `readOsk`: `unzipSync(new Uint8Array(await file.arrayBuffer()), { filter: (f) => <name is skin.ini at depth ≤ 1, case-insensitive> })`, catch → the "isn't a valid .osk" error; decode with `new TextDecoder()`; name = ini name ?? file name minus `/\.osk$/i`. `letterFolder`: `name.trim().normalize("NFD").replace(/\p{M}/gu, "")`, first char (use `[...s][0]` for surrogate pairs), `toUpperCase()`, `"#"` when empty.

- [ ] **Step 5: Run** `bunx vitest run src/lib/osk.test.ts`: PASS.

- [ ] **Step 6: Commit** `feat(osk): read skin name and author from .osk files`

---

### Task 2: Drive server module

**Files:**

- Create: `src/lib/server/drive.ts`
- Test: `src/lib/server/drive.test.ts`

**Interfaces:**

- Consumes: `letterFolder` from `$lib/osk` (Task 1).
- Produces:
  - `type DriveConfig = { clientId: string; clientSecret: string; refreshToken: string; folderId: string }`
  - `createDrive(config: DriveConfig, fetchFn: typeof fetch = fetch)` returning
    `{ startUpload(o: { fileName: string; size: number; skinName: string; origin: string }): Promise<string>; publish(fileId: string): Promise<string>; trash(url: string): Promise<void> }`
  - `getDriveFileId(url: string): string | null`
  - `getDrive()`: builds a cached `createDrive` from `$env/dynamic/private`; throws `error(500, "Google Drive isn't configured")` if any var is missing.
  - `trashDriveFile(url: string): Promise<void>`: no-op when `getDriveFileId(url)` is null; otherwise `getDrive().trash(url)`; catches and `console.error("[drive] ...")`, never throws (also when Drive isn't configured).

Requests (all with `Authorization: Bearer <token>`):

- token: `POST https://oauth2.googleapis.com/token`, form body `client_id, client_secret, refresh_token, grant_type=refresh_token` → `{ access_token, expires_in }`; cache until `expires_in - 60` s.
- find folder: `GET https://www.googleapis.com/drive/v3/files?q=<q>&orderBy=createdTime&fields=files(id)&pageSize=1`, `q = "'<folderId>' in parents and name = '<escaped>' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"`, escaping `\` → `\\` then `'` → `\'`.
- create folder: `POST https://www.googleapis.com/drive/v3/files?fields=id`, JSON `{ name, mimeType: folder, parents: [folderId] }`.
- session: `POST https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable`, headers `Content-Type: application/json; charset=UTF-8`, `X-Upload-Content-Length: <size>`, `X-Upload-Content-Type: application/octet-stream`, `Origin: <origin>`, body `{ name: fileName, parents: [letterFolderId] }` → session url in the `Location` response header.
- publish: `POST https://www.googleapis.com/drive/v3/files/<id>/permissions`, JSON `{ role: "reader", type: "anyone" }`.
- trash: `PATCH https://www.googleapis.com/drive/v3/files/<id>`, JSON `{ trashed: true }`.
- Any non-ok response → throw `Error("Google Drive: <status> <text>")`.

- [ ] **Step 1: Write failing tests** with a fake `fetchFn` (`vi.fn`) that routes by URL and records calls.

```ts
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
	it("refreshes the token once and reuses it", /* two publish() calls → one token request */);
	it("uploads into an existing letter folder", /* find returns {files:[{id:"A1"}]} → session body parents ["A1"], no create call; returns Location */);
	it("creates the letter folder when missing", /* find returns {files:[]} → create with parents [folderId], name "A"; session parents [created id] */);
	it("escapes quotes in the folder query", /* skinName "'quoted" → q contains "name = '\\''" */);
	it("sends size and origin on the session request", /* X-Upload-Content-Length "123", Origin "https://x.dev" */);
	it("publishes with anyone/reader and returns the uc link", /* → "https://drive.google.com/uc?export=download&id=f1" */);
	it("throws on a failed Drive response", /* 403 → rejects /Google Drive: 403/ */);
});

describe("trashDriveFile", () => {
	it("ignores non-Drive links without calling fetch", ...);
});
```

- [ ] **Step 2: Run** `bunx vitest run src/lib/server/drive.test.ts`: FAIL.

- [ ] **Step 3: Implement `src/lib/server/drive.ts`** per the Interfaces block. `getDriveFileId`: host must be exactly `drive.google.com`; `id` search param, else `/file/d/<id>/` path segment.

- [ ] **Step 4: Run** the test file: PASS. Run `bun run check`: no new errors.

- [ ] **Step 5: Commit** `feat(drive): Google Drive client for skin uploads`

---

### Task 3: Upload API routes and Drive cleanup

**Files:**

- Create: `src/routes/api/skins/osk/start/+server.ts`, `src/routes/api/skins/osk/finish/+server.ts`
- Modify: `src/lib/server/schemas.ts` (add `oskSize`), `src/lib/server/schemas.test.ts`
- Modify: `convex/skins.ts:97-108` (`remove` returns `{ images: skin.preview_images, download_url: skin.download_url }`)
- Modify: `src/routes/api/skins/[id]/+server.ts` (PATCH + DELETE cleanup)
- Modify: `example.env` (the four Google vars, empty)

**Interfaces:**

- Consumes: `getDrive`, `trashDriveFile` (Task 2); `MAX_OSK_BYTES` (Task 1).
- Produces (HTTP):
  - `POST /api/skins/osk/start` body `{ file_name: trimmedString, size: oskSize, skin_name: v.string() }` → `200 { upload_url: string }`. Origin passed to Drive is `event.url.origin`.
  - `POST /api/skins/osk/finish` body `{ file_id: trimmedString }` → `200 { download_url: string }`.
  - `oskSize = v.pipe(v.number(), v.integer(), v.minValue(1, ...), v.maxValue(MAX_OSK_BYTES, "must be at most 300 MB"))`.

- [ ] **Step 1: Failing schema test** in `schemas.test.ts`: `oskSize` accepts `1` and `MAX_OSK_BYTES`, rejects `0`, `MAX_OSK_BYTES + 1` (message "must be at most 300 MB"), `1.5`.
- [ ] **Step 2: Run** `bunx vitest run src/lib/server/schemas.test.ts`: FAIL. Add `oskSize`. Run again: PASS.
- [ ] **Step 3: Write both routes** (`requireAdmin` → `parseBody` → `getDrive()` → `json(...)`).
- [ ] **Step 4: Cleanup.** `convex/skins.ts` `remove` returns `{ images, download_url }`; DELETE route uses `images` for `deleteUploadThingImages` and calls `trashDriveFile(download_url)`. PATCH: after the mutation, `if (before && before.download_url !== fields.download_url) await trashDriveFile(before.download_url)`.
- [ ] **Step 5: Add the four vars to `example.env`.**
- [ ] **Step 6: Verify** `bunx convex dev --once` (pushes the `remove` change), `bun run check`, `bun run test`: all pass.
- [ ] **Step 7: Commit** `feat(api): .osk upload routes and Drive cleanup`

---

### Task 4: Setup script

**Files:**

- Create: `scripts/drive-setup.ts`

**Interfaces:**

- Produces: `bun scripts/drive-setup.ts <client_id> <client_secret>` prints `GOOGLE_REFRESH_TOKEN=<token>`.

- [ ] **Step 1: Write the script.** `Bun.serve({ port: 0 })` on `127.0.0.1`; redirect URI `http://127.0.0.1:<port>`; print (and try `xdg-open`) `https://accounts.google.com/o/oauth2/v2/auth?client_id=…&redirect_uri=…&response_type=code&scope=https://www.googleapis.com/auth/drive&access_type=offline&prompt=consent`; on the callback, exchange `code` at `https://oauth2.googleapis.com/token` (`grant_type=authorization_code`), respond "Done, you can close this tab", print the refresh token (or the error), stop the server.
- [ ] **Step 2: Verify** `bun scripts/drive-setup.ts` with no args prints usage and exits 1.
- [ ] **Step 3: Commit** `chore(scripts): Google Drive setup script`

---

### Task 5: Client upload + dropzone + New skin dialog

**Files:**

- Create: `src/lib/drive-upload.ts`
- Create: `src/routes/(admin)/dashboard/osk-dropzone.svelte`
- Modify: `src/routes/(admin)/dashboard/dialogs/skin-creator-dialog.svelte`

**Interfaces:**

- Consumes: `request` (`$lib/api`), `readOsk`, `MAX_OSK_BYTES` (Task 1), routes (Task 3).
- Produces:
  - `uploadOsk(file: File, skinName: string, onProgress: (percent: number) => void): Promise<string>` (resolves the `download_url`). Steps: `request("/api/skins/osk/start", …)` → `XMLHttpRequest` `PUT upload_url` with `upload.onprogress` → parse `JSON.parse(xhr.responseText).id` on 200/201 → `request("/api/skins/osk/finish", { file_id })`. Network error / other status → `Error("Upload to Google Drive failed")`.
  - `<OskDropzone bind:file onpick={(file: File) => void} />`: `file: File | null` bindable; drop or click to pick (hidden `<input type="file" accept=".osk">`); rejects non-`.osk` names and files over `MAX_OSK_BYTES` with a toast; when set, shows the name, size in MB and a remove (x) button that sets `file = null`. Styling follows the design system (layer tokens, 4px grid, dashed border on `bg-layer-2`).

- [ ] **Step 1: Write `uploadOsk` and `OskDropzone`.**
- [ ] **Step 2: Dialog.** Dropzone above the fields. `onpick`: `readOsk(file)` → set `form.name` / `form.author` (toast on error and clear the file). With a file: hide the URL input, show "Uploads to Google Drive on create" caption; `urlValid` isn't required. Submit: `download_url = file ? await uploadOsk(file, form.name.trim(), (p) => (progress = p)) : form.download_url.trim()`; button label `Uploading… {progress}%` while uploading. Reset `file`/`progress` when the dialog opens.
- [ ] **Step 3: Verify** `bun run check` and `bun run lint`: clean.
- [ ] **Step 4: Commit** `feat(dashboard): create skins from a dropped .osk`

---

### Task 6: Replace a skin's file from the editor

**Files:**

- Modify: `src/routes/(admin)/dashboard/skins/[id]/skin-fields.ts`, `skin-fields.test.ts`
- Modify: `src/routes/(admin)/dashboard/skins/[id]/skin-draft.svelte.ts`
- Modify: `src/routes/(admin)/dashboard/skins/[id]/skin-form.svelte`

**Interfaces:**

- Consumes: `uploadOsk` + `OskDropzone` (Task 5), `readOsk` (Task 1).
- Produces: `SkinDraft` gains `osk: File | null` (`snapshotFromSkin` sets `null`).

- [ ] **Step 1: Failing tests** in `skin-fields.test.ts`:

```ts
it("a pending .osk makes the draft changed", () => {
	const base = snapshotFromSkin(skin);
	expect(draftChanged({ ...structuredClone(base), osk: new File(["x"], "a.osk") }, base)).toBe(
		true
	);
});
it("a pending .osk makes an invalid download link savable", () => {
	const d = { ...snapshotFromSkin(skin), osk: new File(["x"], "a.osk") };
	d.skin.download_url = "";
	expect(draftError(d)).toBeNull();
});
it("without a .osk an invalid link is still an error", () => {
	/* osk null, url "" → "Enter a valid download link." */
});
```

- [ ] **Step 2: Run** `bunx vitest run "src/routes/(admin)/dashboard/skins/[id]/skin-fields.test.ts"`: FAIL. Implement: `draftChanged` also compares `draft.osk !== base.osk` (reference); `draftError` skips the URL check when `draft.osk`. Note `structuredClone(base)` in the draft store must still work: `osk` is `null` in `base`, and `reset()` clones `base`, so Reset drops the pending file. Run: PASS.
- [ ] **Step 3: Save.** In `save()`, before the PATCH: if `draft.osk`, `const id = toast.loading("Uploading .osk… 0%")`, `draft.skin.download_url = await uploadOsk(draft.osk, draft.skin.name.trim(), (p) => toast.loading(\`Uploading .osk… ${p}%\`, { id }))`, then `draft.osk = null`and`toast.dismiss(id)` (also dismiss in the catch). Progress shows as an updating toast, not in the unsaved bar, so the bar stays unchanged.
- [ ] **Step 4: Form.** `OskDropzone bind:file={draft.osk}` under the Download link field; `onpick` fills name/author only if empty. While `draft.osk` is set, show "Replaced on save" under the link input and don't mark it invalid.
- [ ] **Step 5: Verify** `bun run check`, `bun run lint`, `bun run test`: all pass.
- [ ] **Step 6: Commit** `feat(dashboard): replace a skin's .osk from the editor`

---

### Task 7: End-to-end check (needs the user's Google setup)

- [ ] **Step 1:** The user does the spec's "Setup (once)" steps and fills `.env`.
- [ ] **Step 2:** In the user's dev server: create a skin by dropping a real `.osk` (> 10 MB). Expect name/author filled, progress toast/button, the file in `skins/<letter>/` on Drive, and the saved link downloading in a logged-out browser.
- [ ] **Step 3:** Replace that skin's file from the editor → old file in Drive trash. Delete the skin → its file in Drive trash.
