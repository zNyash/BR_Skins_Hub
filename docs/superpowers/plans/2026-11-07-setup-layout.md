# Setup Tab Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every Setup card a fixed template (fixed-height tiles, "–" for empty values, one-line fading text) on a 4px grid, fit the tall Tablet card exactly beside Mouse + Monitor, show filters as chips with a "+N" list/detail popover, and replace shadcn's Popover with our own native one.

**Architecture:** Two pure helpers with unit tests (`placePopover` in `src/lib/popover.ts`, `visibleChips` in `src/lib/setup.ts`) drive two new components (`$comp/popover.svelte`, `$comp/fade-text.svelte`) and a route-local `filter-chips.svelte`. `setup-panel.svelte`, `setup-card.svelte` and `tablet-diagram.svelte` are restyled to the spec's spacing table. The layout rule (`setupLayout`) doesn't change.

**Tech Stack:** SvelteKit, Svelte 5 runes, Tailwind v4 (container queries `@container`), native HTML `popover`, `ResizeObserver`, Vitest (server project for `.ts`, client/Playwright project for `.svelte.test.ts` via `vitest-browser-svelte`).

**Spec:** `docs/superpowers/specs/2026-11-07-setup-layout-design.md` (builds on `2026-11-06-setup-tab-design.md`). Mockup: https://claude.ai/artifact/NZiWy49yzPZEQXauDcpgiC

## Global Constraints

- Every spacing value is a multiple of 4px: no `*-0.5`, `*-1.5`, `*-2.5`, `*-3.5` on padding, margin or gap. Cards and tiles use equal padding on all sides; pills may be asymmetric.
- Spacing table (spec): grid `gap-4`; card `p-4`; inside a card `gap-3` at every level; header icon `size-9`, `gap-3`, edit button `size-9`; tile `p-3 h-18 rounded-lg`; model row `p-2`, photo slot `h-14 w-20`, `gap-3`; keyboard model block `p-3 gap-3`; RT badge `px-3 py-1`; "Main input" badge `px-2 py-1`; PC table `gap-x-6 gap-y-4`.
- Text touching a padded edge or image uses the `trim` utility (`line-height: 1; text-box: trim-both cap alphabetic;`).
- Empty value → "–" with no unit. Empty model → "Unknown".
- Svelte 5 runes only; don't hand-edit `src/lib/components/ui/` (only delete `ui/popover/`).
- Commits: `type(scope): summary` plus optional `- bullet` lines, **no Co-Authored-By trailer**.
- Each `.test.ts` assertion runs under `expect.requireAssertions`.

## Review Focus

1. **Clicking a pinned popover's trigger again** should close it, not close-and-reopen (light dismiss fires on `pointerdown` before `click`). → browser test in Task 2.
2. **Click outside / Esc** must close a pinned popover (the mockup's first version didn't). → browser test in Task 2.
3. **A single filter name wider than the whole row** must not break the row: zero chips visible, "+N" shows all. → `visibleChips` test in Task 5.
4. **Popover near the bottom/right edge of the viewport** must flip above / stay inside. → `placePopover` tests in Task 1.
5. **Tablet with area but no full size, rotated 90°**, must not draw outside its slot. → Task 6 draws the area-alone case unrotated, with a check in its manual step.

---

### Task 1: `placePopover`

**Files:**

- Create: `src/lib/popover.ts`
- Test: `src/lib/popover.test.ts`

**Interfaces:**

- Produces: `type Box = { top: number; left: number; width: number; height: number }` and `placePopover(trigger: Box, popover: { width: number; height: number }, viewport: { width: number; height: number }): { top: number; left: number }`. Exported constants `POPOVER_GAP = 8` (trigger → popover) and `VIEWPORT_MARGIN = 8`.

- [ ] **Step 1: Write the failing tests** in `src/lib/popover.test.ts`, with viewport `{ width: 1000, height: 800 }`:
  - `it("opens below the trigger, aligned to its left edge")`: trigger `{ top: 100, left: 200, width: 80, height: 20 }`, popover `{ width: 300, height: 150 }` → `{ top: 128, left: 200 }`.
  - `it("flips above when there is no room below")`: trigger `{ top: 700, left: 200, width: 80, height: 20 }`, popover `{ width: 300, height: 150 }` → `{ top: 542, left: 200 }`.
  - `it("stays below when there is no room above either")`: trigger `{ top: 100, left: 200, width: 80, height: 20 }`, popover `{ width: 300, height: 790 }` → `top: 128`.
  - `it("clamps to the right edge")`: trigger `left: 900`, popover width 300 → `left: 692`.
  - `it("clamps to the left edge")`: trigger `left: -50` → `left: 8`.
