# Device catalog

Date: 2026-11-13. Status: approved in chat, awaiting spec review.

Spec 2 of the dashboard work (spec 1: `2026-11-08-admin-dashboard-design.md`). Spec 3, linking
players' Setup cards to catalog devices, comes next and replaces the old "request workflow" idea.

## Goal

A `devices` catalog of the hardware the community uses: tablets, keyboards, mice and monitors.
Tablets are imported from OpenTabletDriver (OTD) and kept in sync with it automatically, so the
list is complete before any player types a model name. The admin can browse, edit, add and delete
devices on a new **Devices** tab in the dashboard, and give each device a photo.

Why: spec 3 will detect setups whose typed model looks like a catalog device ("5 setups look like
Wacom CTL-472 → Link") and link them, so profiles can show the real device and its image. That
needs a full, clean catalog to match against first.

## Non-goals

- Linking Setup cards to devices, similar-name detection, the Home "needs attention" card, the
  device picker dialog. All spec 3.
- Showing devices anywhere on the public site.
- Keyboard/mouse/monitor imports from any outside source. Those are added by hand (or via spec 3).
- Extra per-type fields (switches, DPI, refresh rate…). Only tablets get extra fields, for now.
- Mass image import. The admin adds photos for the popular devices by hand; the rest show the type
  icon.

## Decisions

- **One `devices` table with a `type`**: `tablet | keyboard | mouse | monitor`, a Convex union
  of literals so more types can be added later.
- **Sync source**: GitHub repo `OpenTabletDriver/OpenTabletDriver`, branch `0.6.x` (the default
  branch today), folder `OpenTabletDriver.Configurations/Configurations/<Vendor>/<Model>.json`.
  363 files as of 2026-11-13. From each file: `Name` → `name`,
  `Specifications.Digitizer.Width/Height` (mm) → `full_w/full_h`. Branch is a constant in code,
  not "whatever the default branch is", so a future OTD 0.7 with a different file format can't
  break the import by surprise.
- **Incremental sync via the git tree**: one GitHub API call
  (`GET /repos/{owner}/{repo}/git/trees/0.6.x?recursive=1`) lists every config path with its blob
  sha. Each imported device stores `otd_path` (relative path without `.json`, e.g.
  `Wacom/CTL-472`) and `otd_sha`. Only files that are new or whose sha changed are downloaded (from
  `raw.githubusercontent.com`). The first run is the full import; there is no separate seed step.
- **Runs in Convex**: a Convex cron plus an action. No GitHub Actions. **A `GITHUB_TOKEN` Convex
  env var is required**: found while building, Convex's shared IPs already exhaust GitHub's
  anonymous limit (60/hour per IP). Fine-grained token, public repositories read-only, no
  permissions. Sent on the tree call and the raw downloads.
- **Weekly schedule**: Mondays 06:00 UTC (03:00 Brasília). OTD's config folder changed on ~7–8 days
  a month over the last year, mostly single-tablet additions; a week's delay is fine, and the
  "Sync now" button covers the rest.
- **OTD owns its fields only when OTD changes them**: a sync writes `name`, `full_w`, `full_h` on a
  device only when that file's sha changed (or it's new). Admin edits to an imported tablet stay
  until OTD next changes that same file. The image is never touched by sync.
- **Removed upstream = kept**: if a file disappears from OTD, our row stays as is (spec 3 links will
  point at it). No flag for now.
- **Imported tablets can't be deleted** (the next sync would bring them back). The editor's Delete
  is disabled for rows with `otd_path`, with a short reason. Hand-made devices can be deleted.
- **One image per device**, uploaded with UploadThing like skin preview images, on Save. Replacing
  or removing it deletes the old file (same cleanup as skins). No image → the type icon.
- **Unique name per type**, case-insensitive, checked in Convex on create, and on edit only when
  the name or type changes (so a save that only adds a photo never 409s). Sync bypasses the
  check: OTD names are taken as they come, and an OTD tablet is never merged into a hand-made one
  with the same name (spec 3 deals with duplicates if they ever matter). Checked 2026-11-13: all
  363 OTD names are already unique.
- **Imported tablets keep type `tablet`**: the Type select is disabled for rows with `otd_path`,
  and `upsert` rejects a type change on them. This keeps sync's tablet-only writes valid.
- **`updated_at` = edited by the admin**: sync never sets it. Sorting by "last edited" falls back
  to `_creationTime` when it's missing.
- **Width/Height are optional** for hand-made tablets.
- **Type filter = filter chips** above the list (All · Tablets · Keyboards · Mice · Monitors), the
  same `?filter=` pattern as Players and Skins. No sub-tabs.

## Data

