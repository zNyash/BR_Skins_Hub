# Device Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `devices` catalog (tablet/keyboard/mouse/monitor) with tablets synced weekly from OpenTabletDriver, and a Devices tab in the admin dashboard to browse, create, edit and delete devices.

**Architecture:** Pure rule/parse/diff helpers in `convex/lib/` with colocated tests; `convex/devices.ts` holds the public list, admin mutations and the internal sync action (GitHub tree → changed files → one upsert mutation); a weekly cron in `convex/crons.ts`. The dashboard gets a Devices route group built like Skins (layout with list + chips, `[id]` editor with draft + unsaved bar), writing through `/api/devices/**`.

**Tech Stack:** Convex (actions, internal functions, crons), SvelteKit 2 + Svelte 5 runes, valibot, UploadThing, Fuse.js via `useListQuery`, vitest.

**Spec:** `docs/superpowers/specs/2026-11-13-device-catalog-design.md`

## Global Constraints

- Work on branch `feat/device-catalog` in the main checkout (no worktree). Commits: `type(scope): summary`, no Co-Authored-By trailer.
- Device types: exactly `"tablet" | "keyboard" | "mouse" | "monitor"`.
- OTD source: repo `OpenTabletDriver/OpenTabletDriver`, branch constant `0.6.x`, folder `OpenTabletDriver.Configurations/Configurations/`; `otd_path` = path inside that folder without `.json` (e.g. `Wacom/CTL-472`).
- Cron: weekly, Monday 06:00 UTC.
- `full_w`/`full_h` (mm) only on tablets; changing type away from tablet clears them. Optional on hand-made tablets.
- Name unique per type, case-insensitive; checked on create, and on edit only when name or type changes. Sync bypasses it.
- Imported tablets (`otd_path` set): type can't change, can't be deleted.
- Sync writes only `name`, `full_w`, `full_h`, `otd_path`, `otd_sha`; never `updated_at`, never `image_url`.
- One image per device, UploadThing `imageUploader`, removed/replaced file deleted after the DB write.
- The browser never talks to Convex; reads in `load()`, writes via API routes; `invalidate("app:devices")` after writes.
- Don't touch the public site or the player profile.
- Only 4px-multiple spacing; restyle only via Design System tokens.

## Review Focus

1. **GitHub fails or rate-limits (non-2xx)** → `deviceSync` gets `ok: false` with the HTTP status in `error`; no device rows change; the status line shows the error. (Task 3 Step 5, manual; Task 5 `syncSummary` test for the text.)
2. **Tree comes back `truncated: true`** → treated as a failed sync, never as "files removed". (Task 2 test.)
3. **"Sync now" pressed twice / overlaps the cron** → no duplicate rows: `applyOtdBatch` looks up by `by_otd_path` inside the mutation, so a second insert becomes an update. (Task 2 test on `planOtdWrite`.)
4. **Width/Height typed as 0, negative or empty** → empty = unset; 0/negative rejected with "Width must be a positive number". (Task 1 and Task 7 tests.)
5. **Same name differing only in case/spacing** ("wacom ctl-472 " vs "Wacom CTL-472") → 409 on create. (Task 1 test.)

---

### Task 1: Schema and device rules

**Files:**

- Modify: `convex/validators.ts` (add `deviceType`, `deviceFields`)
- Modify: `convex/schema.ts` (add `devices`, `deviceSync`)
- Create: `convex/lib/devices.ts`
- Test: `convex/lib/devices.test.ts`

**Interfaces:**

