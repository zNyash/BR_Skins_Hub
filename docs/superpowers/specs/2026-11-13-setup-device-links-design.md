# Linking Setup cards to devices

Date: 2026-11-13. Status: spec-reviewed, awaiting approval.

Spec 3 of the dashboard work (spec 1: `2026-11-08-admin-dashboard-design.md`, spec 2:
`2026-11-13-device-catalog-design.md`). Replaces the old "request workflow" idea. First part of
the dashboard work that touches the player profile.

Mockups: https://claude.ai/artifact/DXLDjC5G2XMbKdwS4ay7m7 (setup dialog choosing / linked,
profile Setup tab, dashboard Home).

## Goal

Setup cards (`setup.keyboard | tablet | mouse | monitor` on players) store `model` as free text
today. Link them to the `devices` catalog, so profiles show the real device: its name, photo and,
for tablets, its full active area.

Two ways a card gets linked:

1. **The player picks it.** The Model field in the setup dialog becomes a search field over the
   catalog, filtered to the card's type.
2. **The server matches it.** A typed name that confidently matches a catalog device is linked
   automatically; the rest show up on the dashboard for the admin to link or to turn into a new
   device.

Why: consistent names and photos across profiles ("ctl472" and "Wacom CTL-472" become the same
device), real tablet sizes for the area diagram, and fixing a device once fixes every player using
it.

## Non-goals

- The navbar "editing mode" toggle (owner sees their page as a visitor). Separate item; this spec
  only checks "can edit", which that toggle will narrow later.
- Pickers or links for the In-game and PC cards.
- Showing devices as their own public pages, or "who uses this device" lists.
- Device specs beyond what the catalog has (only tablets have sizes).
- The deferred minors from spec 2 and the pre-existing breakage on main (Popover client tests,
  `bun run lint`): not folded in.

## Anti-goals

- An automatic or admin link must never lose what the player typed: unlinking, or deleting the
  device, brings their text back. (A player's own pick from the list sets `model` to the device
  name: the text in the field was a search query, and the name is what they chose.)
- Auto-linking must never fight the player: once they remove a link, it stays removed until they
  type something else.
- Visitors don't download the catalog.

## Decisions

- **Device data wins on display.** A linked card shows the device's name, image and (tablets) full
  area. The card's own `model`, `full_w`, `full_h` stay stored, unused while linked, and come back
  when it's unlinked. Everything else (area, centre, rotation, filters, DPI, switch…) is always the
  player's.
- **Full area fallback.** A linked tablet whose device has no `full_w/full_h` (hand-made, sizes
  left empty) uses the card's own values, and those fields stay editable in the dialog.
- **The picker is on all four Model fields**, each listing only its own device type. An empty
  catalog for a type just behaves like today's text box.
- **The catalog is fetched when a setup dialog opens**, not by the page load: `GET
/api/devices?type=<type>`. Kept in memory for the rest of the visit (per type). Visitors and
  owners who never open a dialog never load it.
- **Auto-link on save** when the match is confident (rules below).
- **Re-check after catalog changes**: creating or renaming a device, and every OTD sync, re-runs
  the confident match over all unlinked cards. The first deploy runs it once too, so existing
  setups are linked on day one with no separate migration.
- **"Keep as typed" flag**: when the player (or an admin, on the profile) removes a link, the card
  gets `link: "manual"`. Auto-link skips such cards until their `model` text changes. The
  dashboard still lists them, so the admin can link them on purpose.
