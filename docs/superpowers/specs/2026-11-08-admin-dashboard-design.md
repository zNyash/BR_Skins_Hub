# Admin dashboard redesign

The current `/dashboard` is one screen: a sidebar list (players or skins) and an editor panel. It has no phone layout, and the admin (the only user, often on a phone) wants it easier to scan and use. This spec replaces it with a new dashboard: a shell with a collapsible rail, a Home page, and Players and Skins pages built as list + editor.

This is spec 1 of 3:

1. **New dashboard (this spec):** shell, Home, Players, Skins, phone layout.
2. **Device catalog:** a `devices` table seeded from OpenTabletDriver's tablet configs, and a Devices page in this shell.
3. **Device requests:** model names typed on Setup cards become requests (approve, reject, point to a device), and the smart "looks like device X" suggestions on Home.

Mockups: the "Admin Dashboard Redesign" canvas, page "Round 3" (playable desktop board plus phone home and drawer). Rounds 1 and 2 are kept there for reference.

## Decisions

- The main jobs are adding and editing players and skins. Everything is designed around those; requests are rare.
- Desktop and phone share pages and data; only the layout changes at 900px.
- Lists are still loaded whole and searched client-side with Fuse.js. A real search query language is a later, separate spec.
- "Needs attention" counts open the existing Players / Skins pages with a filter, not new pages.
- Resizing uses our own small helper (`use:resizable`), not PaneForge: PaneForge sizes panes in percentages, which can't express "the editor keeps a fixed max width and only shrinks when the list runs out of room".
- The sidebar has two states: a rail (collapsed, expands on hover) and pinned (open, takes space). `Ctrl+B` toggles.
- Unsaved changes block leaving the editor (Discord style), with a floating bar to reset or save.
- The Setup tab shows a read-only summary with a link to the profile, where admins can already edit Setup. A dashboard Setup editor can come later.
- The skin cards will be redesigned from scratch in a later spec, so the skin grids here stay simple.
- No Convex changes.

## Routes and data

| Route                     | Shows                          |
| ------------------------- | ------------------------------ |
| `/dashboard`              | Home                           |
| `/dashboard/players`      | Players list, editor empty     |
| `/dashboard/players/[id]` | Players list, that player open |
| `/dashboard/skins`        | Skins list, editor empty       |
| `/dashboard/skins/[id]`   | Skins list, that skin open     |

- The filter is a query param, kept when moving between items: `?filter=no-skins | no-setup | not-synced` (players), `?filter=no-players | no-images` (skins). An unknown value means no filter.
- The editor's tab is a query param too (`?tab=profile | skins | links | setup`), default `profile`.
- `(admin)/dashboard/+layout.server.ts` loads `players.list` and `skins.listWithPlayers` once, with `depends("app:players")` and `depends("app:skins")`, plus the layout cookie (below). Child routes read it from `parent()`; selecting an item only changes the URL, so it doesn't refetch.
- Every dashboard `load` (layout and pages) checks the admin itself, not only `(admin)/+layout.server.ts`: a page load must never rely on a parent layout having run.
- Writes use the existing endpoints: `POST /api/players`, `PATCH|DELETE /api/players/[id]`, `POST /api/players/sync`, `POST /api/skins`, `PATCH|DELETE /api/skins/[id]`.
- Reused as they are: `player-creator-dialog`, `skin-creator-dialog`, `delete-dialog` (type the name), `assign-skins-dialog`, `assign-players-dialog`, `tag-input`. They move to the new route folders.
- The old `+page.svelte`, `player-editor.svelte` and `skin-editor.svelte` are removed once their pieces are moved over. `player-skins.ts` and `skin-images.ts` (and their tests) stay.

### Derived data (`src/routes/(admin)/dashboard/derive.ts`)

Pure functions, tested:

- `skinCountByPlayer(skins)` → `Map<playerId, number>` from `listWithPlayers`.
- `setupFilled(player)` → number of present cards out of 6, via `presentCards` from `$lib/setup`.
- `isStale(player, now)` → `synced_at` missing or older than 30 days.
- `playerFilters` / `skinFilters`: `{ id, label, test }` lists for the chips and the Home counts. Players: no skins, no setup (0 cards), not synced. Skins: no players, no images (`preview_images` empty).
- `parseFilter(kind, value)` → a known filter id or `null`.
- `step(list, id, delta)` → the id `delta` places away in `list`, wrapping around. With `id` not in the list it returns the first item.
- `recentlyEdited(players, skins, n)` → the `n` newest of both by `updated_at`, items without it last.

## Shell

### Desktop (≥ 900px)

