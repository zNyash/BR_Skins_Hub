# Player Skin Ordering and Hiding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Players' skins get a saved custom order and per-skin hiding, editable by admins in the dashboard via a shared drag-and-drop feel (also used for skin preview images), with the public profile defaulting to the custom order and a "Show hidden skins" toggle.

**Architecture:** `position` and `hidden` live on `playerSkins` rows. A pure `sortPlayerSkins` (importable from both Convex and the SvelteKit app) defines the order. Relation helpers in `convex/lib/relations.ts` do all writes, including player-side helpers built now but not exposed. The frontend uses `svelte-dnd-action` with shared settings from `src/lib/dnd.ts`.

**Tech Stack:** SvelteKit + Svelte 5 (runes), Convex, valibot, vitest, Tailwind, `svelte-dnd-action` (new), Lucide icons via `$comp/icon.svelte` (`<Icon name="eye-off" />`).

**Spec:** `docs/superpowers/specs/2026-11-05-skin-ordering-and-hiding-design.md`

## Global Constraints

- Package manager is bun (`bun.lock`): add deps with `bun add`, run scripts with `bun run`.
- Commit messages: conventional style (`feat(scope): …`). **No `Co-Authored-By` trailer.**
- Icons: Lucide names through `Icon` (`eye`, `eye-off`), never emoji.
- Keep code simple. 2–3 repetitions are fine, no wrapper component for dnd (`src/lib/dnd.ts` holds settings only).
- `$convex` aliases `./convex`, so `src` may import pure modules from `$convex/lib/...`. Such modules must not import `_generated/server`.
- Relation write errors use `fail(status, message)` from `convex/lib/functions.ts`.
- Verification commands: `bun run test` (all vitest projects), `bun run check` (svelte-check + types), `bun run lint`.

## Review Focus

1. **Mixed positioned/unpositioned rows** (an old player gets one skin from the skin editor, then is saved from the player editor): order must be positioned first, then newest-first. Pinned in Task 1 (`mixes positioned and unpositioned`).
2. **Search while hidden skins are off** must not surface hidden skins. Guaranteed by filtering before `useListQuery` (Task 6, Step 4). Checked manually in Task 7.
3. **Duplicate ids in the admin PATCH body** must be a 400, not a silently reordered list. Pinned in Task 3 (`rejects duplicate skin ids`).
4. **Reordering alone (or only hiding) must make the player editor dirty**, and Discard must restore the original order and visibility. Pinned by the pure `skinsChanged` test in Task 5.
5. **Dropping files from the computer onto the images section must still add them** after the move to `svelte-dnd-action`, and clicking a tile's ✕ must not start a drag. Checked manually in Task 7.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `convex/lib/skin-order.ts` (new) | Pure `sortPlayerSkins`, shared by Convex and the dashboard |
| `convex/lib/skin-order.test.ts` (new) | Its tests |
| `convex/schema.ts` | `position`, `hidden` on `playerSkins` |
| `convex/lib/relations.ts` (+ test) | All relation writes: `setPlayerSkins`, `setSkinPlayers`, `reorderSkins`, `setSkinHidden` |
| `convex/players.ts` | `get` returns sorted skins with `hidden` + `order`; `update` takes `skins` |
| `convex/skins.ts` | `listWithPlayers` players carry `position` + `hidden` |
| `src/routes/api/players/[id]/+server.ts` (+ new test) | Body `skins: {id, hidden}[]`, duplicate check |
| `src/lib/dnd.ts` (new) | Shared dnd settings (flip duration, tilt/shadow transform, ghost class) |
| `src/routes/(admin)/dashboard/skin-images.ts` (+ test) | `ImageItem` gets `id`; `moveItem` removed |
| `src/routes/(admin)/dashboard/skin-editor.svelte` | Images use `dndzone` |
| `src/routes/(admin)/dashboard/player-skins.ts` (new, + test) | Pure `skinsChanged` for the editor's dirty check |
| `src/routes/(admin)/dashboard/player-editor.svelte` | Ordered `{id, hidden}` draft, `dndzone`, eye toggle |
| `src/lib/hooks/list-query.svelte.ts` (+ new `list-query.test.ts`) | `PLAYER_SKIN_LIST` with "Custom" sort |
| `src/lib/components/skin-card.svelte` | Optional `hidden` prop |
| `src/routes/(public)/player/[osuId]/+page.svelte` | Hidden toggle, uses `PLAYER_SKIN_LIST` |