- [ ] **Step 2:** Run `bunx vitest run src/lib/popover.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 3: Implement `placePopover`.** Below = `trigger.top + trigger.height + POPOVER_GAP`. If that bottom passes `viewport.height - VIEWPORT_MARGIN` and the above position (`trigger.top - POPOVER_GAP - popover.height`) is ≥ `VIEWPORT_MARGIN`, use above. Left = `trigger.left` clamped to `[VIEWPORT_MARGIN, viewport.width - popover.width - VIEWPORT_MARGIN]`.
- [ ] **Step 4:** Run the same command. Expected: 5 passed.
- [ ] **Step 5: Commit** `feat(popover): placement helper`.

### Task 2: Native popover component

**Files:**

- Create: `src/lib/components/popover.svelte`
- Test: `src/lib/components/popover.svelte.test.ts`

**Interfaces:**

- Consumes: `placePopover` (Task 1).
- Produces: `Popover` component with props

  ```ts
  {
    trigger: Snippet<[props: Record<string, unknown>]>; // spread props onto your own trigger element
    children: Snippet;                                   // popover content
    hover?: boolean;   // default true: opens on pointerenter/focus, closes 120ms after leaving trigger and popover
    pin?: boolean;     // default true: click pins it open (light dismiss, Esc), click again closes
    class?: string;    // classes for the popover element, merged after the base classes
    onopen?: () => void;
  }
  ```

  The `props` object handed to `trigger` holds the pointer/focus/click handlers, `aria-expanded` (when `pin`), `aria-describedby` pointing at the popover (when `hover`), and an attachment the component uses to get the trigger element. Base classes on the popover element: `fixed m-0 inset-auto rounded-lg bg-layer-2 text-foreground outline outline-border`.

- [ ] **Step 1: Write failing browser tests** in `popover.svelte.test.ts` (client project), rendering a small harness component inline via `vitest-browser-svelte` (a `<Popover>` with a `<button>` trigger "Open" and content "Inside", plus an outside `<button>` "Outside"):
  - `it("opens on hover and closes after leaving")`: hover "Open" → "Inside" visible; unhover, wait 200ms → not visible.
  - `it("pins on click and closes on outside click")`: click "Open" → visible; move pointer away, wait 200ms → still visible; click "Outside" → not visible.
  - `it("closes when the trigger is clicked again")`: click "Open", click "Open" → not visible.
  - `it("closes on Escape")`: click "Open", press Escape → not visible.
- [ ] **Step 2:** Run `bunx vitest run src/lib/components/popover.svelte.test.ts`. Expected: FAIL, component missing.
- [ ] **Step 3: Implement `popover.svelte`.** One element whose `popover` attribute is `"manual"` while closed or hover-open. Pinning: if hover-open, `hidePopover()`; set `popover="auto"`; `showPopover()`. On its `toggle` event with `newState === "closed"`, set the attribute back to `"manual"`. Second-click rule: on trigger `pointerdown` record `wasPinned = element is open && attribute is "auto"`; in `click`, if `wasPinned` do nothing (light dismiss already closed it). Hover never opens while pinned. Position with `placePopover(trigger.getBoundingClientRect(), popover size, window size)` right after `showPopover()`, and again on `scroll` (capture) and `resize` while open.
- [ ] **Step 4:** Run the same command. Expected: 4 passed.
- [ ] **Step 5: Commit** `feat(popover): own popover on the native popover attribute`.

### Task 3: Move existing popovers over, remove shadcn Popover

**Files:**

- Modify: `src/lib/components/skin-card.svelte` (name and date popovers)
- Modify: `src/routes/(public)/player/[osuId]/+page.svelte:60-67` (previous usernames)
- Modify: `src/routes/(public)/player/[osuId]/setup-panel.svelte:188-215` (filter chips, temporary until Task 5 replaces them)
- Modify: `src/lib/constants.ts` (delete `POPOVER_SETTINGS`)
- Delete: `src/lib/components/ui/popover/`

**Interfaces:**

- Consumes: `Popover` (Task 2). Tooltip content uses `class="px-2 py-1"`.

- [ ] **Step 1:** Replace each `Popover.Root/Trigger/Content` with `<Popover class="px-2 py-1">`, keeping the trigger element's current classes. Setup filter chips get `class="w-72 p-3"`.
- [ ] **Step 2:** Delete `POPOVER_SETTINGS` and `src/lib/components/ui/popover/`; `grep -rn "ui/popover\|POPOVER_SETTINGS" src` returns nothing.
- [ ] **Step 3:** Run `bun run check && bun run lint && bun run test`. Expected: 0 errors, all tests pass.
- [ ] **Step 4:** Manual: `bun run dev` (+ `bunx convex dev`); hover a skin name on `/skins`, the date on a skin card, a player name with previous usernames. Each shows its tooltip and hides on leave.
- [ ] **Step 5: Commit** `refactor(popover): use the native popover everywhere, drop shadcn's`.

