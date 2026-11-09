# Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/dashboard` with a shell (rail ⇄ pinned sidebar, resizable editor), a Home page, and Players / Skins pages built as list + editor, with a phone layout (bottom tabs + drawer).

**Architecture:** One `(admin)/dashboard/+layout.server.ts` loads players, skins and the layout cookie; child routes (`players/[id]`, `skins/[id]`) only pick from that data by URL. Logic lives in plain tested `.ts` modules (`derive.ts`, `$lib/resizable.ts`, `$lib/dashboard-layout.ts`); a small rune module (`unsaved.svelte.ts`) holds the shared unsaved-changes state. No Convex changes.

**Tech Stack:** SvelteKit, Svelte 5 runes, Tailwind (oklch layer tokens), Fuse.js via `useListQuery`, `use:sortable`, Vitest (server + Playwright client projects), bun.

**Spec:** `docs/superpowers/specs/2026-11-08-admin-dashboard-design.md`

## Global Constraints

- Dark only; colors only from the existing tokens in `src/routes/layout.css` (`bg-surface`, `bg-layer-1..5`, `text-text-muted`, `text-accent-color`, `--success`, `--error`).
- All spacing on the 4px grid (no `*-0.5`, `*-1.5`, `*-2.5`, `*-3.5` spacing); cards and tiles equal padding on all sides.
- Touch targets ≥ 44px on the phone layout.
- Editor width: min 440, max 960, default 720. Sidebar (pinned) width: min 200, max 320, default 240. List min 360. Form goes to one column under 560px editor width.
- Breakpoints: phone layout below 900px (see Task 6 note); pinned sidebar only honored at ≥ 1200px viewport.
- Cookie `dashboard_layout`: `{ pinned: boolean, rail: number, editor: number }`, `path=/dashboard`, max-age one year, `SameSite=Lax`, not httpOnly.
- Filters: players `no-skins | no-setup | not-synced`; skins `no-players | no-images`. Tabs: `profile | skins | links | setup`.
- "Not synced" = `synced_at` missing or older than 30 days.
- Copy (exact): "Careful — you have unsaved changes!", "Reset", "Save changes", "Nobody uses this skin. Assign it to a player, or delete it to free up space.", "Description (About tab)", "All good.", "No setup yet.", "Edit on profile ↗", "View profile ↗", "cover failed to load".
- Commits: `type(scope): summary`, no Co-Authored-By trailer.

## Review Focus

- **Open item that doesn't exist** (deleted elsewhere, mistyped id in the URL): the list still renders and the editor shows "This player doesn't exist anymore." / "This skin doesn't exist anymore." with a link back to the list — never a crash or a blank page. (Task 8, Task 10)
- **Open item drops out of the filter** (e.g. assigning skins to a player while "No skins" is on): the editor stays on that item; the stepper shows `–/N` and › goes to the first item of the filtered list. (Task 1 test, Task 8)
- **Narrow desktop window with the sidebar pinned** (900–1200px): no horizontal page scroll; the sidebar renders as the rail without changing the saved cookie. (Task 3 test, Task 6)
- **Save clicked twice / navigation while saving:** one request only; the bar stays and navigation stays blocked until the request settles. (Task 4 test)
- **Ctrl+B while typing in an input** (search box, bio): types nothing special and does not toggle the sidebar. (Task 6)

---

### Task 1: Derived data (`derive.ts`)

**Files:**

- Create: `src/routes/(admin)/dashboard/derive.ts`
- Test: `src/routes/(admin)/dashboard/derive.test.ts`

**Interfaces:**

