# Setup tab

Date: 2026-11-06

## Goal

Part 3 of the profile redesign: a **Setup** tab showing a player's keyboard, tablet, mouse, monitor, in-game settings and PC, edited per card by the player or an admin. Device models are free text in this part; part 4 (device catalog) links them to catalog devices.

Mockup: "K · Tall tablet + stacked mouse/monitor" on the "Player Profile Redesign" design canvas. Layout K is the full-data case; other combinations follow the layout rule below.

## Scope

In: the `setup` data on `players`, one endpoint and mutation shared by owner and admins, the Setup panel with its cards and edit dialogs, the layout rule, visibility.

Out (part 4): the `devices` table, device photos, the dashboard devices page and its request queue, `device_id` links, official specs overriding typed ones (e.g. a tablet's full area). Nothing in part 3 creates request records: part 4 builds its queue from the typed `model` values, grouped by a case- and space-insensitive key and shown in ALL CAPS on the dashboard only. Profiles always show the model as typed.

## Data model

One optional object on `players` (validators in `convex/validators.ts`):

```ts
setup?: {
	main_input?: "tablet" | "mouse",
	keyboard?: {
		model?: string,
		switch?: string,
		actuation?: number,      // mm
		rapid_trigger?: "enabled" | "disabled" | "unsupported",
		rt_press?: number,       // mm, used only when rapid_trigger is "enabled"
		rt_release?: number      // mm; set = press and release are shown separately
	},
	tablet?: { model?: string, area_w?: number, area_h?: number, center_x?: number, center_y?: number, full_w?: number, full_h?: number }, // mm
	mouse?: { model?: string, dpi?: number, polling_hz?: number },
	monitor?: { model?: string, refresh_hz?: number, res_w?: number, res_h?: number, size_in?: number },
	in_game?: { sensitivity?: number, raw_input?: boolean, cursor_size?: number, frame_limiter?: string, audio_offset_ms?: number },
	pc?: {
		cpu?: string, gpu?: string, motherboard?: string, ram?: string, cooler?: string,
		storage?: { kind: "nvme" | "sata_ssd" | "hdd", name: string }[]
	}
}
```

- **Empty means absent.** Strings are trimmed; empty strings and blank numbers are dropped; storage rows with an empty name are dropped. A card left with no fields is removed, and an empty `setup` is removed. So "card has data" = its key exists.
- **One RT value or two.** Only `rt_press` set → one "Rapid trigger" value. `rt_release` also set → "press" and "release". There is no separate "split" flag. `rt_press`/`rt_release` are ignored for display unless `rapid_trigger` is `"enabled"`, but they are kept so toggling RT off and on doesn't lose them.
- **Storage kinds** describe the drive, not the slot: labels "NVMe SSD", "SATA SSD", "HDD". Capacity goes in `name` ("Samsung 990 Pro 2TB").
- **`frame_limiter` is free text**, since osu! stable and lazer name the options differently.
- **`main_input`** can point at an empty card; the badge then simply doesn't show.
- **Part 4 hook:** part 4 adds an optional `device_id` (many cards → one device) next to `model` on keyboard, tablet, mouse and monitor. Adding an optional field needs no migration, so part 3 doesn't add it.

### Validation ranges (server, valibot)

| Field                                 | Rule                   |
| ------------------------------------- | ---------------------- |
| `actuation`, `rt_press`, `rt_release` | 0.01–4 mm              |
| tablet `area_*`, `full_*`             | > 0 and ≤ 500 mm       |
| tablet `center_*`                     | 0–500 mm               |
| `dpi`                                 | integer 1–100000       |
| `polling_hz`                          | integer 1–10000        |
| `refresh_hz`                          | 1–1000                 |
| `res_w`, `res_h`                      | integer 1–10000        |
| `size_in`                             | 1–100                  |
| `sensitivity`, `cursor_size`          | 0.01–10                |
| `audio_offset_ms`                     | integer −1000–1000     |
| text fields                           | at most 100 characters |
| `storage`                             | at most 8 rows         |

Errors use the existing "<field> <message>" format, e.g. "tablet.area_w must be between 0 and 500".

## Saving

### Endpoint: `PATCH /api/players/[id]/setup`

Body: only the keys being changed.

```ts
{ keyboard?: {...} | null, tablet?: {...} | null, mouse?: ..., monitor?: ..., in_game?: ..., pc?: ..., main_input?: "tablet" | "mouse" | null }
```

An object replaces that card; `null` removes it (or clears `main_input`). Same "null clears" convention as `hue`.

Access: `requireUser`, then allowed when the user is an admin (`isAdmin`) or their `authUsers.player_id` is `[id]`; otherwise 403. The session's `osu_id` is passed to Convex as `actor_osu_id`, last in the args so the body can't override it.

### Convex: `players.updateSetup`

A `serverMutation` taking `{ actor_osu_id, id, ...patch }`. It checks permission again: the actor is an admin (`parseAdminIds(process.env.ADMIN_OSU_IDS)`, exported as an `isAdmin` helper from `convex/lib/functions.ts`) or the actor's `authUsers` row points at this player; otherwise `fail(403)`. Unknown player → 404.

It reads the current `setup`, applies only the sent keys, prunes empty cards, writes `setup` (or removes it when empty) and bumps `updated_at`. The merge runs inside the mutation (a transaction), so an owner and an admin editing different cards at the same time don't overwrite each other.

## UI

Files in `src/routes/(public)/player/[osuId]/`:

- `setup-panel.svelte`: the grid, placing cards by the layout rule.
- `setup-card.svelte`: shared card frame (icon, title, "Main input" badge, edit button when the viewer can edit).
- `tablet-diagram.svelte`: the full tablet area with the active area drawn inside.
- Edit dialog(s): one shared dialog shell; whether each card gets its own form component is decided in the plan.

Pure logic in `src/lib/setup.ts`: `hasSetup`, the layout rule, display helpers (e.g. the tablet diagram's percentages, RT display mode).

### Layout rule

A pure function takes which cards have data and returns each card's shape, `full`, `half` or `tall`, in order. No per-combination layouts.

1. **Keyboard**: full width, first.
2. **Tablet, Mouse and Monitor all present**: layout K. Tablet `tall` (spans 2 rows, left), Mouse and Monitor `half`, stacked on the right.
3. Otherwise **Tablet** (if present) is `full` and uses its horizontal arrangement.
4. The remaining **half cards** (Mouse, Monitor) pair up side by side. If one is left over and **In-game** is present, In-game joins it as a `half` card.
5. Any card still alone is `full`. **In-game** (if not joined) is `full`. **PC**: `full`, last.

The grid has two equal columns; `full` spans both, `tall` spans two rows. Rows stretch so cards in a row share a height.

Each card arranges its insides with **container queries** (Tailwind v4 `@container` on the card, `@md:`/`@lg:` variants inside), so the same card works in any slot and on phones:

- Tablet: wide → tiles beside the diagram; narrow → diagram below the tiles.
- In-game: wide → 5 tiles in one row (3+2 in K's full width); narrow → tiles wrap into 2 columns.
- Monitor and Mouse: tiles wrap as they narrow.

Below the `md` breakpoint the grid is one column in the same order; the shapes collapse to full width.

### Cards

- No photos in part 3: the device icon tile sits where the photo goes in layout K.
- Model empty → "Unknown". Value empty → "–".
- **Keyboard:** RT badge in 3 states ("Rapid trigger enabled" / "Rapid trigger disabled" / "No rapid trigger", styled as in K), switch, actuation, then one RT tile or a press/release pair (accent colored), only when RT is enabled.
- **Tablet:** area tile (w × h mm) and the diagram. The diagram shows when area and full size are both set; missing centre → centred. Caption: "Centre at X … · Y … mm, on a … × … mm tablet".
- **Mouse:** DPI, polling rate. **Monitor:** refresh rate, size, resolution.
- **In-game:** sensitivity, raw input (On/Off), cursor size, frame limiter, audio offset.
- **PC:** a plain two-column table; storage rows read "NVMe SSD · Samsung 990 Pro 2TB".
- **"Main input"** badge on the Tablet or Mouse card named by `main_input`.

### Edit dialogs

- One per card, opened by its edit button (or the "Add …" prompt on an empty card).
- Text inputs for models and names; number inputs with units for values.
- Keyboard: RT state select; RT fields only when "Enabled"; a "Different release value" checkbox reveals `rt_release` (unchecking clears it).
- Tablet and Mouse: a "This is my main input" toggle. Turning it on sends `main_input` for that card; turning it off sends `null` only if `main_input` currently points at that card.
- PC: add/remove storage rows, each with a kind select and a name.
- Buttons: Save, Cancel, and "Clear card" (sends `null`, asks for confirmation).
- Closing with unsaved changes uses the existing in-app discard dialog.
- After saving: `invalidate` the page. Errors show as toasts.

## Visibility

- `canEdit = isOwner || isAdmin`, computed in the page load.
- **Visitors** see the Setup tab when `hasSetup(player.setup)`; only cards with data are shown.
- **Editors** always see the Setup tab and all six cards; empty ones show an "Add keyboard…"-style prompt. For admins this applies to Setup only (empty About stays hidden); the Settings tab stays owner-only.
- `profile-tabs.svelte` drops `.filter((tab) => tab !== "setup")` and passes `setup: hasSetup(player.setup)`. `visibleTabs` gains a way to force Setup visible for editors.

## Tests

- `src/lib/setup.test.ts`:
  - the layout rule for all 16 Tablet/Mouse/Monitor/In-game combinations, plus keyboard and PC present/absent;
  - `hasSetup`;
  - tablet diagram math (centred default, area at an edge);
  - RT display mode (none, single, split, ignored when not enabled).
- `src/lib/server/schemas.test.ts`: the setup patch schema (trimming, dropping empties, ranges, `null` clears, storage rows, unknown keys rejected).
- `convex/lib/setup.test.ts`: the merge/prune helper in `convex/lib/setup.ts` (only sent keys change, `null` removes, empty cards and an empty setup are removed). The permission check is a small branch in the mutation and is checked manually (owner, admin, another user → 403).
- `src/lib/profile-tabs.test.ts`: Setup visible for visitors only with data, always for editors.
- Manual: owner and admin edit each card; visitor view of a partial setup; layouts at phone, tablet and desktop widths.

## Not in this part

Device catalog, photos and the request queue (part 4); description rendering (part 2); settings leftovers (part 5); the fullscreen image viewer.
