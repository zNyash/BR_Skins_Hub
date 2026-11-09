# Design System Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every page follow the Design System artifact: one token per role, restyled shadcn primitives, a few shared components, applied page by page.

**Architecture:** Tokens land in `src/routes/layout.css` (`@theme inline`). shadcn primitives in `src/lib/components/ui/` are restyled in place (class strings only). A handful of own components in `src/lib/components/` replace hand-rolled duplicates. Then each page area is migrated in its own commit.

**Tech Stack:** SvelteKit, Svelte 5 runes, Tailwind v4, shadcn-svelte (bits-ui), vitest (+ vitest-browser-svelte for `*.svelte.test.ts`).

**Spec:** `docs/superpowers/specs/2026-11-09-design-system-design.md`. Rules and values: Design System artifact https://claude.ai/artifact/BTwnryA5op6HK5XhW9Ye1v (`project/README.md`, `project/components/<Name>/README.md`). Read both before starting.

## Global Constraints

- 4px grid only: no `*-0.5`, `*-1.5`, `*-2.5`, `*-3.5` spacing. Cards and tiles get equal padding on all four sides.
- Radius by role: `rounded-sm` 4 (badges over images), `rounded-md` 8 (controls, chips, tiles, rows inside a card, popovers, menus), `rounded-lg` 12 (cards, list rows on the page), `rounded-xl` 16 (panels: editor card, drawers, dialogs), `rounded-full` (pills, dots). No `rounded`, `rounded-2xl`, `rounded-3xl`.
- Colors in custom components: `crust`, `surface`, `layer-1..5`, `overlay`, `text`, `text-muted`, `accent-color`, `on-accent`, `success`, `warning`, `error`, `destructive` only. Never `card`, `popover`, `secondary`, `muted`, `accent` (as a color), `primary`, `background`, `foreground`, `muted-foreground`, `black/*` outside `src/lib/components/ui/`.
- Type: the `text-page-title … text-value-lg` utilities from Task 1 instead of `text-* font-*` pairs. Color is separate (`text-accent-color` on card titles, `text-text-muted` on labels and captions).
- Hover = one layer up (`layer-1` → `layer-2` → `layer-3`); selected = `layer-3`. No `hover:ring-*` / `hover:outline-*`. Accent outline only on `focus-visible`.
- Touch targets 44px below 900px (`h-11 min-[900px]:h-9` pattern, already used in the dashboard).
- Copy: sentence case, no emoji, Lucide icons via `Icon`.
- Commits: `type(scope): summary` + `- bullet` lines; **no Co-Authored-By trailer**.
- After every task: `bun run check`, `bun run lint`, `bun run test` pass.
- Do not open a PR. When the branch is done, report to the user; they open it with their own skill.

## Review Focus

1. **Profile tab bar reorder.** Converting `profile-tabs.svelte` to shadcn Tabs must keep the owner's drag-reorder (`use:sortable`) and the saved order working; arrow keys move focus only. → Task 6 keeps `data-sortable-item` / `data-sortable-handle` on the triggers and adds a browser test that the triggers still carry them and `?tab=` follows a click.
2. **Dashboard filter edge cases.** Clicking the selected chip or "All" clears `?filter=`; an unknown `?filter=` value shows "All" selected. → Task 3 browser test on `filter-chips.svelte`; Task 7 passes `parseFilter`'s result (unknown → `null`).
3. **Dashboard default sort.** Switching the dashboard header to `search-toolbar` must keep "Last edited, newest first" on first load. → Task 7 keeps `defaultSort: "updated", defaultOrder: "desc"`; the `derive`/list-query tests stay green.
4. **Page hue.** A player with `pageHue` must still recolor everything on the profile. Hard-coded colors break it. → Task 8 screenshot of a profile with a non-zero hue.
5. **Phone width (375px).** Filter chip row scrolls horizontally without a scrollbar; the toolbar fits without horizontal page scroll; buttons are 44px. → Task 8 screenshots at 375px.

---

### Task 1: Tokens

**Files:**

- Modify: `src/routes/layout.css` (the `@theme inline` block, radius lines ~134-140)
- Modify: `CLAUDE.md` (UI paragraph)