- Consumes: `presentCards(setup)` from `$lib/setup`; `Doc<"players">`, `SkinWithPlayers` types.
- Produces:
  - `type PlayerFilter = "no-skins" | "no-setup" | "not-synced"`, `type SkinFilter = "no-players" | "no-images"`, `type EditorTab = "profile" | "skins" | "links" | "setup"`
  - `skinCountByPlayer(skins: SkinWithPlayers[]): Map<Id<"players">, number>`
  - `setupFilled(player: Doc<"players">): number` (0–6)
  - `isStale(player: Doc<"players">, now: number): boolean`
  - `PLAYER_FILTERS: readonly { id: PlayerFilter; label: string; test: (p: Doc<"players">, ctx: { skinCounts: Map<Id<"players">, number>; now: number }) => boolean }[]` — labels "No skins", "No setup", "Not synced"
  - `SKIN_FILTERS: readonly { id: SkinFilter; label: string; test: (s: SkinWithPlayers) => boolean }[]` — labels "No players", "No images"
  - `parseFilter(kind: "players", v: string | null): PlayerFilter | null` and overload for `"skins"` → `SkinFilter | null`
  - `parseTab(v: string | null): EditorTab` (default `"profile"`)
  - `stepPosition<T extends { _id: string }>(list: T[], id: string): number | null` (1-based, null when absent)
  - `step<T extends { _id: string }>(list: T[], id: string, delta: 1 | -1): string | null` (wraps; id absent → first item's id; empty list → null)
  - `recentlyEdited(players: Doc<"players">[], skins: SkinWithPlayers[], n: number): ({ kind: "player"; doc: Doc<"players"> } | { kind: "skin"; doc: SkinWithPlayers })[]` (newest `updated_at` first, missing last)
  - `onlyTabChanged(from: URL, to: URL): boolean` (same pathname and same params except `tab`)

- [ ] **Step 1: Write the failing tests** — fixtures built with small `player({...})` / `skin({...})` helpers. Cases:
  - `skinCountByPlayer`: two skins sharing a player → count 2; a player on no skin is absent (`?? 0` at call sites).
  - `setupFilled`: `undefined` setup → 0; keyboard + tablet → 2.
  - `isStale`: missing `synced_at` → true; 29 days ago → false; 31 days ago → true (`now = Date.UTC(2026, 10, 8)`).
  - each filter's `test` on one matching and one non-matching item.
  - `parseFilter("players", "no-skins")` → `"no-skins"`; `"bogus"` → null; null → null; `parseFilter("skins", "no-skins")` → null.
  - `parseTab("links")` → `"links"`; `"x"` and null → `"profile"`.
  - `step([a,b,c], "b", 1)` → `"c"`; `("c", 1)` → `"a"`; `("a", -1)` → `"c"`; `("zz", 1)` → `"a"`; `([], "a", 1)` → null. `stepPosition([a,b], "b")` → 2; `"zz"` → null.
  - `recentlyEdited`: mixes kinds by `updated_at`, items without it after dated ones, length capped at `n`.
  - `onlyTabChanged`: `/dashboard/players/1?tab=skins&filter=no-skins` → same with `tab=links` → true; different id → false; different filter → false.

- [ ] **Step 2: Run** `bunx vitest run "src/routes/(admin)/dashboard/derive.test.ts"` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement** the exports above in `derive.ts`.

- [ ] **Step 4: Run** the same command — Expected: PASS.

- [ ] **Step 5: Commit** `feat(dashboard): derived data for lists, filters and stepping`

---

### Task 2: `use:resizable`

**Files:**

- Create: `src/lib/resizable.ts`
- Test: `src/lib/resizable.test.ts`

**Interfaces:**

- Produces:
  - `clampWidth(px: number, min: number, max: number): number`
  - `widthFromPointer(startWidth: number, startX: number, x: number, side: "left" | "right"): number` — `side` is the edge of the _panel_ the handle sits on: handle on the panel's left edge (editor) grows when moving left; on its right edge (sidebar) grows when moving right.
  - `type ResizableOptions = { min: number; max: number; value: number; side: "left" | "right"; onResize: (px: number) => void; onCommit: (px: number | null) => void }`
  - `resizable: Action<HTMLElement, ResizableOptions>`

- [ ] **Step 1: Write the failing tests:** `clampWidth(100, 200, 320)` → 200, `(400, 200, 320)` → 320, `(250, …)` → 250; `widthFromPointer(720, 500, 450, "left")` → 770; `(240, 100, 140, "right")` → 280.
- [ ] **Step 2: Run** `bunx vitest run src/lib/resizable.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement.** The action: `pointerdown` (primary button) captures the pointer, records start width/X, sets `document.body.style.cursor = "col-resize"` and `user-select: none`; `pointermove` → `onResize(clampWidth(widthFromPointer(...)))`; `pointerup`/`pointercancel` → `onCommit(last)` and restore styles. `keydown` ArrowLeft/ArrowRight move 16px (`Shift` 64px) in the growing direction for `side`, then `onCommit`. `dblclick` → `onCommit(null)`. Sets `role="separator"`, `aria-orientation="vertical"`, `tabindex="0"`, `aria-valuemin/max/now` and updates `aria-valuenow` in `update()`. Follow `src/lib/sortable.ts` for structure and comment style.
- [ ] **Step 4: Run** the same command — Expected: PASS.
- [ ] **Step 5: Commit** `feat(resizable): drag and keyboard resize action`

---

### Task 3: Layout cookie (`dashboard-layout.ts`)

**Files:**

- Create: `src/lib/dashboard-layout.ts`
- Test: `src/lib/dashboard-layout.test.ts`

**Interfaces:**

- Produces:
  - `type DashboardLayout = { pinned: boolean; rail: number; editor: number }`
  - `LAYOUT_COOKIE = "dashboard_layout"`, `DEFAULT_LAYOUT: DashboardLayout = { pinned: false, rail: 240, editor: 720 }`, `RAIL = { min: 200, max: 320 }`, `EDITOR = { min: 440, max: 960 }`
  - `parseLayout(raw: string | undefined): DashboardLayout`
  - `serializeLayout(layout: DashboardLayout): string` (the full `document.cookie` string with the attributes from Global Constraints, value `encodeURIComponent(JSON)`)
  - `showPinned(layout: DashboardLayout, viewportWidth: number): boolean` (`layout.pinned && viewportWidth >= 1200`)

- [ ] **Step 1: Write the failing tests:** undefined → defaults; `"{not json"` → defaults; `{ pinned: true, rail: 999, editor: 10 }` → `{ pinned: true, rail: 320, editor: 440 }`; wrong types (`pinned: "yes"`) → that field's default; round trip `parseLayout(decodeURIComponent(value of serializeLayout(x)))` equals `x`; `serializeLayout` contains `path=/dashboard`, `max-age=31536000`, `samesite=lax` (case-insensitive); `showPinned({pinned:true,…}, 1100)` → false, `1200` → true.
- [ ] **Step 2: Run** `bunx vitest run src/lib/dashboard-layout.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** using `clampWidth` from Task 2.
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** `feat(dashboard): layout cookie parse and serialize`

---

### Task 4: Unsaved changes state + bar

**Files:**

- Create: `src/routes/(admin)/dashboard/unsaved.svelte.ts`
- Create: `src/routes/(admin)/dashboard/unsaved-bar.svelte`
- Test: `src/routes/(admin)/dashboard/unsaved.svelte.test.ts` (client project)

**Interfaces:**

- Consumes: `onlyTabChanged` (Task 1).
- Produces:
  - `unsaved: { readonly dirty: boolean; readonly saving: boolean; readonly shaking: boolean; shake(): void; reset(): void; save(): Promise<void> }`
  - `registerEditor(editor: { isDirty: () => boolean; reset: () => void; save: () => Promise<void> }): void` — call during component init; registers via `$effect` (removed on destroy) and installs `beforeNavigate`: when dirty (or saving) and `!(navigation.to && onlyTabChanged(from, to))` → `navigation.cancel()` + `shake()`; `type === "leave"` → let the browser's `beforeunload` prompt handle it (`navigation.cancel()` triggers it).
  - `UnsavedBar` component (no props) reads `unsaved`.

- [ ] **Step 1: Write the failing browser tests** (render a tiny harness component that calls `registerEditor` with a `$state` dirty flag and a `save` returning a controllable promise):
  - `save()` called twice while the first is pending → the editor's `save` ran once; `saving` true until it resolves.
  - `shake()` sets `shaking` true and it returns to false after 600ms (fake timers).
  - `reset()` calls the editor's `reset`.
- [ ] **Step 2: Install the browser once if missing and run:** `bunx playwright install chromium-headless-shell`, then `bunx vitest run "src/routes/(admin)/dashboard/unsaved.svelte.test.ts"` — Expected: FAIL.
- [ ] **Step 3: Implement** the module and `unsaved-bar.svelte`: fixed to the bottom center of the page area (`absolute bottom-6 left-1/2 -translate-x-1/2`, width `min(640px, 100% - 48px)`), `bg-layer-2 rounded-xl shadow-lg p-3 pl-5`, text + "Reset" (ghost) + "Save changes" (`bg-success text-on-success`, disabled while saving); slide-up on mount (tw-animate-css `animate-in slide-in-from-bottom-4`); while `shaking`, a horizontal shake keyframe and `ring-2 ring-error` for 600ms (add the `@keyframes` to `layout.css`). Rendered only when `dirty`. `role="status"`.
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** `feat(dashboard): shared unsaved-changes state and bar`

---

### Task 5: Shared hue picker and links editor

Both editors exist only inside the profile Settings cards, which save on their own. Extract the controls so the dashboard reuses them; the cards keep their behavior.

**Files:**

- Create: `src/lib/components/hue-picker.svelte`
- Create: `src/lib/components/links-editor.svelte`
- Modify: `src/routes/(public)/player/[osuId]/colors-card.svelte`, `src/routes/(public)/player/[osuId]/links-card.svelte`

**Interfaces:**

- Produces:
  - `HuePicker` props `{ value: number; onPreview?: (hue: number) => void; onPick: (hue: number) => void; label?: string }` — the swatch radiogroup (`SWATCHES` as today), slider (`input` → `onPreview`, `change` → `onPick`) and number input (`parseHue`). The card keeps `huePreview`, the slider save delay and `saveProfile`.
  - `LinksEditor` props `{ links: { type: LinkType; value: string }[] (bindable) }` — rows with type select, value input, reorder, remove, "+ Add link"; exports nothing else. `hasBlankLink(links): boolean` exported from `$lib/links.ts` (with a test in `src/lib/links.test.ts`: `[{type:"twitch", value:"  "}]` → true, filled → false).

- [ ] **Step 1: Write the failing `hasBlankLink` test** in `src/lib/links.test.ts`.
- [ ] **Step 2: Run** `bunx vitest run src/lib/links.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** `hasBlankLink`, then move the markup into the two components and make the cards use them (same look, same saving).
- [ ] **Step 4: Run** `bunx vitest run src/lib/links.test.ts && bun run check` — Expected: PASS, 0 errors. Open `/player/<your osu id>?tab=settings` in the dev server: picking a swatch still saves, links still save, blank links still block saving.
- [ ] **Step 5: Commit** `refactor(profile): extract hue picker and links editor for reuse`

---

### Task 6: Route data, shell and site-wide scrollbars

**Note:** the spec says phone layout below 768px. At 768–900px the rail (64) + list (360) + editor (440) don't fit, so the phone layout is used below **900px** instead. Likewise a pinned sidebar (up to 320px) doesn't fit next to list + editor on narrow desktops, so it only shows pinned at ≥ 1200px (`showPinned`). Update both lines in the spec in this task.

**Files:**

- Create: `src/routes/(admin)/dashboard/+layout.server.ts`, `src/routes/(admin)/dashboard/+layout.svelte`
- Create: `src/routes/(admin)/dashboard/shell/rail.svelte`, `src/routes/(admin)/dashboard/shell/bottom-tabs.svelte`
- Move (git mv): `assign-players-dialog.svelte`, `assign-skins-dialog.svelte`, `delete-dialog.svelte`, `player-creator-dialog.svelte`, `skin-creator-dialog.svelte`, `tag-input.svelte` → `src/routes/(admin)/dashboard/dialogs/`
- Modify: `src/lib/server/auth.ts` (+ `auth.test.ts`), `src/routes/layout.css`, the spec (breakpoint line)
- Delete: `src/routes/(admin)/dashboard/+page.server.ts`

**Interfaces:**

- Consumes: `parseLayout`, `LAYOUT_COOKIE` (Task 3); `resizable` (Task 2).
- Produces:
  - `assertAdminPage(locals: App.Locals): void` in `$lib/server/auth` — redirects 302 to `/auth/login` without a user, to `/` for a non-admin (the logic now in `(admin)/+layout.server.ts`, which then calls it too).
  - Layout data: `{ players: Doc<"players">[]; skins: SkinWithPlayers[]; layout: DashboardLayout }` (depends `app:players`, `app:skins`).
  - `layoutState` (in `+layout.svelte`, passed via context key `"dashboard-layout"`): `{ layout: DashboardLayout; isDesktop: boolean; setEditor(px: number | null): void }` — `isDesktop` from `new MediaQuery("min-width: 900px")` (`svelte/reactivity`).

- [ ] **Step 1: Write the failing test** in `src/lib/server/auth.test.ts`: `assertAdminPage({ user: undefined })` throws a redirect to `/auth/login`; a non-admin user → redirect to `/`; an admin (from the test's `ADMIN_OSU_IDS` setup, as the existing tests do) → no throw.
- [ ] **Step 2: Run** `bunx vitest run src/lib/server/auth.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** `assertAdminPage`, the layout load (calls it, loads both lists like the old page load, reads the cookie), the shell:
  - Desktop: `rail.svelte` — absolute 64px rail that widens to `layout.rail` on hover over the page (`shadow`, labels fade in); when `showPinned(layout, innerWidth)` it's in flow at `layout.rail` px with a right-edge `use:resizable` (`side: "right"`). Items: Home, Players, Skins (with counts), then pin button (`aria-pressed`), "Back to site". Active item `bg-layer-2 text-accent-color`.
  - `Ctrl+B` / `Meta+B` on `svelte:window` toggles `pinned` unless `event.target` is an input, textarea, select or contenteditable; writes the cookie with `serializeLayout`.
  - Phone: `bottom-tabs.svelte` — fixed bottom bar, Home / Players / Skins, 44px targets.
  - `{@render children()}` in a page area that holds `<UnsavedBar />`.
  - `layout.css`: the scrollbar rules from the spec, a `.scroll-list` utility (`padding: 4px; margin: -4px; overflow-y: auto`), and `.no-scrollbar`.
- [ ] **Step 4: Run** `bunx vitest run src/lib/server/auth.test.ts && bun run check` — Expected: PASS, 0 errors.
- [ ] **Step 5: Commit** `feat(dashboard): route data, rail and phone tabs`

---

### Task 7: Home

**Files:**

- Create: `src/routes/(admin)/dashboard/+page.svelte` (replaces the old one)

**Interfaces:**

- Consumes: layout data; `PLAYER_FILTERS`, `SKIN_FILTERS`, `skinCountByPlayer`, `recentlyEdited` (Task 1); creator dialogs (Task 6 locations).

- [ ] **Step 1: Implement** the page per the spec's Home section: two action tiles (open the creator dialogs; `onCreated(id)` → `goto("/dashboard/players/" + id)` / skins), Recently edited (6 rows, links), Needs attention rows (one per filter with count > 0, linking to `/dashboard/players?filter=<id>` or skins; none → "All good."). Phone: the attention rows become a horizontal `.no-scrollbar` row of count cards.
- [ ] **Step 2: Verify** `bun run check` (0 errors) and in the dev server: counts match the lists, each link opens the filtered list, creating a player lands in its editor.
- [ ] **Step 3: Commit** `feat(dashboard): home page`

---

### Task 8: Players list and editor frame

**Files:**

- Create: `src/routes/(admin)/dashboard/list-pane.svelte` (shared list + editor columns)
- Create: `src/routes/(admin)/dashboard/editor-frame.svelte` (card, header with stepper and ⋯ menu, tab bar, empty / not-found states, phone drawer)
- Create: `src/routes/(admin)/dashboard/players/+layout.svelte`, `players/+page.svelte`, `players/[id]/+page.svelte`, `players/player-row.svelte`

**Interfaces:**

- Consumes: Tasks 1–4, 6.
- Produces:
  - `ListPane` props `{ list: Snippet; editor: Snippet; hasItem: boolean; onClose: () => void }` — desktop: list column (`flex: 1 0 360px`, `.scroll-list`) + left-edge `use:resizable` handle + editor column (`flex: 0 1 {layout.editor}px; min-width: 440px; container-type: inline-size`). Phone: list fills the screen; when `hasItem`, the editor renders in a bottom drawer (from 96px below the top, drag handle; ✕ or swiping down > 120px calls `onClose`).
  - `EditorFrame` props `{ title: string; subtitle: string; avatar: Snippet; cover?: string; position: number | null; total: number; onPrev: () => void; onNext: () => void; menu: { label: string; onSelect: () => void; destructive?: boolean }[]; tabs?: { id: EditorTab; label: string }[]; tab?: EditorTab; actions?: Snippet; children: Snippet }` — stepper shows `position ?? "–"`/`total`; tabs are links that set `?tab=`.

- [ ] **Step 1: Implement** the players layout: `useListQuery(() => filtered, PLAYER_LIST)` with default sort "updated" desc; header (title, "+ New", search, filter chips with counts as links keeping other params, "n of N shown", sort select); rows (`player-row.svelte` per the spec's Player row: banner with `mask-image`, avatar + name, "N skins", six dots from `setupFilled`, relative time; `<img>` cover with `onload`/`onerror` to switch shimmer → banner / "cover failed to load"; `aria-current` on the open one; link keeps `?filter`). `players/+page.svelte`: empty editor ("Select a player" + "+ New"). `players/[id]/+page.svelte`: finds the player in layout data; missing → "This player doesn't exist anymore." with a link to `/dashboard/players`. Stepper uses `step`/`stepPosition` over the filtered, sorted list.
- [ ] **Step 2: Verify** `bun run check` and in the dev server: filter chips, search, sort; stepping with wrap; open a player then turn on a filter it doesn't match → `–/N`; `/dashboard/players/does-not-exist` → not-found message; drag the handle → editor width changes, survives reload (cookie); widen the window → list grows, editor stays.
- [ ] **Step 3: Commit** `feat(dashboard): players list with cover rows and editor frame`

---

### Task 9: Player editor tabs and saving

**Files:**

- Create: `src/routes/(admin)/dashboard/players/[id]/player-draft.svelte.ts` (draft + dirty + save)
- Create: `players/[id]/profile-tab.svelte`, `skins-tab.svelte`, `links-tab.svelte`, `setup-tab.svelte`
- Modify: `players/[id]/+page.svelte`
- Delete: `src/routes/(admin)/dashboard/player-editor.svelte`

**Interfaces:**

- Consumes: `player-skins.ts` (`DraftSkin`, `skinsChanged`), `sortPlayerSkins` from `$convex/lib/order`, `HuePicker`, `LinksEditor`, `hasBlankLink` (Task 5), `TagInput`, `AssignSkinsDialog`, `registerEditor` (Task 4), `sortable`/`moveItem`.
- Produces: `createPlayerDraft(player: () => Doc<"players">, skins: () => SkinWithPlayers[])` returning `{ draft; isDirty(): boolean; reset(): void; save(): Promise<void> }` — the snapshot fields and skin list logic are the ones in today's `player-editor.svelte` (`snapshotFromPlayer`, `SkinItem`, order from `sortPlayerSkins`); `save()` sends `PATCH /api/players/[id]` with the changed fields and `skins: { id, hidden }[]` via `request()`, toasts "Player saved", `invalidate("app:players")` and `invalidate("app:skins")`; blank links reject with a toast and no request.

- [ ] **Step 1: Implement** the draft module (moved from `player-editor.svelte`) and register it with `registerEditor`. Tabs per the spec: Profile (`.form-grid` two columns → one column under 560px with `@container`; Description (About tab) last), Skins (grid with `use:sortable`, eye icon toggle with `aria-pressed` and label "Hide from profile"/"Show on profile", ✕ to remove, "+ Assign skins" adds to the front), Links (`LinksEditor`), Setup (one line per present card with model or "–"; "No setup yet."; "Edit on profile ↗" to `/player/[osuId]?tab=setup`). Tab labels with counts. ⋯ menu: "Sync with osu!" (`POST /api/players/sync` with this player, toast, invalidate), "Delete…" (delete dialog → `DELETE`, `goto` list URL keeping `filter`). Header: "View profile ↗".
- [ ] **Step 2: Verify** `bun run check`, `bun run test` (all pass), and in the dev server: change a field → bar appears; click another player → blocked, bar shakes; switch tabs → allowed; Reset restores; Save sends one request (Network tab) and the bar disappears; drag skins and hide one → saved order and hidden flag show on the public profile.
- [ ] **Step 3: Commit** `feat(dashboard): player editor tabs with shared unsaved bar`

---

### Task 10: Skins list and editor

**Files:**

- Create: `src/routes/(admin)/dashboard/skins/+layout.svelte`, `skins/+page.svelte`, `skins/[id]/+page.svelte`, `skins/skin-row.svelte`, `skins/[id]/skin-draft.svelte.ts`
- Delete: `src/routes/(admin)/dashboard/skin-editor.svelte`

**Interfaces:**

- Consumes: `ListPane`, `EditorFrame` (Task 8), `DASHBOARD_SKIN_LIST`, `SKIN_FILTERS`, `skin-images.ts` (`ImageItem`, `resolveImageUrls`), `AssignPlayersDialog`, `registerEditor`.
- Produces: `createSkinDraft(skin: () => SkinWithPlayers)` with the same shape as `createPlayerDraft`; save = today's `skin-editor.svelte` save (uploads new images, then `PATCH /api/skins/[id]`), toast "Skin saved", invalidate `app:skins` and `app:players`.

- [ ] **Step 1: Implement** list (row per the spec's Skin row; default sort "updated" desc; filters No players / No images) and editor (one scrolling form, no tabs: Name, Author; Download link; Tags; Images sortable; Used by chips with ✕ and "+ Assign players"; the "Nobody uses this skin…" notice with Assign and Delete when no players). ⋯ menu: "Delete…". Missing id → "This skin doesn't exist anymore."
- [ ] **Step 2: Verify** `bun run check`, `bun run test`, and in the dev server: Home "Skins with no players" → filtered list → assign a player → save → it leaves the filter and the stepper shows `–/N`; delete an unused skin → editor closes, list updated.
- [ ] **Step 3: Commit** `feat(dashboard): skins list and editor`

---

### Task 11: Cleanup and final verification

**Files:**

- Delete: any remaining old dashboard files not moved above (`+page.svelte` leftovers are already replaced).
- Modify: `CLAUDE.md` "Routes" line (dashboard routes), if it lists `/dashboard` as a single page.

- [ ] **Step 1: Run** `bun run lint`, `bun run check`, `bun run test` — Expected: all clean / pass.
- [ ] **Step 2: Verify in the dev server** at 1920×950, 1366×650, 1000×700 and the mobile preset (375×812): no horizontal page scroll; rail hover and `Ctrl+B` pin (ignored while typing in search); pinned is shown only at ≥ 1200px; drawer opens/closes (✕, swipe, back); unsaved bar sits above the drawer on phone; thin scrollbars everywhere, none on the phone attention row; selected and hovered rows aren't clipped.
- [ ] **Step 3: Commit** `chore(dashboard): remove old dashboard, docs`