### Task 4: Spacing, `trim`, fading text, fixed-height tiles

**Files:**

- Modify: `src/routes/layout.css` (add utilities)
- Create: `src/lib/components/fade-text.svelte`
- Modify: `src/routes/(public)/player/[osuId]/setup-card.svelte`
- Modify: `src/routes/(public)/player/[osuId]/setup-panel.svelte` (tile/model snippets, keyboard, mouse, monitor, in-game, PC, add prompt)

**Interfaces:**

- Consumes: `Popover` (Task 2).
- Produces: utilities `trim` and `fade` (`mask-image: linear-gradient(to right, #000 calc(100% - 3rem), transparent)`); `FadeText` component `{ text: string; class?: string; children?: Snippet }` renders a one-line `overflow-hidden whitespace-nowrap` span (children render after the text, for units). A `ResizeObserver` attachment sets `overflowing = scrollWidth > clientWidth + 1`; when overflowing it adds `fade` and wraps the span in `<Popover class="px-2 py-1">` showing `text`, with `tabindex="0"` on the span. Snippets in `setup-panel.svelte`: `tile(label, value, unit, opts)` and `model(id, name)` keep their names.

- [ ] **Step 1: Add the `trim` and `fade` utilities** to `layout.css` as `@utility` blocks next to the existing ones.
- [ ] **Step 2: Create `fade-text.svelte`** as described.
- [ ] **Step 3: Restyle `setup-card.svelte`**: `article` → `p-4 gap-3` (drop `px-4 py-4 sm:px-5`); header `gap-3`; "Main input" badge `px-2 py-1`; RT badge (in `setup-panel.svelte`) `px-3 py-1`.
- [ ] **Step 4: Restyle the `tile` snippet**: `h-18 p-3 rounded-lg bg-layer-2 flex flex-col justify-between min-w-0`; label `trim text-xs text-text-muted`; value is a `FadeText` with `trim`, `text-2xl font-bold` (or `text-base font-bold` when `small`), unit `text-sm text-text-muted` as its child, accent when `hot`; empty → "–". Remove `flex-[1_1_8rem]`.
- [ ] **Step 5: Restyle cards** per spec:
  - Model row (`model` snippet, non-large): `p-2 gap-3`, photo `h-14 w-20`, name `FadeText` `trim font-semibold`.
  - Keyboard: `@2xl:grid @2xl:grid-cols-[17.5rem_1fr] gap-3`; model block `p-3 gap-3 flex flex-col`, photo `flex-1 min-h-30`, name `FadeText` `trim text-lg font-bold`; tiles `grid grid-cols-2 gap-3 content-start`; single RT tile `col-span-2`, split = two tiles.
  - Mouse: model row + `grid grid-cols-2 gap-3`. Monitor: model row + `grid grid-cols-[1fr_1fr_1.4fr] gap-3`, below a 24rem container (`@max-sm:` variant): `grid-cols-2` with Resolution `col-span-2`.
  - In-game: `grid grid-cols-6 gap-3`, first three tiles `col-span-2`, last two `col-span-3`; from a 40rem container (`@min-[40rem]:`) `grid-cols-5` with every tile `col-span-1`.
  - PC: `gap-x-6 gap-y-4`, `dd` margin `mt-1` (from `gap-0.5`).
  - Add prompt: `min-h-24 flex-1` stays; panel grid `gap-4`.