- [ ] **Step 1: Radius.** Replace the seven `--radius-*: calc(...)` lines with `--radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-xl: 16px;`. Leave `--radius: 0.5rem` in `:root`.
- [ ] **Step 2: Type scale.** In `@theme inline`, add per style `--text-<name>`, `--text-<name>--line-height`, `--text-<name>--font-weight` (Tailwind v4 font-size namespace, so `text-<name>` sets all three):

| name            | size     | line height | weight |
| --------------- | -------- | ----------- | ------ |
| `page-title`    | 1.5rem   | 2rem        | 700    |
| `section-title` | 1.125rem | 1.5rem      | 700    |
| `card-title`    | 1rem     | 1.5rem      | 700    |
| `body`          | 0.875rem | 1.25rem     | 400    |
| `body-strong`   | 0.875rem | 1.25rem     | 500    |
| `label`         | 0.75rem  | 1rem        | 500    |
| `caption`       | 0.75rem  | 1rem        | 400    |
| `value-lg`      | 1.5rem   | 1.75rem     | 700    |

No color is named `body`, `label`, `caption` etc., so `text-*` resolves to font size. Verify by building: a class like `text-caption` must yield `font-size: .75rem`.

- [ ] **Step 3: New tokens.** `:root`: `--overlay: oklch(0% 0 0 / 0.6);`. `@theme inline`: `--color-overlay: var(--overlay);`, `--shadow-float: 0 8px 32px oklch(0% 0 0 / 0.6);`. Durations as utilities: `@utility duration-fast { transition-duration: 100ms; }` and `@utility duration-base { transition-duration: 150ms; }`.
- [ ] **Step 4: CLAUDE.md.** In the UI paragraph, replace "(generated; avoid hand-editing)" with "(generated; restyle only their class strings, to the Design System tokens)" and add one sentence: "Design rules: Design System artifact https://claude.ai/artifact/BTwnryA5op6HK5XhW9Ye1v; `accent` there is `accent-color` in code."
- [ ] **Step 5: Verify.** `bun run check && bun run lint && bun run test` → all pass. `bun run build` → succeeds, and `grep -c -- '--text-caption--line-height' .svelte-kit/output/client/_app/immutable/assets/*.css` → at least 1 match.
- [ ] **Step 6: Commit** `feat(design-system): tokens for radius, type, overlay, shadow, durations`.

---

### Task 2: shadcn primitives

**Files:**

- Modify: `src/lib/components/ui/button/button.svelte`, `ui/tabs/tabs-list.svelte`, `ui/tabs/tabs-trigger.svelte`, `ui/select/select-trigger.svelte`, `ui/select/select-content.svelte`, `ui/select/select-item.svelte`, `ui/input/input.svelte`, `ui/input-group/*.svelte` (root only), `ui/textarea/textarea.svelte`, `ui/dialog/dialog-content.svelte`, `ui/dialog/dialog-overlay.svelte`, `ui/dialog/dialog-title.svelte`
- Create (via CLI): `ui/badge/`, `ui/toggle-group/` (and `ui/toggle/` if it comes along)
- Modify: every `variant="navigation"` / `variant="outline"` user (grep)

**Interfaces — Produces:**

- `Button` variants: `default` (primary), `secondary`, `ghost`, `destructive`, `link`. `navigation` and `outline` are removed.
- `Badge` variants: `accent` (default), `success`, `warning`, `soft`, `image`.
- `ToggleGroup.Root` / `ToggleGroup.Item` from `$comp/ui/toggle-group`.

- [ ] **Step 1: Button.** Base: `rounded-md text-body-strong`, `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-color` (drop the ring/border focus), `disabled:opacity-50`, `duration-fast transition-colors`. Variants:
  - `default`: `bg-accent-color text-on-accent hover:brightness-110`
  - `secondary`: `bg-layer-2 text-text hover:bg-layer-3`
  - `ghost`: `bg-transparent text-text-muted hover:bg-layer-2 hover:text-text`
  - `destructive`: `bg-destructive text-on-error hover:brightness-110`
  - `link`: `text-accent-color underline-offset-4 hover:underline`

  Sizes: `default` → `h-11 min-[900px]:h-9 gap-2 px-3`; `icon` → `size-11 min-[900px]:size-9`; `sm` → `h-8 gap-2 px-3`; `lg` → `h-10 gap-2 px-4`; `xs`, `icon-xs`, `icon-sm`, `icon-lg` keep their heights, `rounded-md`, gaps on the grid (`gap-1`). Remove the `rounded-[min(...)]` overrides and `in-data-[slot=button-group]` tweaks only where they reintroduce off-grid values.