- Produces:
  - `deviceType` validator; `DeviceType = "tablet" | "keyboard" | "mouse" | "monitor"`; `DEVICE_TYPES: readonly DeviceType[]` (in that order), all exported from `convex/validators.ts`.
  - `deviceFields = { name: v.string(), type: deviceType, full_w: v.optional(v.number()), full_h: v.optional(v.number()), image_url: v.optional(v.string()) }`.
  - Schema exactly as in the spec's Data section (`devices` with `by_otd_path`, `by_type`; `deviceSync` with `skipped: v.array(v.string())`).
  - `type DeviceInput = { name: string; type: DeviceType; full_w?: number; full_h?: number; image_url?: string }`
  - `type DeviceLike = { _id: string; name: string; type: DeviceType; otd_path?: string }`
  - `nameKey(name: string): string` — trimmed, collapsed inner whitespace, lowercased.
  - `cleanDevice(input: DeviceInput): DeviceInput` — trims name; drops `full_w/full_h` unless `type === "tablet"`.
  - `deviceEditError(next: DeviceInput, current: DeviceLike | null, all: DeviceLike[]): { status: 400 | 409; message: string } | null`
  - `deleteError(device: DeviceLike): { status: 409; message: string } | null`

- [ ] **Step 1: Write failing tests** in `convex/lib/devices.test.ts`:
  - `nameKey("  Wacom   CTL-472 ")` → `"wacom ctl-472"`.
  - `cleanDevice({ name: " X ", type: "mouse", full_w: 1, full_h: 2 })` → `{ name: "X", type: "mouse" }`; tablet keeps `full_w/full_h`.
  - `deviceEditError` with `{ name: "", ... }` → `{ status: 400, message: "Name is required" }`.
  - `full_w: 0` or `-3` → `{ status: 400, message: "Width must be a positive number" }`; same for height ("Height must be a positive number").
  - create (`current = null`) with `"wacom ctl-472 "` when `all` has tablet `"Wacom CTL-472"` → `{ status: 409, message: 'A tablet named "Wacom CTL-472" already exists' }`.
  - same name but different type → `null`.
  - edit where name and type are unchanged but another row shares the name → `null`.
  - edit that changes `type` on a device with `otd_path` → `{ status: 409, message: "Imported tablets stay tablets" }`.
  - `deleteError({ ..., otd_path: "Wacom/CTL-472" })` → `{ status: 409, message: "Imported tablets can't be deleted; the next sync would bring them back" }`; without `otd_path` → `null`.

- [ ] **Step 2: Run** `bunx vitest run convex/lib/devices.test.ts` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement** the validators, schema and `convex/lib/devices.ts` per Interfaces. The uniqueness check compares `nameKey` and `type` against `all` excluding `current._id`.

- [ ] **Step 4: Run** `bunx vitest run convex/lib/devices.test.ts` — Expected: PASS. Run `bunx convex dev --once` — Expected: schema pushes, `_generated` updates.

- [ ] **Step 5: Commit** `feat(devices): add devices schema and edit rules`

---

### Task 2: OTD parsing and diffing

**Files:**

- Create: `convex/lib/otd-config.ts`
- Test: `convex/lib/otd-config.test.ts`

**Interfaces:**

- Produces:
  - `OTD_REPO = "OpenTabletDriver/OpenTabletDriver"`, `OTD_BRANCH = "0.6.x"`, `OTD_DIR = "OpenTabletDriver.Configurations/Configurations/"`.
  - `type TreeEntry = { path: string; type: string; sha: string }`
  - `otdEntries(tree: { truncated: boolean; tree: TreeEntry[] }): { otdPath: string; sha: string }[]` — throws `Error("OTD tree is truncated")` when truncated; keeps only `type === "blob"` under `OTD_DIR` ending `.json`.
  - `changedEntries(entries: { otdPath: string; sha: string }[], stored: Map<string, string>): { otdPath: string; sha: string }[]` — new paths or different sha.
  - `parseOtdConfig(json: unknown): { name: string; full_w: number; full_h: number } | null` — `Name` non-empty string, `Specifications.Digitizer.Width/Height` positive numbers; otherwise null.
  - `rawUrl(otdPath: string): string` — `https://raw.githubusercontent.com/${OTD_REPO}/${OTD_BRANCH}/${OTD_DIR}${encodeURI(otdPath)}.json`.
  - `planOtdWrite(existing: { _id: string } | null): "insert" | "patch"` — trivial, but pins the dedupe-in-mutation rule (Review Focus 3).