- [ ] **Step 6:** `grep -nE '(gap|p|px|py|m|mt|mb|gap-x|gap-y)-[0-9]+\.5' src/routes/\(public\)/player/\[osuId\]/setup-*.svelte` returns nothing.
- [ ] **Step 7:** Run `bun run check && bun run lint`. Expected: 0 errors.
- [ ] **Step 8:** Manual at 1280px and 375px: a long switch name fades and shows its tooltip on hover (and on tap with touch emulation); Mouse and Monitor side by side are the same height; In-game shows 5 in a row on desktop, 3 + 2 when half or narrow; keyboard model block bottom lines up with the last tile row.
- [ ] **Step 9: Commit** `fix(setup): 4px spacing, fixed-height tiles, one-line fading values`.

### Task 5: Filter chips with "+N"

**Files:**

- Modify: `src/lib/setup.ts`, `src/lib/setup.test.ts`
- Create: `src/routes/(public)/player/[osuId]/filter-chips.svelte`
- Modify: `src/routes/(public)/player/[osuId]/setup-panel.svelte` (replace the filters block)

**Interfaces:**

- Consumes: `Popover` (Task 2); `humanize` from `$lib/otd`; `Setup["tablet"]["filters"]` type.
- Produces: `visibleChips(widths: number[], available: number, moreWidth: number, gap: number): number` — how many chips (from the start) to show; if all fit without "+N" return `widths.length`, otherwise the most that fit together with the "+N" chip. `FilterChips` component `{ filters: { path: string; settings: { property: string; value: string }[] }[] }`.

- [ ] **Step 1: Write failing tests** in `setup.test.ts`, `describe("visibleChips")`:
  - `it("shows all when they fit")`: `visibleChips([100, 100], 220, 40, 8)` → `2`.
  - `it("reserves room for the +N chip")`: `visibleChips([100, 100, 100], 250, 40, 8)` → `1` (100 + 8 + 40 = 148 ≤ 250; 100 + 8 + 100 + 8 + 40 = 256 > 250).
  - `it("counts an exact fit")`: `visibleChips([100, 100, 100], 256, 40, 8)` → `2`.
  - `it("shows none when the first chip alone is too wide")`: `visibleChips([400, 100], 300, 40, 8)` → `0`.
  - `it("handles no filters")`: `visibleChips([], 300, 40, 8)` → `0`.
- [ ] **Step 2:** Run `bunx vitest run src/lib/setup.test.ts -t visibleChips`. Expected: FAIL, not exported.
- [ ] **Step 3: Implement `visibleChips`** in `src/lib/setup.ts`.
- [ ] **Step 4:** Run it again. Expected: 5 passed.
- [ ] **Step 5: Create `filter-chips.svelte`.** Measure widths from a hidden copy of the row (`invisible absolute`, every chip plus a "+N" chip at the largest count), so hidden chips can still be measured. A `ResizeObserver` on the row re-runs `visibleChips` with `gap = 8` (`gap-2`). Chip: `rounded-full bg-layer-3 px-3 py-1 text-sm font-medium hover:bg-layer-4`, chevron only when the filter has settings. Chip with settings → `<Popover class="w-72 p-3 max-h-90 overflow-auto">` with heading `trim text-base font-bold mb-3` and a `dl` `grid grid-cols-2 gap-x-4 gap-y-2` (label `text-xs text-text-muted truncate` with `title`, value `font-medium`, `"true"`/`"false"` → On/Off). Chip without settings: plain `<span>`, no popover. "+N" → `<Popover>` whose content is the list/detail: `grid grid-cols-[11rem_1fr] w-120 max-h-90` (list `bg-layer-1 p-2 flex flex-col gap-1`, items `rounded-sm p-2`, selected `bg-layer-3`; detail `p-3 overflow-auto`, same heading + grid). First hidden filter selected on open (`onopen`); hover or click selects. One hidden filter → detail only, no list. Below 480px viewport (`max-[480px]:`): one column, list as a horizontal scroll row. No filters → `<span class="trim text-sm text-text-muted">No filters</span>` inside a row of the same height (`h-7`).
- [ ] **Step 6: Use it** in the Tablet card in place of the old "OpenTabletDriver filters" block (the label goes away).
- [ ] **Step 7:** Run `bun run check && bun run lint && bunx vitest run src/lib/setup.test.ts`. Expected: 0 errors, all passed.
- [ ] **Step 8:** Manual: import a `settings.json` with 6 filters; resize the window and watch "+N" change; hover a chip; click "+N", hover through the list; click outside closes; click "+N" twice closes.
- [ ] **Step 9: Commit** `feat(setup): filter chips with a +N list/detail popover`.