- [ ] **Step 2: Replace removed variants.** `grep -rn 'variant="navigation"\|variant="outline"' src --include=*.svelte | grep -v /ui/` → change each to `variant="ghost"`. Re-run the grep: no matches.
- [ ] **Step 3: Tabs.** `tabs-list`: default variant `rounded-lg bg-layer-2 p-1 gap-1`; `line` variant `bg-transparent gap-4 p-0`. `tabs-trigger`: `text-body-strong text-text-muted hover:text-text`, `data-active:text-text`; default variant `rounded-md data-active:bg-layer-3`; line variant `rounded-none px-0` with the `after:` line `after:h-0.5 after:bg-accent-color after:bottom-0`; drop `shadow-sm`, `dark:` overrides and `gap-1.5`/`px-2 py-1` → `gap-2 px-3`. Focus: accent outline as in Button.
- [ ] **Step 4: Select.** Trigger: `h-11 min-[900px]:h-9 rounded-md bg-layer-1 px-3 pr-2 hover:bg-layer-2 data-[state=open]:bg-layer-2 text-body`. Content: `rounded-md bg-layer-2 shadow-float p-1`. Item: `h-8 rounded-md px-2 data-highlighted:bg-layer-3`, check icon `text-accent-color`.
- [ ] **Step 5: Inputs.** `input`, `input-group` root, `textarea`: `rounded-md bg-layer-1 text-body`, `h-11 min-[900px]:h-9` (not textarea), `border-transparent`, focus `outline-2 outline-accent-color`. Callers that sit inside a card add `bg-layer-2` themselves (Tasks 6–7).
- [ ] **Step 6: Dialog.** Overlay `bg-overlay`; content `rounded-xl bg-layer-1 p-4 gap-4`; title `text-card-title text-accent-color`.
- [ ] **Step 7: Install.** `bunx shadcn-svelte@latest add badge toggle-group` (answer no to overwriting existing files). Then restyle `badge`: base `h-6 rounded-full px-2 text-xs font-semibold` (no `px-2.5`); variants `default`→ rename to `accent` `bg-accent-color text-on-accent`, `success` `bg-success text-on-success`, `warning` `bg-warning text-on-warning`, `soft` `bg-layer-2 text-text-muted`, `image` `rounded-sm bg-overlay text-text`; remove `secondary`, `outline`, `destructive`, `link`. `toggle-group`: leave base styles; `filter-chips` (Task 3) styles items via `class`.
- [ ] **Step 8: Verify** check/lint/test pass; `grep -rnE '\b(bg|text)-(primary|secondary|muted|popover|card|accent)\b' src/lib/components/ui/{button,tabs,select,input,input-group,textarea,dialog,badge}` returns nothing.
- [ ] **Step 9: Commit** `feat(ui): restyle shadcn primitives to the design tokens` with bullets for the removed button variants and the new badge/toggle-group.

---

### Task 3: Shared components

**Files:**

- Create: `src/lib/components/card.svelte`, `avatar.svelte`, `list-row.svelte`, `tag-chip.svelte`, `empty-state.svelte`, `filter-chips.svelte`, `filter-chips-harness.svelte`, `filter-chips.svelte.test.ts`, `search-toolbar.svelte.test.ts`, `search-toolbar-harness.svelte`
- Rename: `src/lib/components/search-sorted.svelte` → `search-toolbar.svelte` (`git mv`), update its 5 importers (`(public)/+page.svelte`, `(public)/skins/+page.svelte`, `profile-tabs.svelte`, `assign-players-dialog.svelte`, `assign-skins-dialog.svelte`)

**Interfaces — Produces (exact props):**

