# .osk upload to Google Drive

Date: 2026-11-12. Status: approved in chat, awaiting spec review.

## Goal

Adding a skin today means uploading the `.osk` to Google Drive by hand, making the link public,
copying it, and typing the name and author. Instead, the admin drops the `.osk` on the dashboard:
name and author are read from the file, and the file goes to the admin's Google Drive, into a
per-letter folder, with a public download link saved on the skin.

Admin only. Rendering gameplay screenshots from the `.osk` is out of scope (too much work).
Pulling preview images out of the `.osk` is a possible follow-up, not part of this.

## Decisions

- **Token in env vars, no "Connect Drive" UI.** A one-time local script gets a refresh token; it
  lives in Vercel env vars. One admin, so a dashboard connect flow isn't worth it.
- **Full `drive` scope**, not `drive.file`. `drive.file` only sees folders the app created, and the
  files must go into the admin's existing `skins` folder. The app stays unverified: during setup
  Google shows "Google hasn't verified this app" → Advanced → Go to app. Fine for a single user.
  The OAuth consent screen must be **In production** (Testing mode expires refresh tokens after
  7 days).
- **The browser uploads straight to Google** (resumable upload session started by the server).
  Vercel caps request bodies at 4.5 MB and skins are often 20–100 MB, so the file can't pass
  through our server.
- **Upload happens on Create / Save**, not on drop, like preview images today. A dropped file that
  is then discarded never reaches Drive.
- **Old files go to the Drive trash** (recoverable for 30 days) when a skin is deleted or its file
  is replaced. Same idea as the UploadThing image cleanup.
- **No schema change.** The Drive file id is read back from `download_url`, like
  `getUploadThingKey` does for images.

## Drive layout

```
My Drive/
  skins/            ← GOOGLE_DRIVE_FOLDER_ID (existing folder, id copied from its URL)
    A/  B/  -/  7/  ← created on demand
      <original file name>.osk
```

**Letter folder** (`letterFolder(name)` in `src/lib/osk.ts`, tested): take the trimmed skin name,
strip accents (`NFD` + remove combining marks), take the first character; letters are uppercased.
`"abyss"` → `A`, `"Ábyss"` → `A`, `"- Rafis -"` → `-`, `"7th"` → `7`. Empty name → `#`.

The server looks the folder up by exact name and `mimeType = folder` inside `skins` (not trashed).
If several match, the oldest wins; if none, it creates it. Two simultaneous uploads could both
create the same letter folder; with one admin that's accepted.

The file keeps the dropped file's name (e.g. `Rafis - Blue.osk`).

## Reading the .osk — `src/lib/osk.ts`

`readOsk(file: File): Promise<{ name: string; author: string | null }>`

- `.osk` is a zip. Unzip with `fflate` (new dependency), filtering to only the entry whose file
  name, ignoring case, is `skin.ini` (at the root or one folder deep); nothing else is inflated.
- Parse the `[General]` section for `Name:` and `Author:` (keys case-insensitive, values trimmed,
  BOM stripped, `//` comment lines ignored).
- No `skin.ini`, or no `Name`: name falls back to the file name without `.osk`. No `Author`: null.
- Not a zip at all: throws "That file isn't a valid .osk".

Pure parsing (`parseSkinIni(text)`) is split from the unzip so it's easy to test.

## Server — `src/lib/server/drive.ts`

Plain `fetch` against the Drive REST API; no `googleapis` SDK.

- `accessToken()`: exchanges `GOOGLE_REFRESH_TOKEN` at `oauth2.googleapis.com/token`, caches it in
  memory until a minute before it expires.
- `startUpload({ fileName, size, skinName, origin })`: resolves the letter folder, then opens a
  resumable session (`POST .../upload/drive/v3/files?uploadType=resumable` with
  `X-Upload-Content-Length` and the request's `Origin` header, which is what lets the browser PUT
  to the session URL cross-origin). Returns the session URL.