---

### Task 1: Pure sort order

**Files:**
- Create: `convex/lib/skin-order.ts`
- Test: `convex/lib/skin-order.test.ts`

**Interfaces:**
- Produces: `sortPlayerSkins<T extends { position?: number; skin: { _creationTime: number } }>(entries: readonly T[]): T[]`. Returns a new array: entries with a `position` ascending first, then entries without one by `skin._creationTime` descending. Does not mutate the input.

- [ ] **Step 1: Write the failing tests** in `convex/lib/skin-order.test.ts`

```ts
const e = (id: string, created: number, position?: number) => ({ id, position, skin: { _creationTime: created } });
const ids = (list: { id: string }[]) => list.map((x) => x.id);

it("sorts positioned entries by position", () =>
	expect(ids(sortPlayerSkins([e("a", 1, 2), e("b", 2, 0), e("c", 3, 1)]))).toEqual(["b", "c", "a"]));
it("sorts unpositioned entries newest first", () =>
	expect(ids(sortPlayerSkins([e("a", 1), e("b", 3), e("c", 2)]))).toEqual(["b", "c", "a"]));
it("mixes positioned and unpositioned", () =>
	expect(ids(sortPlayerSkins([e("old", 1), e("new", 9), e("p1", 5, -1), e("p0", 2, 0)]))).toEqual(["p1", "p0", "new", "old"]));
it("does not mutate the input", () => { const input = [e("a", 1), e("b", 2)]; sortPlayerSkins(input); expect(ids(input)).toEqual(["a", "b"]); });
```

- [ ] **Step 2: Run and confirm it fails**: `bun run test convex/lib/skin-order.test.ts` → FAIL (module not found).
- [ ] **Step 3: Implement `sortPlayerSkins`** in `convex/lib/skin-order.ts`. Import only types (no `_generated/server`), so `src` can import it via `$convex/lib/skin-order`.
- [ ] **Step 4: Run and confirm it passes**: same command → PASS.
- [ ] **Step 5: Commit**: `git add convex/lib/skin-order*` → `feat(convex): add player skin sort order`

---

### Task 2: Schema and relation helpers

**Files:**
- Modify: `convex/schema.ts` (`playerSkins` table)
- Modify: `convex/lib/relations.ts`
- Test: `convex/lib/relations.test.ts`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces (all in `convex/lib/relations.ts`):
  - `type SkinEntry = { id: Id<"skins">; hidden: boolean }` (exported)
  - `setPlayerSkins(db, playerId, skins: SkinEntry[]): Promise<void>`. Array index = `position`. Duplicate ids: first occurrence wins.
  - `setSkinPlayers(db, skinId, playerIds)`: same signature as today.
  - `reorderSkins(db, playerId, skinIds: Id<"skins">[]): Promise<void>`
  - `setSkinHidden(db, playerId, skinId: Id<"skins">, hidden: boolean): Promise<void>`

- [ ] **Step 1: Add the schema fields** to `playerSkins` in `convex/schema.ts`, with the doc comments copied from the spec's Data model section:
  `position: v.optional(v.number())`, `hidden: v.optional(v.boolean())`.

- [ ] **Step 2: Extend the fake db and write the failing tests** in `convex/lib/relations.test.ts`
  - `Row` gains `position?: number; hidden?: boolean`. `fakeDb` gains `patch: async (id, fields) => Object.assign(row, fields)` and records each patched id in a returned `patched: string[]`.
  - Update the existing `setPlayerSkins` calls to pass `{ id, hidden: false }` entries.
  - New tests (`const at = (rows, s) => rows.find((r) => r.player_id === "p1" && r.skin_id === s)`):