- `card.svelte`: `{ title?: string; icon?: string; level?: 2 | 3 = 3; trailing?: Snippet; class?: string; children: Snippet }`. `<section aria-labelledby>` when titled. `rounded-lg bg-layer-1 p-4 flex flex-col gap-3`; header row `flex items-center gap-3`: icon tile `size-8 rounded-md bg-layer-2 text-accent-color` (icon `size-4`), `<h{level}>` `text-card-title text-accent-color`, `trailing` in `ml-auto flex items-center gap-2`.
- `avatar.svelte`: `{ osuId: number; size: 28 | 40 | 56 | 80; alt?: string = "" }`. shadcn `Avatar` with `shape-squircle rounded-md bg-layer-3`, image `osuAvatar(osuId)`, size via a `Record<size, class>` (`size-7`, `size-10`, `size-14`, `size-20`).
- `list-row.svelte`: `{ href: string; current?: boolean; leading: Snippet; children: Snippet; trailing?: Snippet }`. `<a>` `flex min-h-16 items-center gap-3 rounded-lg p-3 duration-fast transition-colors`, `bg-layer-3` + `aria-current="true"` when current, else `bg-layer-1 hover:bg-layer-2`; `children` in `min-w-0 flex-1`; `trailing` in `shrink-0 text-caption text-text-muted tabular-nums text-right`.
- `tag-chip.svelte`: `{ children: Snippet; onremove?: () => void; removeLabel?: string }`. `inline-flex h-7 items-center gap-1 rounded-md bg-layer-2 px-2 text-caption text-text`; when `onremove`, an × `<button aria-label={removeLabel}>` that is `size-11 min-[900px]:size-5` with `rounded-md hover:bg-layer-3`.
- `empty-state.svelte`: `{ icon: string; title: string; text?: string; action?: Snippet }`. Centered column, `gap-3 p-8`, icon tile `size-10 rounded-md bg-layer-2 text-text-muted`, title `text-body-strong`, text `text-caption text-text-muted`.
- `filter-chips.svelte`: `{ chips: { id: string; label: string; count: number }[]; value: string | null; total: number; onchange: (id: string | null) => void; label: string }`. shadcn `ToggleGroup.Root type="single"` with `aria-label={label}`. First item "All" (value `"all"`, count `total`), then one item per chip. Group value = `value ?? "all"`. On change: `""` (deselecting the current item) or `"all"` → `onchange(null)`, else `onchange(id)`. Item style: `h-11 min-[900px]:h-8 shrink-0 gap-1 px-0 rounded-none bg-transparent text-body text-text-muted hover:text-text data-[state=on]:text-body-strong data-[state=on]:text-text data-[state=on]:shadow-[inset_0_-2px_0_var(--accent-color)]`, count `text-caption tabular-nums`. Root: `no-scrollbar flex gap-4 overflow-x-auto`.
- `search-toolbar.svelte`: `{ list: ListQuery<T>; placeholder: string; total?: number; children?: Snippet }`. Row: input-group (grows, `flex-1`) + sort `Select` + order `Button variant="ghost" size="icon" aria-label="Reverse order"`, `gap-2`, no `ButtonGroup`. Under the row, when `total` is given: `<p class="text-caption text-text-muted tabular-nums">{list.results.length} of {total} shown</p>`; then `children` (filter chips). Keeps Escape-to-clear and the clear button (`aria-label="Clear search"`).

- [ ] **Step 1: Write the failing tests.**

  `filter-chips.svelte.test.ts` (harness renders `FilterChips` with chips `[{id:"no-skins",label:"No skins",count:1},{id:"no-setup",label:"No setup",count:54}]`, `total: 60`, records `onchange` calls in an exported `$state` array, `value` from a prop):
  - `"selects All when no filter is on"`: `value: null` → `page.getByRole("radio", { name: /All/ })` has `aria-checked="true"` (bits-ui single toggle-group items are radios; if they are buttons with `aria-pressed`, assert that instead).
  - `"reports the clicked filter"`: click "No setup" → last call is `"no-setup"`.
  - `"clicking the selected filter clears it"`: `value: "no-setup"`, click "No setup" → last call is `null`.
  - `"clicking All clears the filter"`: `value: "no-skins"`, click "All" → last call is `null`.
  - `"shows counts"`: "All" item text contains `60`, "No setup" contains `54`.

  `search-toolbar.svelte.test.ts` (harness builds `useListQuery(() => items, config)` over three `{name}` items with one sort option):
  - `"shows how many are shown"`: `total: 3`, fill search with a name matching one → text `1 of 3 shown`.
  - `"Escape clears the search"`: fill, press Escape → input value `""`.

