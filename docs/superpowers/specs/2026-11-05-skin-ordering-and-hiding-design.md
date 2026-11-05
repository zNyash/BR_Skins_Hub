# Player skin ordering and hiding

Date: 2026-11-05

## Goal

Each player's skins can be put in a custom order and individually hidden. The custom order is the default view on the player's profile. Hidden skins are not shown unless a visitor turns on a "Show hidden skins" toggle.

Admins edit order and visibility from the dashboard player editor now. A player settings page (later, not in this spec) will let a player edit **only their own** order and visibility. Players can never assign or unassign skins.

The drag-and-drop feel (lift with tilt and shadow, plus a ghost placeholder) is shared with the skin editor's preview-image reordering, so both lists behave the same.

## Decisions

- Order and visibility belong to the **player–skin relation**, so both are stored on `playerSkins` rows. There is no separate array on the player, which would duplicate the relation and need syncing everywhere relations change.
- Players with no custom order look exactly as they do today (newest first). No data migration.
- New skins assigned to a player with a custom order appear **at the top**.
- Hidden skins are still public data. They are sent to the client, and the skin's own page (`/skins/[skinId]`) still lists the player. Hiding tidies the profile; it does not hide the association.
- Hidden skins are shown **in their place in the order**, marked as hidden. They are not grouped at the end.
- Only shared backend helpers are built for the player side. The player mutations and endpoints come with the settings page.
- Skin preview images keep their existing array storage (`skins.preview_images`). Only their drag UI changes.

## Data model

`convex/schema.ts`, table `playerSkins`, two new optional fields:

```ts
/** Lower shows first. Missing = falls back to date order (newest first). */
position: v.optional(v.number()),
/** Hidden from the profile unless "Show hidden skins" is on. Missing = visible. */
hidden: v.optional(v.boolean())
```

No new index. A player's relations are already read with `by_player` and sorted in memory.

## Backend

### Read: `players.get`

Returns the player's skins **already sorted**, each with `hidden: boolean` and `order: number` (its index in the sorted list).

The sort lives in a pure, tested function `sortPlayerSkins` (in `convex/lib/relations.ts`):

1. Rows with a `position`, ascending.
2. Then rows without one, by the skin's `_creationTime` descending.

### Writes

All in `convex/lib/relations.ts`.

**`setPlayerSkins(db, playerId, skins: { id, hidden }[])`** (admin player editor). The array order is the custom order.

- Missing relations are inserted with `position = index` and `hidden`.
- Relations not in the list are deleted.
- Existing rows are patched **only if** their `position` or `hidden` differs.

**`setSkinPlayers(db, skinId, playerIds)`** (admin skin editor). Unchanged, except for the position of new relations:

- If the player has any positioned rows, the new row gets `position = min(position) - 1`. Positions may go negative.
- Otherwise it gets no position, and the date fallback already shows it first.
- New rows are visible.

**`reorderSkins(db, playerId, skinIds)`** (for the future settings page; built and tested now, not exposed):

- `skinIds` must be exactly the player's current skins, with no missing, extra or duplicate ids. Otherwise `fail(400, "Skin list doesn't match the player's skins")`, with nothing written.
- Sets `position = index`, patching only changed rows. Never touches `hidden`.

**`setSkinHidden(db, playerId, skinId, hidden)`** (for the future settings page; built and tested now, not exposed):

- `fail(404, ...)` if the player doesn't use that skin.
- Patches `hidden`.

Neither player-side helper can create or delete a relation, so "players can't change which skins they use" holds in the data layer.

### Admin API

- `convex/players.ts` `update`: the `skin_ids: v.array(v.id("skins"))` argument becomes `skins: v.array(v.object({ id: v.id("skins"), hidden: v.boolean() }))`.
- `src/routes/api/players/[id]/+server.ts`: the body field `skin_ids` becomes `skins: array({ id: convexId, hidden: boolean })`. Duplicate ids are rejected with 400.

## Frontend

### Shared drag behavior