- [ ] **Step 1: Write failing tests:**
  - `otdEntries` keeps `OTD_DIR + "Wacom/CTL-472.json"` → `{ otdPath: "Wacom/CTL-472", sha }`; drops a `tree` entry, a `.md`, and a path outside `OTD_DIR`; throws "OTD tree is truncated" when `truncated: true`.
  - `changedEntries` with stored `{ "A/x": "1", "A/y": "2" }` and entries `A/x@1, A/y@3, A/z@4` → `[A/y@3, A/z@4]`.
  - `parseOtdConfig` of the CTL-472 sample (`{ Name: "Wacom CTL-472", Specifications: { Digitizer: { Width: 152, Height: 95, MaxX: 15200 } }, Pen: {} }`) → `{ name: "Wacom CTL-472", full_w: 152, full_h: 95 }`; missing `Name` → null; missing `Digitizer` → null; `Width: 0` → null; non-object → null.
  - `rawUrl("Wacom/CTL-472")` → `https://raw.githubusercontent.com/OpenTabletDriver/OpenTabletDriver/0.6.x/OpenTabletDriver.Configurations/Configurations/Wacom/CTL-472.json`.
  - `planOtdWrite(null)` → `"insert"`, `planOtdWrite({ _id: "d1" })` → `"patch"`.

- [ ] **Step 2: Run** `bunx vitest run convex/lib/otd-config.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** per Interfaces.
- [ ] **Step 4: Run** the same command — Expected: PASS.
- [ ] **Step 5: Commit** `feat(devices): parse and diff OpenTabletDriver configs`

---

### Task 3: Convex functions, sync action, cron

**Files:**

- Create: `convex/devices.ts`, `convex/crons.ts`
- Modify: `example.env` (comment: optional `GITHUB_TOKEN` on the Convex deployment)

**Interfaces:**

- Consumes: Task 1 helpers and validators; Task 2 helpers; `adminMutation`, `fail` from `convex/lib/functions.ts`.
- Produces:
  - `api.devices.list` (public query) → `Doc<"devices">[]`.
  - `api.devices.lastSync` (public query) → `Doc<"deviceSync"> | null` (newest by `ran_at`).
  - `api.devices.upsert` (adminMutation, args `{ id?: string, ...deviceFields }`) → `Id<"devices">`. Applies `cleanDevice`, `deviceEditError` (→ `fail(status, message)`), sets `updated_at: Date.now()`. Returns 404 "Device not found" for unknown id. On edit, the stored `image_url` is replaced by the sent one (absent = removed).
  - `api.devices.remove` (adminMutation, `{ id: string }`) → `{ image_url: string | undefined }`; `deleteError` → `fail`.
  - `api.devices.requestSync` (adminMutation, `{}`) → `void`; `ctx.scheduler.runAfter(0, internal.devices.syncOtd, {})`.
  - `internal.devices.syncOtd` (internalAction): fetch `https://api.github.com/repos/${OTD_REPO}/git/trees/${OTD_BRANCH}?recursive=1` (headers `Accept: application/vnd.github+json`, `User-Agent: br-skins-hub`, `Authorization: Bearer ${GITHUB_TOKEN}` only when set) → `otdEntries` → `internal.devices.otdShas` → `changedEntries` → download each `rawUrl` with at most 8 in flight → `parseOtdConfig` (null → push to `skipped`) → `internal.devices.applyOtdBatch` → `internal.devices.recordSync`. Any thrown error → `recordSync({ ok: false, added: 0, updated: 0, skipped: [], error: message })`, then rethrow.
  - `fetchJson(url, headers)` helper inside `devices.ts`: non-2xx throws `Error(\`GitHub ${res.status} for ${url}\`)`.
  - `internal.devices.otdShas` (internalQuery) → `Record<string, string>` (otd_path → otd_sha).
  - `internal.devices.applyOtdBatch` (internalMutation, `{ rows: { otd_path, otd_sha, name, full_w, full_h }[] }`) → `{ added: number; updated: number }`; per row looks up `by_otd_path`, `planOtdWrite` decides insert (with `type: "tablet"`) or patch (only the five sync fields).
  - `internal.devices.recordSync` (internalMutation, deviceSync fields minus `_id`) — deletes older rows, inserts the new one.
  - `convex/crons.ts`: `crons.weekly("sync OpenTabletDriver tablets", { dayOfWeek: "monday", hourUTC: 6, minuteUTC: 0 }, internal.devices.syncOtd, {})`.