- [ ] **Step 2: Run** `bunx vitest run src/lib/components/filter-chips.svelte.test.ts src/lib/components/search-toolbar.svelte.test.ts` → FAIL (components missing).
- [ ] **Step 3: Implement** the six components with the props above (and the `git mv` + importer updates). `search-toolbar` replaces the `outline` order button with ghost icon and drops `ButtonGroup`.
- [ ] **Step 4: Run** the two test files → PASS; then `bun run check && bun run lint && bun run test`.
- [ ] **Step 5: Commit** `feat(components): card, avatar, list row, tag chip, empty state, filter chips, search toolbar`.

---

### Task 4: Shell and shared

**Files:** `src/lib/components/navbar.svelte`, `user-icon.svelte`, `popover.svelte`, `confirm-dialog.svelte`, `hold-button.svelte`, `hue-picker.svelte`, `skin-card.svelte`, `image-carousel.svelte`, `src/routes/+error.svelte`, `src/routes/+layout.svelte` (toaster), `src/routes/(public)/+layout.svelte`, `src/routes/(admin)/+layout.svelte`, `src/routes/layout.css` (`::selection`)

- [ ] **Step 1:** Apply the Global Constraints to each file. Specifics:
  - `popover.svelte`: `rounded-md bg-layer-2 shadow-float` (no outline).
  - `skin-card.svelte`: card `rounded-lg bg-layer-1`; `hover:outline-*` → `hover:bg-layer-2`; the badge over the image → `<Badge variant="image">`.
  - `image-carousel.svelte`: prev/next buttons `variant="secondary"` keep; indicator colors `bg-background` → `bg-surface`, `bg-popover/50` → `bg-overlay`, `bg-primary` → `bg-accent-color`. The `h-0.5` indicator line and `w-1` dot are deliberate exceptions (2px/4px marks, not spacing).
  - `user-icon.svelte`: avatar → `<Avatar size={28}>` if it shows a player picture.
  - `::selection` → `var(--accent-color)` / `var(--on-accent-color)`.
  - Toaster: `layer-2` background, `rounded-md`, `shadow-float` via `toastOptions.class`.
- [ ] **Step 2: Verify** `grep -nE 'bg-(card|popover|secondary|muted|primary|background|accent)\b|text-(primary|foreground|muted-foreground)\b|bg-black/|rounded(-2xl|-3xl)?\b[^-]|hover:(ring|outline)-|-[0-9]\.5\b' <the files above>` → only the listed exceptions; check/lint/test pass.
- [ ] **Step 3: Commit** `style(shell): apply design tokens to the navbar, popover, dialogs and skin card chrome`.

---

### Task 5: Public lists

**Files:** `src/routes/(public)/+page.svelte`, `src/lib/components/player-card.svelte` (delete), `src/routes/(public)/skins/+page.svelte`, `src/routes/(public)/skins/[skinId]/+page.svelte`

- [ ] **Step 1:** Players list `/`: replace `PlayerCard` with `ListRow` (`leading` = `<Avatar size={40} osuId>`, children = name in `text-body-strong`), no cover, no ring. `SearchToolbar` with `total={data.players.length}` (replaces "Loaded N players"). Page title `text-page-title` if the page has one. Delete `player-card.svelte` once unused.
- [ ] **Step 2:** `/skins` and `/skins/[skinId]`: `SearchToolbar` with `total`; titles `text-page-title`; info blocks as `Card`; meta lines `text-caption text-text-muted`; the player list on the skin page uses `ListRow` + `Avatar size={40}`.
- [ ] **Step 3: Verify** grep (as Task 4) on these files is clean; check/lint/test pass.
- [ ] **Step 4: Commit** `style(public): players and skins lists on list rows and the search toolbar`.

---

### Task 6: Player profile