- `publish(fileId)`: adds an `anyone` / `reader` permission and returns
  `https://drive.google.com/uc?export=download&id=<fileId>`.
- `getDriveFileId(url)`: file id from `uc?...id=<id>`, `open?id=<id>` or `/file/d/<id>/...` links
  on `drive.google.com`; null for anything else. Tested.
- `trashDriveFile(url)`: if `getDriveFileId` finds an id, `PATCH files/<id>` with
  `{ trashed: true }`. Errors are logged, never thrown (cleanup must not fail a save).

Missing env vars → the upload routes fail with 500 "Google Drive isn't configured".

## API routes

Both `requireAdmin` → `parseBody` (valibot schemas in `$lib/server/schemas.ts`).

- `POST /api/skins/osk/start` `{ file_name, size, skin_name }` → `{ upload_url }`.
  `size` capped at 300 MB.
- `POST /api/skins/osk/finish` `{ file_id }` → `{ download_url }`.

Cleanup in the existing routes:

- `PATCH /api/skins/[id]`: if `before.download_url` differs from the new one, `trashDriveFile(old)`.
- `DELETE /api/skins/[id]`: `skins.remove` returns the deleted skin's `download_url` alongside the
  images; trash it.

## Client

`src/lib/drive-upload.ts`: `uploadOsk(file, skinName, onProgress)`, calling start, then
`XMLHttpRequest` PUT to the session URL (fetch has no upload progress), reading the file `id` from
Google's response, then finish. Returns the `download_url`.

`OskDropzone` component (`src/routes/(admin)/dashboard/osk-dropzone.svelte`): drop or click to
pick; accepts `.osk` only; shows the picked file's name and size with a remove button.

**New skin dialog:** dropzone above the fields. On drop, `readOsk` fills name and author
(overwriting them). While a file is picked, the Download URL field is replaced by "Uploads to
Google Drive on create"; without a file, pasting a URL works as today. Create: `uploadOsk` (button
shows the %) → `POST /api/skins`.

**Skin editor:** dropzone under the Download link field. On drop, the file is kept in the draft as
pending (the draft becomes dirty); name and author are filled only if empty. Save: `uploadOsk`
first, its link replaces `download_url`, then the usual PATCH (which trashes the old file). Progress
shows in the unsaved bar's save button. Reset drops the pending file.

**Errors:** every failure is a toast; nothing is saved, the dialog / draft stays as it was. A file
uploaded to Drive whose skin save then fails is left there (rare; can be deleted by hand).

## Setup (once)

1. Google Cloud console → new project → enable **Google Drive API**.
2. OAuth consent screen: External, add yourself, scope `.../auth/drive`, **publish to production**.
3. Credentials → OAuth client ID → **Desktop app**.
4. `bun scripts/drive-setup.ts <client_id> <client_secret>`: opens the Google login (loopback
   redirect on localhost), prints `GOOGLE_REFRESH_TOKEN`.
5. Copy the `skins` folder id from its Drive URL.
6. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`,
   `GOOGLE_DRIVE_FOLDER_ID` in `.env` and on Vercel; add them to `example.env`.

## Testing

- `src/lib/osk.test.ts`: `parseSkinIni` (case, BOM, comments, missing fields), `letterFolder`
  (accents, symbols, digits, empty), `readOsk` on small zips built with `fflate` in the test
  (root ini, nested ini, no ini, not a zip).
- `src/lib/server/drive.test.ts`: `getDriveFileId` url shapes; with mocked `fetch`: token caching,
  folder lookup vs. creation, the resumable session request (headers, parent), `publish`
  permission body, `trashDriveFile` swallowing errors.
- Manual: real upload of a large skin from the dev server, link downloads while logged out.

## Not included

- Moving the skins already in Drive into letter folders.
- Preview images from inside the `.osk`.
- Deleting a Drive file whose skin save failed.