- **Rail (default):** 64px wide, icons only: Home, Players, Skins, then the pin button and "Back to site" at the bottom. Hovering expands it to its pinned width **over** the page (shadow, no layout shift); labels and counts fade in.
- **Pinned:** `Ctrl+B` (or the pin button) pins it open; only shown pinned at ≥ 1200px (narrower, it stays the rail without changing the cookie). It then takes real space and pushes the page over, and its right edge is a resize handle (200–320px, default 240). `Ctrl+B` again goes back to the rail. `Ctrl+B` is ignored while typing in an input or textarea.
- **List + editor:** the page area is a row: the list (`flex: 1 0 360px`) and the editor (`flex: 0 1 <saved width>`, `min-width: 440px`). A resize handle sits between them (440–960px, default 720). The saved width is the editor's maximum: on a wide screen the list takes the extra room; the editor only shrinks when the list would go under 360px.
- **Editor content** reflows by the editor's own width with a container query (`container-type: inline-size`): the form is two columns, one column under 560px.

### `use:resizable` (`src/lib/resizable.ts`)

A Svelte action on the handle element, on native pointer events, written like `use:sortable`:

- Options: `{ min, max, value, side: "left" | "right", onResize(px), onCommit(px) }`. `side` says which edge the handle sits on, so dragging left grows a right-side panel.
- Pointer drag calls `onResize` with the clamped width on every move, and `onCommit` once on release. Arrow keys on the focused handle move 16px (`Shift` 64px) and commit. Double-click resets to the default (`onCommit(null)`).
- The handle is a `role="separator"` with `aria-orientation="vertical"`, `aria-valuenow/min/max`, `tabindex="0"`, a 4px hit area that shows a 2px accent line on hover and focus.
- Pure helpers exported for tests: `clampWidth(px, min, max)` and `widthFromPointer(startWidth, startX, x, side)`.

### Layout cookie (`src/lib/dashboard-layout.ts`)

- One cookie, `dashboard_layout`, JSON `{ pinned: boolean, rail: number, editor: number }`, written on commit and on `Ctrl+B` (`path=/dashboard`, one year, `SameSite=Lax`). Not `httpOnly`: the client writes it.
- `parseLayout(raw)` returns defaults for a missing or broken cookie and clamps each number to its range. The layout load reads it, so the server renders the saved sizes and there's no jump on load.

### Phone (< 900px)

- No rail. Bottom tab bar: Home, Players, Skins.
- No resize handles, no `Ctrl+B`.
- The list fills the screen. Opening an item (same URLs) shows the editor as a **drawer**: a bottom sheet from 96px below the top, drag handle, header, segmented tabs, scrolling body. Closing it (✕, swipe down past a threshold, or browser back) goes back to the list URL.

### Scrollbars (site-wide, `src/routes/layout.css`)

```css
* {
	scrollbar-width: thin;
	scrollbar-color: color-mix(in oklch, var(--accent-color) 30%, transparent) transparent;
}
```

Plus the `::-webkit-scrollbar` fallback (6px, transparent track, rounded thumb, no buttons) for browsers without `scrollbar-color`. Horizontal card rows on phones hide the bar (`scrollbar-width: none`). Scrolling lists get 4px of inner padding (and -4px margin) so rows' hover and focus rings aren't clipped by the scroll box.

## Home

- **Actions:** "New player" (accent) and "New skin" tiles. They open the existing creator dialogs; after creating, the dashboard goes to the new item's editor.
- **Recently edited:** `recentlyEdited(players, skins, 6)`: avatar (round) or thumbnail (square), name, "Player" / "Skin", relative time. Each row links to its editor.
- **Needs attention:** one row per filter with a count above 0: "Players with no skins", "Players with no setup", "Not synced with osu! in 30 days", "Skins with no players", "Skins with no images". Each links to its list with the filter. With nothing to show: "All good."
- Phone: the same blocks; Needs attention becomes a swipeable row of count cards.
- The device requests tile and the smart device suggestions are added by spec 3.

## Lists

Shared by Players and Skins.

- Header: title, "+ New" (opens the creator dialog), search input (Fuse, as today via `useListQuery`), filter chips (with counts), "n of N shown", sort (last edited, A–Z; last edited by default).
- Rows: 12px padding, 12px radius, background `layer-1`, hover `layer-2`, selected `layer-3`. No accent outline. The selected row has `aria-current="true"`. Rows are links (`<a href>` to the item URL, keeping `?filter`).

### Player row

- The cover as a banner on the left 60% of the row, faded into the row background with a mask (`mask-image: linear-gradient(90deg, #000 15%, transparent)`).
- On the banner: avatar (40px, round) and name (with a light text shadow for contrast).
- On the plain part: "12 skins", six setup dots (filled per present card), last edited.
- Cover states: loading shows a shimmer in the banner area; if the image fails, no banner and a small "cover failed to load" under the name (error color). Players without a cover have no banner.