**Files:** everything in `src/routes/(public)/player/[osuId]/` (`+page.svelte`, `profile-sidebar.svelte`, `link-button.svelte`, `links-card.svelte`, `profile-tabs.svelte`, `about-panel.svelte`, `setup-card.svelte`, `setup-panel.svelte`, `filter-chips.svelte`, `tablet-diagram.svelte`, `setup-dialog.svelte`, `settings-tab.svelte`, `settings-card.svelte`, `colors-card.svelte`, `preferences-card.svelte`, `tab-order-card.svelte`); `src/lib/components/links-editor.svelte`

- Create: `src/routes/(public)/player/[osuId]/profile-tabs.svelte.test.ts` + harness if `profile-tabs` can't render standalone.

- [ ] **Step 1: Failing test** `"tab triggers stay sortable and follow ?tab="`: render the tab bar as owner with tabs skins/about/setup → every trigger has `data-sortable-item`, owner triggers have `data-sortable-handle`; clicking "About" makes it `aria-selected="true"` and calls the same `openTab` path (assert `page.url` search or the spy the harness passes). Run → FAIL.
- [ ] **Step 2: profile-tabs.** Replace the hand-made bar with shadcn `Tabs.Root value={active}` + `Tabs.List variant="line"` + `Tabs.Trigger` per visible tab, keeping `use:sortable` on the list and the `data-sortable-*` attributes and count spans (`text-caption text-text-muted`) on the triggers. `onValueChange` calls the existing `openTab`. Panels can stay as they are (`{#if active === …}`), only the bar changes. Run the test → PASS.
- [ ] **Step 3: Cards.** `settings-card.svelte` becomes a thin `Card level={2}` (or its users switch to `Card` and the file is deleted). `setup-card.svelte` wraps `Card` (`icon`, `title`, `trailing` = badge + edit button `Button variant="ghost" size="icon"`), keeping its `@container` and `aria-labelledby`. "Main input" → `<Badge variant="accent">`. Sidebar boxes, links card and about panel → `Card` (`p-4` everywhere; no `px-5 py-4` / `px-7 py-6`).
- [ ] **Step 4: Setup panel.** The `tile` snippet: `rounded-md bg-layer-2 p-3 gap-2`, label `text-label text-text-muted`, value `text-value-lg` + unit `text-caption text-text-muted`. Rapid-trigger badge → `Badge` (`accent` enabled, `soft` disabled / no RT). Add-prompt: `rounded-lg border-dashed border-layer-5 hover:bg-layer-2` (no `hover:border-primary`). Tile `h-18` and `min-h-30` stay (heights on the grid).
- [ ] **Step 5: OTD filter chips** (`filter-chips.svelte` here are tablet plugin filters, not list filters): chip look = tag look: `h-7 rounded-md bg-layer-2 px-2 text-caption` (update `CHIP`; `GAP` stays 8). Popover title `text-card-title`.
- [ ] **Step 6: Rest.** `setup-dialog`, settings cards, link buttons (`bg-layer-1 hover:bg-layer-2 rounded-md`), sidebar avatar → `Avatar size={80}`, player name `text-page-title`.
- [ ] **Step 7: Verify** grep clean on the folder; check/lint/test pass.
- [ ] **Step 8: Commit** `style(profile): cards, tabs, tiles and badges from the design system`.

---

### Task 7: Dashboard

**Files:** `src/routes/(admin)/dashboard/**/*.svelte` (rail, bottom-tabs, `+layout`, `+page`, `list-pane`, `editor-frame`, `unsaved-bar`, players/skins `+layout`, `+page`, rows, `[id]` pages and tabs, `images-field`, all dialogs incl. `tag-input`)

**Interfaces — Consumes:** `FilterChips`, `SearchToolbar`, `ListRow`, `Avatar`, `TagChip`, `EmptyState`, `Card` from Task 3.

