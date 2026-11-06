# Owner Settings tab and in-place editing

Date: 2026-11-06

## Goal

Give every editable thing on a player's own profile exactly one home, and add an owner-only **Settings** tab for what has no other home. This reworks the editing part of `2026-11-06-profile-redesign-design.md` (part 1): the "Edit profile" dialog and the avatar-dropdown color toggle go away.

Mockup: "O · Settings as cards + tab order list" on the "Player Profile Redesign" design canvas.

## Where each thing is edited

| Thing                 | Where                                                                                                          | How it saves |
| --------------------- | -------------------------------------------------------------------------------------------------------------- | ------------ |
| Bio                   | Sidebar **Bio** card (renamed from "About"): a pencil turns it into a text box with a counter, Cancel and Save | Save button  |
| Description           | **About** tab: an "Edit" button (top right) opens a text box in place, with Cancel and Save                    | Save button  |
| Profile color         | Settings → **Colors**                                                                                          | Immediately  |
| Links                 | Settings → **Links**                                                                                           | Save button  |
| Tab order             | Settings → **Tab order** (↑/↓ list), and still by dragging the tab bar                                         | Immediately  |
| "My color everywhere" | Settings → **Preferences**                                                                                     | Immediately  |
| Setup cards           | Setup tab, per-card edit buttons                                                                               | Part 3       |

Rule: single values save immediately; text and lists save with an explicit Save, so a half-typed value is never stored.

The plain text boxes for bio and description stay plain in this spec. Part 2 (renderer) adds the About preview; part 5 swaps the description box for CodeMirror. Neither changes where things are edited.

## Settings tab

- Owner-only. Shown last, pushed to the right of the tab bar, with a `settings` (gear) icon and the tooltip "Only you can see this tab".
- Not draggable and never stored in `tab_order`. `?tab=settings` opens it for the owner; for anyone else it falls back to the first visible tab.
- A short line at the top: "Only you can see this tab."
- **Fixed 2×2 grid**, two equal columns, cards in a row stretch to the same height. Order: **Colors, Links** (row 1), **Tab order, Preferences** (row 2). Below 760px wide it becomes one column in the same order.

### Colors card

- Ten swatches (hues 0, 25, 60, 95, 140, 190, 230, 265, 300, 330), a hue slider (0–360, its track painted with the hues), and a number box (0–360) beside the slider. All three stay in sync.
- The page recolors live while the owner picks (preview), then saves:
  - a swatch: on click;
  - the slider: when released (`change`), not on every step;
  - the number box: on `change` (Enter or leaving the box). Out-of-range values are clamped to 0–360; an empty or non-numeric value is ignored.
- Help text: "Saved as soon as you pick one. Visitors see your page in this color."

### Links card

The rows editor (type select, value, remove) with "Add link" and a Save button. Same validation as today (blank rows are dropped).

### Tab order card

The owner's tabs (the ones the tab bar shows, so Setup only once part 3 exists) as a list, each row with ↑ and ↓ buttons (disabled at the ends). Each move saves immediately, using the same index translation as dragging the bar. This is also how phone users reorder.

### Preferences card

"My color everywhere" as a switch with the line "Use your profile color on every page, except other players' profiles." Every future toggle and select goes in this card. If it outgrows the card, the Settings tab gets a section menu then (discussed, not built now).

## Data and endpoints

- `PATCH /api/me/profile` gains `hue`, using the existing `hue` schema from `$lib/server/schemas` (integer 0–360, `null` clears). `players.updateOwnProfile` accepts `hue: v.optional(v.union(v.number(), v.null()))` and writes it like the admin `update` does (null removes the field).
- `PATCH /api/me/preferences` stays as built.
- No schema changes.

## Live color preview

A small shared state, `huePreview` in `src/lib/hue-preview.svelte.ts` (`{ value: number | null }`). The root layout uses `pickHue(huePreview.value ?? page.data.pageHue, …)`. The Colors card sets it while picking and clears it after the save's data reload (and on failure), so the page shows the saved color again. Navigating away also clears it.

## Unsaved changes

Bio, description and links editors track whether their draft differs from the saved value. While any is dirty:

- switching tabs or leaving the page asks "Discard your unsaved changes?" (SvelteKit `beforeNavigate`, which also covers tab switches since they go through `goto`, plus `beforeunload` for closing the page);
- Cancel discards without asking.

## Error handling

- Immediate saves (color, toggle, tab order): on failure, revert the shown value to the saved one and show the API's error in a toast.
- Save buttons: on failure keep the editor open with the draft and show a toast. The button shows a spinner while saving; Save is disabled while saving and when the bio is over 200 characters (trimmed).
- After any successful save, reload the player data (`invalidate("app:player:<osuId>")`), or all data for the preference toggle (`invalidateAll`).

## Removed

- `edit-profile-dialog.svelte` and the sidebar "Edit profile" / "Add a short bio" buttons (the Bio card's pencil replaces them; an owner with no bio sees "Add a short bio" inside the card).
- The "My color everywhere" item in the avatar dropdown.

## Testing

- `src/lib/profile-tabs.ts`: owner tab list ends with `settings`; visitors never get it; `pickTab("settings", …)` falls back for visitors; moving a visible tab (bar or list) maps correctly into the full stored order when some tabs are hidden.
- `src/lib/hue.ts`: preview beats the page hue; no preview falls back as before.
- Valibot: owner `hue` accepts 0–360 and `null`, rejects 361 and 1.5.
- UI checked by hand: each editor's save, cancel and failure; unsaved-changes prompt on tab switch and on leaving; live color preview and revert; tab order buttons at the ends; the 2×2 grid collapsing on a narrow window.