```ts
// setPlayerSkins
it("saves array order as position and hidden flags", async () => {
	const { db, rows } = fakeDb([{ player_id: "p1", skin_id: "s1" }]);
	await setPlayerSkins(db, player("p1"), [{ id: skin("s2"), hidden: true }, { id: skin("s1"), hidden: false }]);
	expect(at(rows, "s2")).toMatchObject({ position: 0, hidden: true });
	expect(at(rows, "s1")).toMatchObject({ position: 1, hidden: false });
});
it("patches only rows whose position or hidden changed", async () => {
	const { db, patched } = fakeDb([
		{ player_id: "p1", skin_id: "s1", position: 0, hidden: false },
		{ player_id: "p1", skin_id: "s2", position: 1, hidden: false }
	]);
	await setPlayerSkins(db, player("p1"), [{ id: skin("s1"), hidden: false }, { id: skin("s2"), hidden: true }]);
	expect(patched).toHaveLength(1); // only s2
});
// existing "ignores duplicate ids" keeps passing: [{s1}, {s1}] → one row, position 0

// setSkinPlayers
it("puts a new relation on top of a player's custom order", async () => {
	const { db, rows } = fakeDb([{ player_id: "p1", skin_id: "s1", position: 0 }, { player_id: "p1", skin_id: "s2", position: 1 }]);
	await setSkinPlayers(db, skin("s3"), [player("p1")]);
	expect(at(rows, "s3")?.position).toBe(-1);
});
it("leaves position empty when the player has no custom order", async () => {
	const { db, rows } = fakeDb([{ player_id: "p1", skin_id: "s1" }]);
	await setSkinPlayers(db, skin("s2"), [player("p1")]);
	expect(at(rows, "s2")?.position).toBeUndefined();
});

// reorderSkins
it("sets positions from the given order and keeps hidden", async () => {
	const { db, rows } = fakeDb([{ player_id: "p1", skin_id: "s1", hidden: true }, { player_id: "p1", skin_id: "s2" }]);
	await reorderSkins(db, player("p1"), [skin("s2"), skin("s1")]);
	expect(at(rows, "s2")?.position).toBe(0);
	expect(at(rows, "s1")).toMatchObject({ position: 1, hidden: true });
});
it.each([
	["missing", ["s1"]],
	["extra", ["s1", "s2", "s3"]],
	["duplicate", ["s1", "s1"]]
])("rejects a %s id without writing", async (_, list) => {
	const { db, patched } = fakeDb([{ player_id: "p1", skin_id: "s1" }, { player_id: "p1", skin_id: "s2" }]);
	await expect(reorderSkins(db, player("p1"), list.map(skin))).rejects.toMatchObject({ data: { status: 400 } });
	expect(patched).toEqual([]);
});

// setSkinHidden
it("toggles hidden", async () => {
	const { db, rows } = fakeDb([{ player_id: "p1", skin_id: "s1" }]);
	await setSkinHidden(db, player("p1"), skin("s1"), true);
	expect(at(rows, "s1")?.hidden).toBe(true);
});
it("rejects a skin the player doesn't use", async () => {
	const { db } = fakeDb([{ player_id: "p2", skin_id: "s1" }]);
	await expect(setSkinHidden(db, player("p1"), skin("s1"), true)).rejects.toMatchObject({ data: { status: 404 } });
});
```

  The fake `withIndex` already filters on any `eq` fields, so `by_player_skin` works for `setSkinHidden`.

- [ ] **Step 3: Run and confirm they fail**: `bun run test convex/lib/relations.test.ts` → the new tests FAIL.
- [ ] **Step 4: Implement the four helpers** in `convex/lib/relations.ts`:
  - `setPlayerSkins`: dedupe by id (first wins), delete rows not in the list, insert missing rows with `{ position: index, hidden }`, and patch existing rows only when `row.position !== index || (row.hidden ?? false) !== hidden`.
  - `setSkinPlayers`: for each player being **added**, read their rows with `by_player`. If any has a position, insert with `position: min - 1`, otherwise insert without one. Removal is unchanged.
  - `reorderSkins`: valid only when `new Set(skinIds).size === skinIds.length`, it has the same size as the player's rows, and every id is one of them. Otherwise `fail(400, "Skin list doesn't match the player's skins")` before any write. Then patch changed positions only.
  - `setSkinHidden`: look the row up with `by_player_skin`; if it's missing, `fail(404, "Player doesn't use this skin")`; then patch `{ hidden }`.
  - Update the file's doc comments. `reorderSkins` and `setSkinHidden` note: "for the player settings page; cannot add or remove relations".