### Skin row

Thumbnail (first preview image, 64×40, rounded), name, "3 players · 4 images", last edited.

## Editors

Shared frame: an elevated card (`layer-1`, 16px radius) in the editor column.

- **Header:** avatar or thumbnail, name, a sub line, the **stepper** (‹ `n/N` › through the current filtered and sorted list, via `step`), and a ⋯ menu. Players also get **View profile ↗** and a faded cover behind the header.
- **⋯ menu:** players: "Sync with osu!" (existing `POST /api/players/sync`), "Delete…". Skins: "Delete…". Delete opens the type-the-name dialog; after deleting, the editor closes (list URL, filter kept).
- **Empty editor** (list URL with no item): "Select a player" / "Select a skin" with the "+ New" button.

### Player editor tabs

- **Profile:** Name, Cover URL; Bio (with the 0/200 counter); Profile color (the swatches and hue slider from the owner's Colors card, `colors-card.svelte`; its picker part is extracted into a shared component if it's tied to saving there, replacing today's plain number input), Tags (`tag-input`); Description (About tab) as a full-width textarea. Two columns, one under 560px.
- **Skins:** a grid of the player's skins (thumbnail, `#position`, name, author). Reordered by dragging with `use:sortable`. Each card has an eye icon button to hide it from the profile (hidden cards are greyed out, "hidden from profile"). "+ Assign skins" opens `assign-skins-dialog`; new skins go to the front. Removing a skin is a ✕ on hover/focus.
- **Links:** the same editing as the profile's Links card (`links-card.svelte`: type, value, reorder, remove, add, empty links blocked), sharing its logic instead of copying it where that's simple.
- **Setup:** a read-only summary of present cards (one line each: card name and model, "–" for empty), and "Edit on profile ↗" (opens `/player/[osuId]?tab=setup`). With no setup: "No setup yet."

Tab labels carry counts: "Skins · 12", "Links · 3", "Setup · 4/6".

### Skin editor

One scrolling form, no tabs: Name, Author; Download link; Tags; Images (sortable, first is the thumbnail, add/remove as today via `skin-images.ts`); "Used by" (player chips, "+ Assign players" via `assign-players-dialog`, ✕ to unassign). A skin with no players shows a notice: "Nobody uses this skin. Assign it to a player, or delete it to free up space." with Assign and Delete buttons.

## Unsaved changes

- Each editor holds one draft (all tabs). It's dirty when it differs from the loaded item (same comparisons as today's editors, including skin order and hidden flags).
- While dirty, an **unsaved bar** floats at the bottom center of the page area: "Careful — you have unsaved changes!", **Reset**, **Save changes** (success color). Background `layer-2`, 12px radius, shadow, slides up on show. On phones it sits above the drawer's bottom edge.
- Save sends one `PATCH` with the changed fields, shows a toast, then `invalidate`s the list. Reset restores the draft from the loaded item.
- **Blocking:** while dirty, navigating to another item, page, filter or stepper target is cancelled (`beforeNavigate`), and the bar shakes and flashes the error color for 600ms. Switching editor tabs is allowed (same draft). Closing or reloading the tab uses the browser's own `beforeunload` prompt.
- Errors from the API keep the draft and show the backend message in a toast, as `request()` does today.
- Implemented as a small shared module, `src/routes/(admin)/dashboard/unsaved.svelte.ts` (`{ dirty, shake(), register(isDirty, reset, save) }`), so both editors and the bar use one state.

## Styling

- Dark only, the existing oklch layer tokens and the page hue. No new colors except the shimmer and mask gradients.
- All spacing on the 4px grid; cards and tiles use equal padding on all sides.
- Touch targets ≥ 44px on phones.

## Out of scope

- Devices page and the device catalog (spec 2).
- Device requests, the requests tile, smart suggestions (spec 3).
- A search query language.
- A dashboard Setup editor.
- The skin card redesign.

## Tests

- `derive.test.ts`: skin counts, `setupFilled`, `isStale` (missing, 29 and 31 days), each filter, `parseFilter` (known, unknown, missing), `step` (forward, back, wrap, id not in list, empty list), `recentlyEdited` (mixed kinds, missing `updated_at`).
- `resizable.test.ts`: `clampWidth`, `widthFromPointer` for both sides.
- `dashboard-layout.test.ts`: `parseLayout` (missing, broken JSON, out-of-range numbers, valid).
- `unsaved.svelte.test.ts` (browser project): navigating while dirty is cancelled and triggers the shake; tab switch while dirty is allowed; Reset clears dirty.