### Task 6: Tablet card fit and diagram

**Files:**

- Modify: `src/routes/(public)/player/[osuId]/setup-panel.svelte` (tablet branch; pass the card's shape)
- Modify: `src/routes/(public)/player/[osuId]/tablet-diagram.svelte`

**Interfaces:**

- Consumes: `tabletDiagram` (unchanged), `FilterChips` (Task 5), `Popover` (Task 2), `layout` shapes from `setupLayout`.
- Produces: `TabletDiagram` props `{ tablet: NonNullable<Setup["tablet"]>; class?: string }`; it fills its slot and never sets the card's height.

- [ ] **Step 1: Rework `tablet-diagram.svelte`.** Root: `rounded-lg bg-layer-2 p-3 flex` with the passed `class`. Inner: `flex-1 @container-size` (`container-type: size`) centring the board. Three states:
  - Full size and area known: board `border border-layer-5 rounded-md` with `aspect-ratio: full_w / full_h` and `width: min(100cqw, 100cqh * full_w / full_h)`; the area box as today (`border-2 border-primary bg-primary/15`, rotated). The whole board is wrapped in `<Popover class="px-2 py-1">` showing the old caption text; `role="img"` and `aria-label` unchanged. No "Position on the tablet" label and no caption line.
  - Area known, full size missing: the area alone (`aspect-ratio: area_w / area_h`, same fit formula, unrotated), with `trim text-xs text-text-muted` "Full tablet size not set" under it (`gap-3`).
  - No area: a centred muted "–".
- [ ] **Step 2: Tablet card by shape** in `setup-panel.svelte`:
  - Rotation tile always shown (`tile("Rotation", t.rotation, "°")`); tiles row `grid grid-cols-[1.4fr_1fr] gap-3`; Area uses `small`.
  - `tall`: card is `flex flex-col`; order model row, tiles, `<TabletDiagram class="flex-1 basis-0 min-h-0" />`, `<FilterChips />`. Below `md` the diagram gets `max-md:h-50 max-md:flex-none`.
  - `full`: `md:grid md:grid-cols-[1fr_auto] gap-3`; left column model row, tiles, chips; right column the diagram at `h-49` (196px = 72 + 12 + 72 + 12 + 28, the left column's fixed height) and `style:width="calc(172px * {ratio} + 24px)"` (172 = 196 − the `p-3` padding), where `ratio` is `full_w / full_h`, else `area_w / area_h`, else 1. Below `md`: stacked, diagram `h-50`, full width.
- [ ] **Step 3:** Run `bun run check && bun run lint && bun run test`. Expected: 0 errors, all pass.
- [ ] **Step 4:** Manual (DevTools element measurement):
  - Tablet + Mouse + Monitor: tablet bottom = Monitor bottom (±0px) with 0, 1, 3 and 6 filters, at 1280px and 900px.
  - Tablet + Mouse only: full-width tablet; diagram block hugs the board, no side padding beyond `p-3`.
  - Full size cleared, rotation 90°: the area-alone drawing stays inside its slot.
  - Area cleared: slot shows "–".
  - Editor view with everything empty: the tall Tablet "Add tablet…" prompt lines up with Mouse + Monitor prompts.
- [ ] **Step 5: Commit** `feat(setup): tablet card fits beside mouse and monitor, diagram fills its slot`.

### Task 7: Final check

- [ ] **Step 1:** Run `bun run check && bun run lint && bun run test`. Expected: 0 errors, all tests (server + client) pass.
- [ ] **Step 2:** Manual pass of the spec's list in Firefox too (no `text-box`: text still close to the grid, nothing clipped).
- [ ] **Step 3:** Update `docs/superpowers/specs/2026-11-06-setup-tab-design.md`'s addendum line about the 15rem diagram cap with a pointer to the new spec, and commit `docs(setup): point the old spec at the layout redesign`.
