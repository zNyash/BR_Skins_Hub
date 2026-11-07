# Setup tab layout

Date: 2026-11-07

## Goal

Make the Setup tab look finished on every profile, however much a player filled in. Today cards and tiles grow with their content: a long switch name wraps and pushes Actuation down, a half card with fewer tiles stretches its tiles to match its neighbour, and the tall Tablet card is sized by its own content instead of fitting next to Mouse + Monitor. Spacing is also off the 4px grid (`gap-2.5`, `px-3.5 py-3`, `px-4 sm:px-5 py-4`).

The fix is one principle: **every card has a fixed template.** Every tile always shows (empty → "–"), every tile has the same height, and text never wraps (it fades out instead). Cards then have predictable heights, so the existing layout rule can fit them together without holes or stretching.

Mockup: https://claude.ai/artifact/NZiWy49yzPZEQXauDcpgiC (version 2, "F1 chips + list/detail").

Builds on `2026-11-06-setup-tab-design.md` (data model, saving, dialogs, visibility are unchanged).

## Scope

In: Setup panel and card markup, spacing, tile template, text overflow, tablet card sizing and diagram, filter chips and their popovers, our own native popover replacing shadcn's Popover everywhere.

Out: data model, endpoint, edit dialogs (except the spacing rule applies if they're touched), the layout rule's card order. Later spec (noted in memory): tablet catalog from OpenTabletDriver with autocomplete and full area, filters that can be added and edited by hand.

## Spacing rules

- Every spacing value is a multiple of 4px. No `*-0.5`, `*-1.5`, `*-2.5`, `*-3.5` on spacing.
- Cards and tiles use equal padding on all sides. Pills may be asymmetric.
- Text that touches a padded edge or an image is **trimmed** so the visible gap equals the number: a `trim` utility in `layout.css` = `line-height: 1; text-box: trim-both cap alphabetic;`. Browsers without `text-box` (Firefox today) fall back to `line-height: 1`.

| Element                            | Value                                          |
| ---------------------------------- | ---------------------------------------------- |
| Grid between cards                 | `gap-4` (16)                                   |
| Card padding                       | `p-4` (16)                                     |
| Inside a card (all levels)         | `gap-3` (12)                                   |
| Card header                        | icon `size-9`, `gap-3`, edit button `size-9`   |
| Tile                               | `p-3`, height `h-18` (72), radius `rounded-lg` |
| Model row (mouse, monitor, tablet) | `p-2`, photo slot `h-14 w-20`, `gap-3`         |
| Keyboard model block               | `p-3`, `gap-3`                                 |
| RT badge                           | `px-3 py-1`                                    |
| "Main input" badge                 | `px-2 py-1`                                    |
| PC table                           | `gap-x-6 gap-y-4`                              |

## Tile

- Label (`text-xs text-text-muted`, trimmed) at the top, value (trimmed) at the bottom, `justify-between`.
- Value sizes: `text-2xl font-bold` for numbers, `text-base font-bold` for text (switch, resolution, frame limiter, area). Units `text-sm text-text-muted`.
- Empty value → "–", no unit. Accent color for rapid trigger values.
- Values are one line (`whitespace-nowrap overflow-hidden`). When the text overflows, it fades out at the right edge (a `mask-image` gradient over the last 48px) and hovering it opens a tooltip popover with the full text. On touch, tapping it opens the same tooltip. Text that fits gets neither.
- Overflow is detected per element with a `ResizeObserver` (`scrollWidth > clientWidth`), as a Svelte attachment, so it updates when the card resizes.
- The same fade + tooltip applies to model names in model rows and the keyboard model block.

## Cards

All cards keep the header from `setup-card.svelte` (icon, title, "Main input" badge, RT badge on the keyboard, edit button).

### Keyboard (full width)

- Wide (`@2xl`): model block on the left (`w-70`), tiles on the right in 2 columns.
- Model block: photo slot (device icon until photos exist) that takes the remaining height, then the model name (`text-lg font-bold`, trimmed, one line, fade). Its bottom lines up with the bottom of the tiles.
- Tiles: Switch | Actuation point, then rapid trigger: one "Rapid trigger" tile spanning both columns, or "Rapid trigger · press" | "Rapid trigger · release" (one column each). No RT row unless RT is enabled (unchanged rule).
- Narrow: model block on top (photo `min-h-30`), tiles below.

### Mouse and Monitor (half)

- Model row, then one row of tiles. Mouse: DPI | Polling rate. Monitor: Refresh rate | Size | Resolution (`1fr 1fr 1.4fr`).
- Both cards are therefore always the same height (header + model row + one tile row), so a pair never stretches.
- Monitor under a 400px container: Refresh | Size, then Resolution spanning both. (Only reachable when cards stack on phones, where no pairing applies.)

### In-game

- Full width, container ≥ 640px: 5 tiles in one row.
- Otherwise (narrow full width, or as a half card): 3 + 2 on a 6-column grid (first three span 2, last two span 3). As a half card next to a lone Mouse or Monitor this is exactly their height (two 72px rows + gap = model row + tile row).

### Tablet

Fixed parts, top to bottom: model row; tiles Area | Rotation (`1.4fr 1fr`); the diagram; the filters row.

**Tall (Tablet + Mouse + Monitor present):**

- The tablet spans two grid rows; Mouse and Monitor set the row heights. The **diagram is the only flexible part**: `flex: 1 1 0; min-height: 0`, so the tablet card never makes the rows taller and always ends exactly at the bottom of Monitor.
- Inside the diagram slot (`bg-layer-2 p-3 rounded-lg`), the board keeps the tablet's real ratio and fits both directions: the slot is `container-type: size` and the board is `width: min(100cqw, 100cqh * full_w / full_h)` with `aspect-ratio: full_w / full_h`.

**Full width (Tablet present without both Mouse and Monitor):**

- Two columns: left = model row, tiles, filters row; right = diagram slot.
- The diagram slot's height equals the left column's (it's fixed: 72 + 12 + 72 + 12 + chip row), and its width follows the tablet ratio, so there's no empty space beside the board.

**Stacked (phones, below `md`):** same order as tall, diagram slot `h-50` (200px).

**Diagram:**

- Board (`border-layer-5`) with the active area (accent border, `bg-primary/15`), positioned by `tabletDiagram()` and rotated by `rotation`, unchanged.
- No caption line. The centre and full size ("Centre at X … · Y … mm, on a … × … mm tablet") move into the diagram's `aria-label` and a hover tooltip.
- Area set, full size unknown: the area alone is drawn with its own ratio, filling the slot, with a muted "Full tablet size not set" under it.
- No area: the slot shows a muted "–".

**Rotation** is always shown (empty → "–"), like every other tile.

### PC

Unchanged layout (plain definition grid), with the spacing above.

## Filters row (tablet)

- One line of chips (`rounded-full bg-layer-3 px-3 py-1 text-sm font-medium`), one per filter, humanized names. A filter with settings shows a chevron.
- Chips that don't fit are hidden from the end and replaced by a "+N" chip. Which chips fit is recomputed on resize; the count comes from a pure function `visibleChips(widths, available, moreWidth, gap)` in `src/lib/setup.ts`.
- No filters: the row shows muted "No filters" in the same height, so the template doesn't change.
- **Chip popover** (filters with settings only): hover or focus opens it; clicking pins it open. Content: the filter name as a heading (`text-base font-bold`, trimmed, `mb-3`), then the settings in a 2-column grid (label `text-xs text-text-muted` truncated with full name on `title`, value `font-medium`; `"true"`/`"false"` as On/Off).
- **"+N" popover**: same open behaviour, list + detail. Left: the hidden filters' names; hovering or clicking one shows its settings on the right (same heading + grid as a chip popover). The first one is selected on open. If only one filter is hidden, it opens straight to its settings, without the list. Under 480px of viewport, the list becomes a horizontal row above the details. Max height 360px; the details scroll.

## Popover (own component, replaces shadcn Popover)

`src/lib/components/popover.svelte` on the native `popover` attribute:

- **Hover mode**: a `popover="manual"` element shown on pointer enter / focus of the trigger, hidden 120ms after the pointer leaves both trigger and popover (so the pointer can move into it).
- **Click to pin**: clicking the trigger shows it as `popover="auto"`, so the browser closes it on outside click and Esc and keeps only one open. Clicking the trigger again closes it (the trigger remembers on `pointerdown` whether it was open, since light dismiss closes it before `click`).
- Triggers can be click-only or hover + click. Tooltips, filter chips and "+N" use hover + click, so a tap opens them on touch screens.
- Placement: below the trigger, flipped above when there isn't room, clamped 8px inside the viewport. A pure `placePopover(trigger, popover, viewport)` in `src/lib/popover.ts` returns `{ top, left }`; the component re-runs it on open, scroll and resize. CSS anchor positioning can replace it later when it's supported everywhere.
- Styling: `bg-layer-2 rounded-lg outline outline-border`, tooltip `px-2 py-1`, content popovers `p-3`.
- Accessibility: trigger is a `<button>` (or gets `tabindex="0"` for text), `aria-expanded` for click popovers, `aria-describedby` for tooltips.

All existing uses move over in this branch: setup filter chips, skin card name and date (`skin-card.svelte`), and the player page (`+page.svelte`). `POPOVER_SETTINGS` and `src/lib/components/ui/popover/` are then removed.

## Editors

Unchanged from the previous spec: editors see all six cards, empty ones show the "Add …" prompt. The prompt fills its card's slot (`flex-1`), so an empty tall Tablet still lines up with Mouse + Monitor.

## Tests

- `src/lib/setup.test.ts`: `visibleChips` (all fit, none fit, exact fit including the "+N" chip, gap counted).
- `src/lib/popover.test.ts`: `placePopover` (below, flipped above, clamped left and right, taller than the viewport stays below and clamped).
- The layout rule tests stay as they are (the rule doesn't change).
- Manual, using the mockup's cases: long switch / model names fade and show a tooltip; tall tablet ends exactly at Monitor's bottom with 1, 3 and 6 filters; "+N" list + detail; outside click and Esc close pinned popovers; mouse and monitor same height without a tablet; in-game half next to a lone mouse; phone width; Firefox (no `text-box`); skin card and player page popovers still work.