- [ ] **Step 1: Implement** `convex/devices.ts` and `convex/crons.ts` per Interfaces (logic is already tested in Tasks 1–2; this file is wiring).
- [ ] **Step 2: Run** `bunx convex dev --once` then `bun run check` — Expected: both clean.
- [ ] **Step 3: First import, manually:** `bunx convex run devices:syncOtd` — Expected: then `bunx convex run devices:lastSync` shows `ok: true, added: 363, updated: 0, skipped: []`.
- [ ] **Step 4: Rerun** `bunx convex run devices:syncOtd` → `lastSync` shows `added: 0, updated: 0` (nothing downloaded).
- [ ] **Step 5: Failure path:** temporarily point `OTD_BRANCH` at `"does-not-exist"` locally, run sync, confirm `lastSync` is `ok: false` with `GitHub 404 …` and `devices:list` still has 363 rows; revert, rerun to restore `ok: true`.
- [ ] **Step 6: Commit** `feat(devices): sync tablets from OpenTabletDriver weekly`

---

### Task 4: API routes

**Files:**

- Modify: `src/lib/server/schemas.ts` (add `deviceType`, `positiveMm`)
- Test: `src/lib/server/schemas.test.ts`
- Create: `src/routes/api/devices/+server.ts`, `src/routes/api/devices/[id]/+server.ts`, `src/routes/api/devices/sync/+server.ts`

**Interfaces:**

- Consumes: `api.devices.upsert | remove | requestSync | list`; `requireAdmin`, `parseBody`, `mutate`, `convex`, `deleteUploadThingImages`.
- Produces:
  - `deviceType = v.picklist(["tablet","keyboard","mouse","monitor"], "must be tablet, keyboard, mouse or monitor")`.
  - `positiveMm = v.optional(v.pipe(v.number("must be a number"), v.minValue(0.1, "must be a positive number")))`.
  - `DeviceBody = v.object({ name: trimmedString, type: deviceType, full_w: positiveMm, full_h: positiveMm, image_url: v.optional(httpUrl) })`.
  - `POST /api/devices` → `201 { id }`. `PATCH /api/devices/[id]` → `204`; reads the device (from `api.devices.list`) before, and after the mutation deletes the old `image_url` if it differs. `DELETE /api/devices/[id]` → `204`, deletes the returned `image_url`. `POST /api/devices/sync` → `204`.
  - All spread the body first, then `actor_osu_id: admin.osu_id` (and `id: event.params.id`).