- [ ] **Step 5: Run and confirm they pass**: same command → PASS. Then `bun run test` → all PASS.
- [ ] **Step 6: Commit**: `feat(convex): store skin order and visibility on player relations`

---

### Task 3: Queries, admin mutation and API

**Files:**
- Modify: `convex/players.ts` (`get`, `update`)
- Modify: `convex/skins.ts` (`listWithPlayers`)
- Modify: `src/routes/api/players/[id]/+server.ts`
- Modify: `src/routes/(admin)/dashboard/player-editor.svelte:82` (temporary one-line body change)
- Test: `src/routes/api/players/[id]/body.test.ts` (new)

**Interfaces:**
- Consumes: `sortPlayerSkins` (Task 1); `setPlayerSkins`, `SkinEntry` (Task 2).
- Produces:
  - `api.players.get` returns `{ ...player, skins: (Doc<"skins"> & { hidden: boolean; order: number })[] }`, already sorted. `order` is the index in that sorted list. `PlayerWithSkins` in `src/lib/types.ts` follows automatically.
  - `api.skins.listWithPlayers`: each `skin.players[i]` is `Doc<"players"> & { position?: number; hidden: boolean }`. `SkinWithPlayers` follows automatically.
  - `api.players.update` arg `skins: v.array(v.object({ id: v.id("skins"), hidden: v.boolean() }))` replaces `skin_ids`.
  - `PATCH /api/players/[id]` body field `skins: { id: string; hidden: boolean }[]` replaces `skin_ids`. Exported schema `PlayerBody` from `+server.ts`, so it can be tested.

- [ ] **Step 1: Write the failing body test** in `src/routes/api/players/[id]/body.test.ts`, using `v.safeParse(PlayerBody, …)` from valibot:

```ts
it("accepts ordered skins with hidden flags", () =>
	expect(v.safeParse(PlayerBody, { skins: [{ id: "a", hidden: true }, { id: "b", hidden: false }] }).success).toBe(true));
it("rejects duplicate skin ids", () =>
	expect(v.safeParse(PlayerBody, { skins: [{ id: "a", hidden: false }, { id: "a", hidden: true }] }).success).toBe(false));
it("no longer accepts skin_ids alone", () =>
	expect(v.safeParse(PlayerBody, { skin_ids: ["a"] }).success).toBe(false));
```

- [ ] **Step 2: Run and confirm it fails**: `bun run test src/routes/api/players` → FAIL (`PlayerBody` not exported / no `skins`).
- [ ] **Step 3: Update the API route**: export `PlayerBody`; replace `skin_ids` with
  `skins: v.pipe(v.array(v.object({ id: convexId, hidden: v.boolean() })), v.check((list) => new Set(list.map((s) => s.id)).size === list.length, "must not contain the same skin twice"))`.
  Pass `skins` to `api.players.update`, casting `id` to `Id<"skins">` the way `skin_ids` was cast before.
- [ ] **Step 4: Update `players.update`** to take `skins` and call `setPlayerSkins(ctx.db, playerId, skins)`.
- [ ] **Step 5: Update `players.get`**: build entries `{ skin, position: r.position, hidden: r.hidden ?? false }` from relations, dropping deleted skins, then `sortPlayerSkins`. Return `skins: sorted.map((e, order) => ({ ...e.skin, hidden: e.hidden, order }))`.
- [ ] **Step 6: Update `skins.listWithPlayers`**: keep the relation alongside each player id, and return `players` entries as `{ ...player, position: r.position, hidden: r.hidden ?? false }`.
- [ ] **Step 7: Keep the dashboard working until Task 5**: in `player-editor.svelte` change the PATCH body to `skins: draft.skinIds.map((id) => ({ id, hidden: false }))`. Task 5 replaces this.
- [ ] **Step 8: Verify**: `bun run test` → PASS. `bunx convex codegen` (refreshes `_generated` types) then `bun run check` → 0 errors.
- [ ] **Step 9: Commit**: `feat: serve player skins in custom order and save order from the editor`