- **Deleting a device** (hand-made only; OTD tablets can't be deleted) unlinks every card pointing
  at it. Their typed text stays.
- **Changing a hand-made device's type** unlinks every card pointing at it, the same way (no flag),
  in `devices.upsert`; the re-check then runs as for any edit. _(Spec review: my call.)_
- **Only the admin links on the dashboard**; players link from their own dialog. Players can also
  unlink ("Not my tablet").

## Data

On `keyboardCard`, `tabletCard`, `mouseCard`, `monitorCard` in `convex/validators.ts`:

```ts
/** Linked catalog device. Its name, image and (tablets) full area replace the typed ones on display. */
device_id: v.optional(v.id("devices")),
/** "manual": the player removed a link; auto-link skips this card until `model` changes. */
link: v.optional(v.literal("manual")),
```

`device_id` and `link: "manual"` never coexist on a card. Setup patches keep replacing whole cards
(`applySetupPatch`), so the link travels with the card. `pruneCard` must not treat a card with only
`device_id` as empty. A card with only a link and no typed model is valid (picked from the list).

When a card is linked by picking, its `model` is set to the device's name at that moment, so
unlinking later shows a sensible text.

## Matching

A plain module, `convex/lib/deviceMatch.ts`, with a colocated test. Used by the save path, the
re-check, and the dashboard (the dashboard imports it via `$convex`).

- **Normalize**: lowercase, then drop everything that isn't a letter or digit. `"Wacom CTL-472"` →
  `wacomctl472`; `"ctl 472"` → `ctl472`.
- **Device keys**: each device has its normalized name, plus, for OTD tablets, its normalized name
  with the vendor removed. The vendor is the first segment of `otd_path` (`Wacom/CTL-472` → `Wacom`),
  and is stripped only when the name starts with it. Hand-made devices have only the full key.
- **Confident match**: the card's normalized `model` equals a key of exactly one device of the
  card's type. Two or more devices sharing that key → not confident (shown as a guess).
- **Guess**: no confident match → Fuse over the type's device names, best result above a threshold
  (builder picks the threshold; it only decides what's shown as "Closest", never links anything).
- **Groups for the dashboard**: unlinked cards with a non-empty `model`, grouped by `(type,
normalized model)`. Group label: the most common typed variant, upper-cased. Each group lists the
  distinct typed variants and the setup count.

## Save path

`players.updateSetup` (used by both the owner and admins) after `applySetupPatch`, for
each device-card in the patch:

1. Card has `device_id`: check the device exists and its type equals the card's type, else 400.
   Drop any `link`.
2. Card has `link: "manual"`: if the stored card had no flag (the player just set it), or its
   `model` equals the stored card's `model`, keep the flag and skip matching. If the stored card was
   already flagged and `model` changed, drop the flag and go to 3. _(Implementation ruling: a
   brand-new card kept as typed must not be auto-linked on its first save.)_
3. Otherwise run the confident match; if one is found, set `device_id`.

The API schema (`src/lib/server/schemas.ts` `setupPatch`) accepts `device_id` (string, normalized
in Convex) and `link: "manual"` on the four cards.

## Re-check

`internal.setupLinks.relinkAll` (internalMutation): loads devices and players once, runs the
confident match on every device-card with no `device_id` and no `link`, patches the players whose
cards changed. Scheduled with `ctx.scheduler.runAfter(0, …)` from:

- `devices.upsert` when a device is created, or its name or type changes;
- `devices.applyOtdBatch` when it added or updated anything;
- once after deploy (a one-off run from the Convex dashboard, or the same function called by hand;
  builder's call).

`devices.remove` clears `device_id` on every card pointing at the deleted device, in the same
mutation (no flag set: the card is free to auto-link again).

There are a few hundred players and ~400 devices, so a full scan is fine.

## Dashboard linking

`setupLinks.link` (adminMutation): `{ device_id, cards: [{ player_id, card }] }`. Sets `device_id`
and clears `link` on each listed card, checks type equality, bumps nothing else.
Route: `POST /api/setup-links` (`requireAdmin` → `parseBody` → `mutate` → 204), then
`invalidate("app:players")`.

## API

- `GET /api/devices?type=tablet|keyboard|mouse|monitor`: signed-in users (`requireUser`). Returns
  `{ _id, name, image_url, full_w, full_h }[]` for that type. The catalog is public data; the
  sign-in check only keeps the endpoint to people who can have a setup. Calls the existing public
  `devices.list` and filters, or a new `listByType` query using the `by_type` index (builder's
  call).
- `POST /api/setup-links`: above.
- `PATCH /api/players/[id]/setup`: unchanged route, schema gains the two fields.

## Profile

- **`players.get`** also returns the linked devices: `devices: Record<cardId, { _id, name,
image_url, full_w, full_h }>` for cards whose `device_id` resolves. A dangling id (shouldn't
  happen after `remove` cleans up) is treated as unlinked.
- **Setup panel** (`setup-panel.svelte`): the `model` snippet's 80×56 box shows the device image
  (`object-cover`) when linked and the device has one; otherwise the type icon as today. The name is
  the device's name when linked. The keyboard's larger photo slot does the same. Visitors can't
  tell a linked card without an image from a typed one; that's fine.
- **Tablet diagram** uses the effective full area (device's, else card's).
- **Dashboard player editor's Setup preview** (`setup-preview.svelte`) renders the same panel; it
  gets the devices from the dashboard layout's `devices` list instead of `players.get`.

## Setup dialog (profile)

Mockup artboards "Setup dialog · choosing a device" and "· linked card".

- **Model field = search field** (shadcn-svelte `command`, installed with
  `bunx shadcn-svelte@latest add command`, restyled to the design tokens; not the button-triggered
  Combobox example). Focusing it fetches the type's catalog (first time) and opens the list under
  the field; typing filters it; ↑/↓ move; Enter or click picks; Esc closes the list keeping the
  text.
- **List rows**: 48×32 thumbnail (image or type icon), name, and for tablets the full area
  ("152 × 95 mm"). A count caption on top ("5 tablets"). Last row: "Not listed? Keep "…" as typed",
  which closes the list, keeps the text and sets `link: "manual"`, so saving doesn't auto-link
  it: choosing it is the player saying "this isn't in your list". Closing the list with Esc or by
  leaving the field sets no flag, so auto-link still runs on save. _(Spec review: my call.)_ A hint line: "↑ ↓ move · Enter
  choose · Esc close".
- **Picking** sets `device_id` and `model = device.name` in the draft; the field turns into the
  linked block.
- **Linked block**: photo (64×40), device name, caption "From the catalog" (+ "· full area 152 ×
  95 mm" for tablets), and a ghost button "Not my <type>" ("Not my tablet", "Not my mouse"…).
  Clicking it clears `device_id`, sets `link: "manual"`, and turns the block back into the search
  field with the old text.
- **Linked tablet, device has sizes**: the two Full area fields are replaced by one locked,
  dashed-outline field showing the device's size with a lock icon, and the caption "The full area
  comes from the device, so the position diagram matches the real tablet." Device without sizes:
  the fields stay editable.
- **OTD settings.json import names the tablet.** Today `applyProfile` fills `model` only when it's
  empty (`draft.model || profile.tablet`). New rule: when the imported tablet name differs from the
  card's current name (the linked device's name, else the typed `model`), `model` becomes the
  imported name and `device_id` and `link` are cleared; the save path's auto-link then links it
  (OTD names match the catalog exactly). Same name: model and link stay as they are. The import
  file comes from the tablet's own driver, so it's trusted over what the card had. _(Decided in
  spec review.)_
- Loading state while the catalog fetch is in flight: the list shows a short loading row; a failed
  fetch shows an error row and the field keeps working as free text.

## Dashboard Home

Mockup artboard "Dashboard Home · unlinked setups".

- New card **Setups to link** (link icon), above Needs attention, only when there are groups.
  Header trailing caption: "3 groups · 8 setups". Computed client-side from the layout's `players`
  and `devices` with `deviceMatch.ts`; confident matches never appear (they're already linked, or
  the re-check will link them).
- **Row per group** (layer-2 block): type icon, group label (upper-cased), caption with the setup
  count and either the typed variants ("typed as "ctl 4100", "CTL4100"") or "not in the catalog"
  or, when every card in it is flagged, "the player removed the link, kept as typed". Under it,
  when there's a guess: "Closest:" with a small thumbnail and the device name.
- **Flagged cards are listed** even when their text confidently matches a device ("confident
  matches never appear" applies to unflagged cards only). Their "Closest" may be the very device
  the player rejected; showing it is useful, and linking it anyway is the admin's call.
  _(Spec review: my call.)_
- **Choose…** (secondary): opens a device picker dialog (the same Command list as the profile, as a
  dialog like assign-players/skins), filtered to the group's type, with the closest guess on top.
  Picking links every card in the group (`POST /api/setup-links`).
- **Create device** (ghost, shown when there's no guess): opens the existing device creator dialog
  with name (the most common typed variant, as typed) and type prefilled. After creation the
  re-check links the group if the new name matches confidently; otherwise the admin uses Choose….
- Phone: the row's buttons wrap under the text; the card follows the existing Home card patterns.

## Testing

- `device-match`: normalize; confident with and without vendor; ambiguous key → not confident;
  hand-made device has no vendor-less key; grouping and labels; manual-flagged cards excluded from
  auto-link but included in groups.
- Save path: picked device of the wrong type → 400; manual flag kept when `model` unchanged and
  dropped when it changes; confident auto-link on save; `device_id` and `link` never both set.
- `applySetupPatch`/`pruneCard` with link fields.
- `relinkAll`: links only unlinked, unflagged cards; leaves others untouched.
- `devices.remove` clears links; a hand-made device's type change clears links.
- Dashboard groups helper, like `derive.test.ts`.
- Setup panel/dialog component tests where the existing client test setup allows (the Popover
  client tests are already failing on main; don't block on them).

## Left to the builder

- Fuse threshold for guesses.
- `listByType` query vs filtering `list`.
- How the one-off first `relinkAll` run is triggered.
- Whether the dashboard device picker and the profile Model field share one `device-picker`
  component in `$comp` (likely, as they're the same list).
- Exact shape of the devices map returned by `players.get` (by card id, or embedded per card).