- Add dependency `svelte-dnd-action`.
- `src/lib/dnd.ts`: shared settings only (no wrapper component). It holds the animation duration, a `transformDraggedElement` that applies a slight tilt and a shadow to the dragged copy, and the class used for the placeholder (ghost: faded, dashed outline).
- Both lists use `use:dndzone` with `onconsider` / `onfinalize`. Dragging starts only after pointer movement, so a plain click stays a click. This keeps room for a future click-to-open image viewer.

### Dashboard player editor (`player-editor.svelte`)

- The draft's `skinIds: Id[]` becomes `skins: { id, hidden }[]`. Newly assigned skins (from `AssignSkinsDialog`) are added at the **front**.
- The skins section becomes a `dndzone`, keeping the current 2-column row cards (thumbnail, name, author).
- Each row gets an `eye` / `eye-off` toggle button (Lucide, via `Icon`) next to the ✕ unassign button. A hidden row is dimmed (greyscale thumbnail, faded text) and its author line reads "by X · hidden".
- The unsaved-changes check compares `skins` in order, including `hidden`. Today it sorts the ids first, which would miss a reorder.
- Saving sends `skins` in the PATCH body.

### Skin editor images (`skin-editor.svelte`, `skin-images.ts`)

- The hand-written HTML5 drag code (`dragIndex`, `handleTileDragEnter`) is replaced by `dndzone` with the shared settings. The tiles, the "first image is the thumbnail" rule and the remove button stay the same.
- Each `ImageItem` gains an `id`: the url for uploaded images, the blob preview for pending ones.
- Dropping files from the computer onto the section to add images works as before. It applies only when the drop carries files, not when it is a reorder.
- `moveItem` and its tests are removed.

### Profile page (`/player/[osuId]`)

- `list-query.svelte.ts`: a new `PLAYER_SKIN_LIST` config, which is `SKIN_LIST` plus a `custom` sort option ("Custom") comparing `a.order - b.order`, with `defaultSort: "custom"`, `defaultOrder: "asc"`. Desc reverses the custom order.
- A `showHidden` state, false by default. `useListQuery` receives the skins with hidden ones filtered out unless `showHidden` is true.
- The toggle sits under "Loaded N skins" (N = skins currently shown):
  - off: `eye` icon + "Show hidden skins (K)"
  - on: `eye-off` icon + "Hide hidden skins"
  - not rendered when the player has no hidden skins.
- `SkinCard` gains an optional `hidden` prop: a dimmed, greyscale image, faded text, and a small `eye-off` badge in the image corner. Hidden cards appear in their normal sorted position.

## Errors

- Mismatched reorder list: 400. Hide toggle for an unused skin: 404. Duplicate ids in the admin body: 400.
- Convex mutations are atomic, so a failed save writes nothing.
- The editors keep the draft on failure and show the existing error toast.

## Testing

Vitest, extending `convex/lib/relations.test.ts`. Its fake `db` gains `patch`.

- `setPlayerSkins`: positions follow array order; unchanged rows aren't patched; `hidden` is saved; add and remove still work.
- `setSkinPlayers`: a new relation gets `min - 1` when the player has positions, and none when it doesn't.
- `reorderSkins`: accepts a permutation; rejects missing, extra and duplicate ids without writing; never changes `hidden`.
- `setSkinHidden`: toggles the flag; rejects a skin the player doesn't use.
- `sortPlayerSkins`: positioned rows first by position, then unpositioned rows newest first, and a mix of both.
- `PLAYER_SKIN_LIST` custom compare: asc keeps server order, desc reverses it.
- `skin-images.ts`: `resolveImageUrls` keeps the order with the new `id` field.
- Manual check in the running app: drag skins and images (tilt and ghost), hide a skin, save; the profile shows the same order; the toggle shows and hides hidden skins and is absent when none are hidden; the skin page still lists the player.

## Out of scope

- The player settings page and its endpoints (exposing `reorderSkins` and `setSkinHidden` to the logged-in player).
- A fullscreen image viewer (click a preview image to open it). It will be designed separately.