- [ ] **Step 1: List headers** (players and skins `+layout.svelte`): title `text-page-title`; New = `<Button>` (primary) with plus icon; replace the `Input` + native `<select>` + chip links + "n of N shown" with `<SearchToolbar list={listQuery} placeholder="Search players" total={data.players.length}>` whose child is `<FilterChips label="Filter players" chips={chips.map(c => ({ id: c.id, label: c.label, count: c.matches.length }))} value={filter} total={data.players.length} onchange={(id) => goto(chipHref(id), { replaceState: true, noScroll: true, keepFocus: true })} />`. `chipHref` takes `string | null` and sets the param to the id (no toggling: FilterChips already maps re-click to `null`). Delete `SORTS`, `setSort` and `field`. Keep `defaultSort: "updated", defaultOrder: "desc"`. Same for skins.
- [ ] **Step 2: Rows.** `player-row` → `ListRow` (`leading` = `Avatar size={40}`, trailing = skin count, setup dots, time). `skin-row` → `ListRow` (`leading` = thumbnail `h-10 w-16 rounded-md bg-layer-3`). The setup dots `size-2` stay.
- [ ] **Step 3: Editor frame.** Card `rounded-xl`; the tab bar → shadcn `Tabs` default (segmented) variant with `value={tab}` and `onValueChange` → `goto(tabHref(id), { replaceState: true, noScroll: true, keepFocus: true })`; header avatar `Avatar size={56}`; title `text-card-title`. Drawer in `list-pane`: `rounded-t-2xl` → `rounded-t-xl`, `shadow-lg` → `shadow-float`, scrim `bg-overlay`.
- [ ] **Step 4: Empty states.** "Select a player/skin" pages and Home's empty lists → `EmptyState`. Home cards → `Card`.
- [ ] **Step 5: Dialogs.** `tag-input`: pills → `TagChip` with `onremove` and `removeLabel="Remove {tag}"`; label `text-label`. Assign dialogs: replace the selection chips with `TagChip`, keep pickers' behavior and layout; their 17 alias/off-grid hits → tokens. Creator/delete dialogs: tokens only.
- [ ] **Step 6: Unsaved bar.** Stays in `dashboard/` (only the dashboard uses it); restyle: `rounded-lg bg-layer-2 shadow-float`, Reset `Button variant="ghost"`, Save `Button` (primary). The shake keyframes are untouched.
- [ ] **Step 7: Verify** grep clean on `src/routes/(admin)`; check/lint/test pass (incl. `unsaved.svelte.test.ts`, `list-pane.svelte.test.ts`, `derive.test.ts`).
- [ ] **Step 8: Commit** `style(dashboard): search toolbar, underline filter chips, list rows and tokens` with a bullet for feedback #5.

---

### Task 8: Final sweep, screenshots, artifact

**Files:** whatever the sweep finds; Design System artifact `project/README.md` (and component READMEs if a value changed).

- [ ] **Step 1: Whole-repo grep.** Over `src/**/*.svelte` excluding `src/lib/components/ui/`: `bg-(card|popover|secondary|muted|primary|background)\b`, `bg-accent\b`, `text-(primary|foreground|muted-foreground)\b`, `bg-black/`, `rounded-(2xl|3xl)`, `\brounded\b(?!-)`, `hover:(ring|outline)-`, `-[0-9]\.5\b`. Fix every hit except the exceptions named in Tasks 4–6; list the remaining exceptions in the final report.
- [ ] **Step 2: Screenshots.** `preview_start` the dev server (add a `.claude/launch.json` entry for `bun run dev` if missing; Convex must be running: `bunx convex dev` in the background). Capture `/`, `/skins`, `/skins/<an id>`, a player profile, and a profile whose player has a non-zero `pageHue`, at desktop and 375px. For "before" shots, run `main` from a worktree (`git worktree add ../bsh-main main`) on another port with the same Convex URL; remove the worktree afterwards.
- [ ] **Step 3: Artifact.** Read `project/README.md` and the index, then publish an update: under Color, "`accent` is `accent-color` in code (Tailwind's `accent` is shadcn's layer-3 alias)"; under Building a component, "shadcn primitives are restyled in place (class strings only); Card is our own, not shadcn `card`"; any value a task had to change. Index written last with `lastChange`.
- [ ] **Step 4: Verify** check/lint/test pass; `git status` clean apart from untracked local files.
- [ ] **Step 5: Commit** any sweep fixes as `style: last design-system sweep`. Do **not** push or open a PR. Report to the user: commits on the branch, remaining exceptions, what they must check by hand (dashboard and owner-only profile features need their login: tab drag-reorder, settings tab, unsaved bar).