```ts
devices: defineTable({
  name: v.string(),
  type: deviceType, // v.union(v.literal("tablet"), v.literal("keyboard"), v.literal("mouse"), v.literal("monitor"))
  /** Full active area in mm. Tablets only. */
  full_w: v.optional(v.number()),
  full_h: v.optional(v.number()),
  image_url: v.optional(v.string()),
  /** Set only on tablets imported from OTD: config path without ".json", e.g. "Wacom/CTL-472". */
  otd_path: v.optional(v.string()),
  /** Git blob sha of that config file at the last import. */
  otd_sha: v.optional(v.string()),
  updated_at: v.optional(v.number())
})
  .index("by_otd_path", ["otd_path"])
  .index("by_type", ["type"])

/** One row: the last OTD sync's outcome, shown on the Devices page. */
deviceSync: defineTable({
  ran_at: v.number(),
  ok: v.boolean(),
  added: v.number(),
  updated: v.number(),
  /** OTD paths that failed to parse on this run. */
  skipped: v.array(v.string()),
  error: v.optional(v.string())
})
```

`full_w/full_h` are only stored when `type` is `tablet`; changing a device's type away from tablet
clears them on save.

## Convex

- `convex/crons.ts`: weekly cron → `internal.devices.syncOtd`.
- `convex/devices.ts`:
  - `list` (public query): all devices. ~400 rows, loaded whole like players and skins.
  - `upsert` (adminMutation): create or edit; validates type, uniqueness, tablet-only fields.
  - `remove` (adminMutation): 403/409 for imported tablets; returns `image_url` for cleanup.
  - `syncOtd` (internalAction): fetch tree → read stored `otd_path → otd_sha` map (internalQuery)
    → download new/changed files with limited concurrency → one internalMutation that upserts the
    parsed batch by `otd_path` and writes the `deviceSync` row. On failure, write a `deviceSync`
    row with `ok: false` and the error, then rethrow.
  - `requestSync` (admin-level, called by the API route): schedules `syncOtd` immediately
    (`ctx.scheduler.runAfter(0, …)`) and returns. Needs an admin-checked mutation, which
    `adminMutation` already gives.
- Parsing one config file into `{ name, full_w, full_h }` lives in a plain module with a colocated
  test, e.g. `convex/lib/otd-config.ts`. Files missing `Name` or digitizer size are skipped, not
  fatal, and listed in `deviceSync.skipped`. A skipped file stores no sha, so it's simply
  downloaded again next run (cheap; none fail today). If an already-imported file changes and now
  fails to parse, its row keeps its old data and old sha, so it's retried next run.

## API routes

Following the existing pattern (`requireAdmin` → `parseBody` → `mutate` → 204):

- `POST /api/devices` — create. `PATCH /api/devices/[id]` — edit. `DELETE /api/devices/[id]` —
  delete, then delete the image file.
- `POST /api/devices/sync` — calls `requestSync`.
- Image upload reuses the UploadThing route skins use.

## Dashboard

- **Rail / bottom tabs**: new "Devices" item after Skins, with a count.
- **Layout load**: `+layout.server.ts` also loads `devices.list` and the `deviceSync` row,
  `depends("app:devices")`.
- **Devices list** (same `ListPane` as Skins):
  - Header: "Devices" title, **Sync now** and **New** buttons; under it a muted line
    "Synced with OpenTabletDriver 3 days ago · 2 added, 1 updated" (plus "· 1 skipped" when
    `skipped` isn't empty, with the paths in a tooltip), or the error in the error color when the
    last run failed.
  - Search (Fuse, by name) + type filter chips with counts. Sort by name or last edited.
  - Row: image thumbnail or type icon, name, and for tablets the full area ("152 × 95 mm").
    Imported tablets get a small "OTD" badge.
- **Sync now**: calls the route, shows a toast "Sync started", disables itself while the request
  is in flight. The sync runs in the background; the admin reloads the list (or it's re-invalidated
  a few seconds later — builder's call) to see the result.
- **Editor** (same `EditorFrame`, unsaved bar, prev/next as skins):
  - Name.
  - Type (select), right under the name.
  - Only when type is Tablet: one row, Width (mm) left, Height (mm) right.
  - Image: one slot, same add/remove/drop behavior as the skin images field, without reordering.
  - Menu: Delete… (disabled with a reason for imported tablets).
  - For imported tablets, a muted caption: "Imported from OpenTabletDriver (`Wacom/CTL-472`).
    Edits stay until OTD changes this file."
- **New device**: a small creator dialog (name + type), like the skin creator, then lands on the
  new device's editor.

## Testing

- `otd-config` parsing: valid file, missing `Name`, missing digitizer, extra fields ignored.
- Sync diffing (which paths are new / changed / unchanged) as a plain function with tests.
- `upsert` rules: uniqueness per type (case-insensitive, only when name/type changes), tablet-only
  fields cleared on type change, imported tablet can't change type or be deleted.
- Sync mutation: a changed file that fails to parse leaves the row and sha untouched; sync never
  sets `updated_at`.
- Devices list filters/derive helpers, like the existing `derive.test.ts`.

## Left to the builder

- Concurrency limit for file downloads, and whether the upsert mutation is one batch or chunked
  (Convex mutation limits allow 363 small writes, but chunking is fine too).
- Icons for each type (lucide set).
- How the list refreshes after "Sync now".
- Whether to extract a shared list header now that a third list exists (noted in spec 1).