- [ ] **Step 1: Write failing tests** in `schemas.test.ts`: `deviceType` rejects `"pen"` with "must be tablet, keyboard, mouse or monitor"; `positiveMm` accepts `undefined` and `152`, rejects `0` and `-1` with "must be a positive number".
- [ ] **Step 2: Run** `bunx vitest run src/lib/server/schemas.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** the schemas and the three route files per Interfaces, following `src/routes/api/skins/**`.
- [ ] **Step 4: Run** the test file — PASS; `bun run check` — clean.
- [ ] **Step 5: Commit** `feat(devices): add device API routes`

---

### Task 5: Dashboard data, nav, list helpers

**Files:**

- Modify: `src/routes/(admin)/dashboard/+layout.server.ts` (load `devices.list` and `devices.lastSync`, `depends("app:devices")`)
- Modify: `src/routes/(admin)/dashboard/+layout.svelte` (pass `deviceCount`), `shell/rail.svelte` (Devices item after Skins, icon `"cpu"`, count), `shell/bottom-tabs.svelte` (4th tab, `grid-cols-4`)
- Modify: `src/routes/(admin)/dashboard/derive.ts`, `derive.test.ts`
- Modify: `src/lib/hooks/list-query.svelte.ts` (add `DEVICE_LIST`)
- Modify: `src/lib/types.ts` (`export type Device = Doc<"devices">`)

**Interfaces:**

- Produces:
  - `DEVICE_ICONS: Record<DeviceType, string>` in `derive.ts` = `{ tablet: "tablet", keyboard: "keyboard", mouse: "mouse", monitor: "monitor" }` (lucide names); rail/bottom-tab Devices icon = `"cpu"`.
  - `DeviceFilter = DeviceType`; `DEVICE_FILTERS: readonly { id: DeviceFilter; label: string; test: (d: Device) => boolean }[]` with labels `Tablets`, `Keyboards`, `Mice`, `Monitors`.
  - `parseFilter("devices", v)` overload → `DeviceFilter | null`.
  - `formatArea(d: { full_w?: number; full_h?: number }): string | null` → `"152 × 95 mm"`, null if either missing.
  - `syncSummary(s: Doc<"deviceSync"> | null, now: number): { text: string; error: boolean } | null` → `"Synced with OpenTabletDriver 3 days ago · 2 added, 1 updated"` (+ `" · 1 skipped"` when non-empty, reusing `timeAgo`); failed run → `{ text: "Last sync failed: <error>", error: true }`; null → `{ text: "Never synced with OpenTabletDriver", error: false }`.
  - `DEVICE_LIST: ListConfig<Device>` = `{ keys: ["name", "otd_path"], sortOptions: [byName, byUpdated], defaultSort: "name", defaultOrder: "asc" }` (match `ListConfig` field names in the file).

- [ ] **Step 1: Write failing tests** in `derive.test.ts`: `parseFilter("devices", "mouse")` → `"mouse"`, `"pen"` → null; `formatArea({ full_w: 152, full_h: 95 })` → `"152 × 95 mm"`, `{ full_w: 152 }` → null; `syncSummary` for ok with `added 2, updated 1, skipped []`, ok with `skipped ["A/x"]` (ends `· 1 skipped`), failed with error `"GitHub 403 for …"`, and null — exact strings above.
- [ ] **Step 2: Run** `bunx vitest run "src/routes/(admin)/dashboard/derive.test.ts"` — FAIL.
- [ ] **Step 3: Implement** helpers, load, nav changes.
- [ ] **Step 4: Run** the test — PASS; `bun run check` — clean.
- [ ] **Step 5: Commit** `feat(dashboard): load devices and add Devices nav`

---

### Task 6: Devices list page and creator

**Files:**

- Create: `src/routes/(admin)/dashboard/devices/+layout.svelte`, `devices/+page.svelte` (empty-editor placeholder like `skins/+page.svelte`), `devices/device-row.svelte`, `dialogs/device-creator-dialog.svelte`

**Interfaces:**

- Consumes: Task 5 helpers; `ListPane`, `SearchToolbar`, `FilterChips`, `useListQuery`, `unsaved`, `request`.
- Produces: context `"devices-list"` of type `DevicesContext = { results: Device[]; listHref: () => string }` (exported from the layout's module script, like `SkinsContext`).

- [ ] **Step 1: Build `devices/+layout.svelte`** mirroring `skins/+layout.svelte`: title "Devices", buttons **Sync now** (`variant="secondary"`, icon `refresh-cw`) and **New** (guarded by `unsaved` exactly like `openCreator` in Skins); under the header the `syncSummary` line (`text-caption text-text-muted`, `text-error` when `error`, skipped paths in `title`); chips from `DEVICE_FILTERS`; rows link to `/dashboard/devices/[id]` keeping `?filter=`.
- [ ] **Step 2: Sync now:** `request("/api/devices/sync", { method: "POST" })`, toast "Sync started", button disabled while in flight; then after 5 s `invalidate("app:devices")` once.
- [ ] **Step 3: `device-row.svelte`:** 40×40 thumbnail (`image_url` or `DEVICE_ICONS[type]` on `bg-layer-3`), name, and a muted second line: `formatArea` for tablets else the type label; small `Badge` "OTD" when `otd_path`.
- [ ] **Step 4: `device-creator-dialog.svelte`:** name input + type select (default `"tablet"`), `POST /api/devices`, `invalidate("app:devices")`, `onCreated(id)` → goto editor. Errors (409) show via toast and keep the dialog open.
- [ ] **Step 5: Verify** `bun run check && bun run lint` — clean. Start the user's dev server only if not running (`preview_start`), open `/dashboard/devices`, confirm 363 tablets, chips counts, search "ctl-472" finds the Wacom row. (Needs an admin session; if not logged in, note it as unverified.)
- [ ] **Step 6: Commit** `feat(dashboard): add Devices list with OTD sync button`

---

### Task 7: Device editor

**Files:**

- Create: `src/routes/(admin)/dashboard/devices/[id]/+page.svelte`, `device-form.svelte`, `device-draft.svelte.ts`, `device-fields.ts`, `image-field.svelte`
- Test: `src/routes/(admin)/dashboard/devices/[id]/device-fields.test.ts`

**Interfaces:**

- Consumes: `DevicesContext`; `registerEditor`, `EditorFrame`, `DeleteDialog`; `createUploadThing("imageUploader")`; `ImageItem` from `../../skin-images`.
- Produces:
  - `type DeviceDraft = { name: string; type: DeviceType; full_w: string; full_h: string; image: ImageItem | null }` (sizes as strings so empty = unset).
  - `snapshotFromDevice(d: Device): DeviceDraft`
  - `draftChanged(draft, base): boolean` (image compared by `id`)
  - `draftError(draft): string | null` — `"Give the device a name."`; non-empty size that isn't a number > 0 → `"Width must be a positive number."` / `"Height must be a positive number."` (only checked when type is tablet).
  - `deviceBody(draft, image_url: string | undefined)` → `{ name, type, full_w?, full_h?, image_url? }`, sizes only for tablets and only when non-empty, parsed with `Number`.

- [ ] **Step 1: Write failing tests:** snapshot of a tablet with no sizes → `full_w: ""`; `draftChanged` false for a fresh snapshot, true after changing type or swapping image id; `draftError` for `"  "` name, `full_w: "0"`, `full_w: "abc"`, and `null` for a mouse with `full_w: "abc"` (ignored); `deviceBody` for a mouse with sizes → no `full_w/full_h`; for a tablet with `full_w: "152", full_h: ""` → `{ ..., full_w: 152 }`.
- [ ] **Step 2: Run** `bunx vitest run "src/routes/(admin)/dashboard/devices"` — FAIL.
- [ ] **Step 3: Implement** `device-fields.ts`, then `device-draft.svelte.ts` mirroring `skin-draft.svelte.ts` (upload a pending file on save, `PATCH /api/devices/[id]`, `invalidate("app:devices")`), toast "Device saved".
- [ ] **Step 4: Build the form:** Name; Type `Select` right under it (disabled with caption "Imported tablets stay tablets" when `otd_path`); when type is tablet, one row Width (mm) left / Height (mm) right (`inputmode="decimal"`); `image-field.svelte` = one slot, click/drop to add, remove button, no reorder (reuse the skin field's drop handling); for imported tablets the caption ``Imported from OpenTabletDriver (`<otd_path>`). Edits stay until OTD changes this file.``; menu "Delete…" disabled for imported tablets, otherwise `DeleteDialog` → `DELETE`, goto `ctx.listHref()`, invalidate. `+page.svelte` mirrors `skins/[id]/+page.svelte` including the "doesn't exist anymore" state.
- [ ] **Step 5: Run** tests — PASS; `bun run check && bun run lint && bun run test` — all clean.
- [ ] **Step 6: Browser check** (admin session needed; otherwise mark unverified): edit an imported tablet's name → saved, Type disabled, Delete disabled; create a mouse "Test Mouse", add an image, save, then delete it (image gone from UploadThing per server log); create a tablet named "wacom ctl-472" → 409 toast.
- [ ] **Step 7: Commit** `feat(dashboard): add device editor`