---

### Task 4: Shared drag settings + skin editor images

**Files:**
- Modify: `package.json` / `bun.lock` (`bun add svelte-dnd-action`)
- Create: `src/lib/dnd.ts`
- Modify: `src/routes/(admin)/dashboard/skin-images.ts`, `skin-images.test.ts`
- Modify: `src/routes/(admin)/dashboard/skin-editor.svelte` (script `imageKey`/`dragIndex`/`handleTileDragEnter`/`handleSectionDrop`; markup lines ~230–330)

**Interfaces:**
- Produces, in `src/lib/dnd.ts`:
  - `DND_FLIP_MS = 150`
  - `liftDraggedElement(element?: HTMLElement): void`, to pass as `transformDraggedElement`. It sets `transform: rotate(-2deg) scale(1.03)`, a large `box-shadow`, and `cursor: grabbing` on the dragged copy.
  - `GHOST_CLASS = "opacity-40 outline-2 outline-dashed outline-primary"` (Tailwind), applied in markup to the item where `item[SHADOW_ITEM_MARKER_PROPERTY_NAME]` is true.
  - `dndOptions<T extends { id: string }>(items: T[])` returning `{ items, flipDurationMs: DND_FLIP_MS, transformDraggedElement: liftDraggedElement, dropTargetStyle: {} }`. Both editors spread this into `use:dndzone`.
- `ImageItem` becomes `{ id: string; kind: "url"; url: string } | { id: string; kind: "file"; file: File; preview: string }`, where `id` is the url or the blob preview. `moveItem` is deleted.

- [ ] **Step 1: Update the test**: delete the `moveItem` describe block. Add `id` to every `ImageItem` literal in `skin-images.test.ts`. Add one test: `resolveImageUrls` on `[{id:"u1",kind:"url",url:"u1"}, file(id "blob:a"), {id:"u2",…}]` with `["up1"]` returns `["u1","up1","u2"]`.
- [ ] **Step 2: Run and confirm it fails at type level**: `bun run check` → errors (missing `id`). (Vitest doesn't type-check; this is the red step.)
- [ ] **Step 3: Update `skin-images.ts`**: add `id` to `ImageItem`, delete `moveItem`. `bun run test src/routes/\(admin\)` → PASS.
- [ ] **Step 4: `bun add svelte-dnd-action`** and create `src/lib/dnd.ts` per the Interfaces block.
- [ ] **Step 5: Migrate `skin-editor.svelte` images**
  - Create items with `id` (initial: `id: url`; added files: `id: preview`). Replace `imageKey(item)` with `item.id` (the dirty check compares `images.map((i) => i.id)`; `<img src>` uses `item.kind === "url" ? item.url : item.preview`).
  - Remove `dragIndex`, `handleTileDragEnter`, `animate:flip` and the tiles' `draggable` / `ondrag*` attributes. Put `draggable="false"` on the `<img>`.
  - The tiles grid becomes `<div use:dndzone={dndOptions(draft.images)} onconsider={(e) => (draft.images = e.detail.items)} onfinalize={(e) => (draft.images = e.detail.items)}>` and holds **only image tiles**, with `animate:flip={{ duration: DND_FLIP_MS }}` on each. Add `GHOST_CLASS` when it's the shadow item.
  - The "Drop images or click" tile moves out of the zone, to a full-width strip below the grid, because a dndzone may contain only its items.
  - "THUMBNAIL" stays on index 0, and the grip icon on the rest.
  - Keep the section's HTML5 `ondragover` / `ondrop` for files. `svelte-dnd-action` uses pointer events, so the `dragIndex === null` guards go away: `handleSectionDrop` just calls `addFiles(event.dataTransfer?.files)`.
- [ ] **Step 6: Verify**: `bun run test` → PASS. `bun run check` → 0 errors. `bun run lint` → clean.
- [ ] **Step 7: Commit**: `feat(dashboard): drag skin images with svelte-dnd-action`

---

### Task 5: Player editor: order and hide skins

**Files:**
- Create: `src/routes/(admin)/dashboard/player-skins.ts`
- Test: `src/routes/(admin)/dashboard/player-skins.test.ts`
- Modify: `src/routes/(admin)/dashboard/player-editor.svelte` (draft, dirty check, `addSkins`/`removeSkin`, skins section markup ~lines 267–315)

**Interfaces:**
- Consumes: `sortPlayerSkins` (Task 1, via `$convex/lib/skin-order`); `SkinWithPlayers` players with `position`/`hidden` (Task 3); `dndOptions`, `DND_FLIP_MS`, `GHOST_CLASS` (Task 4).
- Produces: `type DraftSkin = { id: Id<"skins">; hidden: boolean }` and `skinsChanged(a: readonly DraftSkin[], b: readonly DraftSkin[]): boolean`, true when the length, any id at an index, or any `hidden` at an index differs. Both in `player-skins.ts`.

- [ ] **Step 1: Write the failing tests** in `player-skins.test.ts`

```ts
const s = (id: string, hidden = false) => ({ id: id as Id<"skins">, hidden });
it("is false for identical lists", () => expect(skinsChanged([s("a"), s("b")], [s("a"), s("b")])).toBe(false));
it("detects a reorder", () => expect(skinsChanged([s("a"), s("b")], [s("b"), s("a")])).toBe(true));
it("detects a hidden change", () => expect(skinsChanged([s("a")], [s("a", true)])).toBe(true));
it("detects an added skin", () => expect(skinsChanged([s("a")], [s("a"), s("b")])).toBe(true));
```

- [ ] **Step 2: Run and confirm it fails**: `bun run test src/routes/\(admin\)/dashboard/player-skins.test.ts` → FAIL.
- [ ] **Step 3: Implement `skinsChanged`** → the tests PASS.
- [ ] **Step 4: Rework the editor's draft**
  - Initial `skins: DraftSkin[]`: for each skin in `allSkins` that has this player in `skin.players`, take that player entry's `position` and `hidden` and build `{ id, hidden, position, skin }`. Run `sortPlayerSkins`, then map to `{ id, hidden }`.
  - `isDirty` uses `skinsChanged(current.skins, initialDraft.skins)` in place of the sorted-ids compare.
  - `addSkins` **prepends** new ids as `{ id, hidden: false }`, and `removeSkin` filters them out. `AssignSkinsDialog` gets `assignedIds={draft.skins.map((s) => s.id)}`.
  - The PATCH body sends `skins: draft.skins` (replacing the Task 3 stopgap).
  - For rendering, look each skin doc up by id from `allSkins` (a `Map`) and keep `draft.skins` order. Skip ids that no longer exist.
- [ ] **Step 5: Rework the skins section markup**
  - The existing 2-column grid becomes the `dndzone` (`dndOptions(draft.skins)`, `onconsider` / `onfinalize` assign `draft.skins`), with `animate:flip`, and `GHOST_CLASS` on the shadow item.
  - Each row: thumbnail, name, author, then an eye toggle button (`Icon name={hidden ? "eye-off" : "eye"}`, `aria-label` "Show/Hide {name}", `aria-pressed={hidden}`) before the ✕.
  - Hidden rows: `grayscale brightness-60` on the thumbnail, `opacity-50` on the text, and the author line reads `by {author} · hidden`.
  - Hint text next to the header: "Drag to reorder · top-left shows first".
- [ ] **Step 6: Verify**: `bun run test` → PASS. `bun run check` → 0 errors. `bun run lint` → clean.
- [ ] **Step 7: Commit**: `feat(dashboard): reorder and hide a player's skins`

---

### Task 6: Profile page: custom sort and hidden toggle

**Files:**
- Modify: `src/lib/hooks/list-query.svelte.ts`
- Test: `src/lib/hooks/list-query.test.ts` (new; server project, imports the `.svelte.ts` module)
- Modify: `src/lib/components/skin-card.svelte`
- Modify: `src/routes/(public)/player/[osuId]/+page.svelte`

**Interfaces:**
- Consumes: `PlayerWithSkins["skins"][number]` = `Doc<"skins"> & { hidden: boolean; order: number }` (Task 3).
- Produces: `PLAYER_SKIN_LIST: ListConfig<PlayerSkin>` (`type PlayerSkin = PlayerWithSkins["skins"][number]`, exported from `src/lib/types.ts`) = `SKIN_LIST` options with a `byCustom` option first (`value: "custom"`, `label: "Custom"`, `ascIcon: "arrow-down-1-0"`, `descIcon: "arrow-up-1-0"`, compare `a.order - b.order`), `defaultSort: "custom"`, `defaultOrder: "asc"`. `SkinCard` prop `hidden?: boolean` (default false).

- [ ] **Step 1: Write the failing test** in `list-query.test.ts`

```ts
const custom = PLAYER_SKIN_LIST.sortOptions.find((o) => o.value === "custom")!;
const sk = (order: number) => ({ order }) as PlayerSkin;
it("defaults to custom ascending", () => expect([PLAYER_SKIN_LIST.defaultSort, PLAYER_SKIN_LIST.defaultOrder]).toEqual(["custom", "asc"]));
it("compares by server order", () => expect([sk(2), sk(0), sk(1)].sort(custom.compare).map((s) => s.order)).toEqual([0, 1, 2]));
```

- [ ] **Step 2: Run and confirm it fails**: `bun run test src/lib/hooks` → FAIL. If importing a `.svelte.ts` from the node project fails to compile, move the config objects to `src/lib/hooks/list-configs.ts`, re-export them from `list-query.svelte.ts`, and test that file instead.
- [ ] **Step 3: Add `PlayerSkin` and `PLAYER_SKIN_LIST`** → PASS.
- [ ] **Step 4: Update the profile page**
  - `let showHidden = $state(false)`; `const hiddenCount = $derived(data.player.skins.filter((s) => s.hidden).length)`.
  - `useListQuery(() => (showHidden ? data.player.skins : data.player.skins.filter((s) => !s.hidden)), PLAYER_SKIN_LIST)`. Filtering before the hook keeps search from finding hidden skins.
  - "Loaded N skins" counts `skins.results.length`.
  - Under it, when `hiddenCount > 0`: a text-style button with `Icon` `eye` + "Show hidden skins ({hiddenCount})", or `eye-off` + "Hide hidden skins" when `showHidden` is on. It toggles `showHidden`.
  - Render `<SkinCard {skin} hidden={skin.hidden} />`.
- [ ] **Step 5: `SkinCard` hidden style**: when `hidden`, wrap or style `ImageCarousel` with `grayscale brightness-60`, add `opacity-60` on the text block, and an absolutely positioned `eye-off` badge (`size-3.5`, `bg-black/60` round) at the image's top-right, with `title="Hidden by the player"`. The root needs `relative`.
- [ ] **Step 6: Verify**: `bun run test` → PASS. `bun run check` → 0 errors. `bun run lint` → clean.
- [ ] **Step 7: Commit**: `feat(profile): custom skin order and hidden skins toggle`

---

### Task 7: Manual verification in the running app

Use the `run` skill (or `bun run dev` plus the Convex dev deployment) and walk through:

- [ ] Dashboard player editor: drag a skin. It lifts tilted with a shadow, a ghost marks the drop spot, and the others animate. Save, reopen: same order.
- [ ] Hide a skin with the eye button: the row dims and reads "· hidden"; Save. Reorder only → Save becomes enabled. Discard restores order and visibility.
- [ ] Assign a new skin: it appears first.
- [ ] Skin editor: drag images with the same feel; the ✕ on a tile removes it without starting a drag; drop files from the computer onto the section → they're added; Save keeps the order.
- [ ] From the skin editor, assign the skin to a player who has a custom order → it shows first on their profile.
- [ ] Profile: default sort is "Custom" and matches the editor. Desc reverses it. The toggle shows "Show hidden skins (K)" only if K > 0. Hidden cards appear in place, dimmed, with the `eye-off` badge. Search doesn't find hidden skins while the toggle is off.
- [ ] Skin page of a hidden skin still lists the player.
- [ ] A player never edited still shows newest first.
- [ ] Final: `bun run test && bun run check && bun run lint` all clean. Commit any fixes as `fix: …`.
