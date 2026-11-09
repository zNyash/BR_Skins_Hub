# Design system pass

The UI is inconsistent across pages: the same layer is reached through six names, eight radii are in use (two off the 4px grid), there are three hover styles, six chip implementations, and title weights vary for the same role (see `docs/superpowers/notes/2026-11-09-design-system-audit.md`). This spec applies the Design System artifact to the whole site, public pages and dashboard, so that the same role always gets the same token and the same look.

The rules live in the **Design System artifact** (https://claude.ai/artifact/BTwnryA5op6HK5XhW9Ye1v: `project/README.md`, `project/tokens.json`, `project/components/<Name>/README.md`). This spec decides how they land in code; where the two disagree on a value, the artifact wins, except for the naming notes below.

## Decisions

- One branch (`feat/design-system`), one PR, built in phases: tokens → components → page by page. Each phase (and each page area) is its own commit. The user reviews at the end and opens the PR with their own skill: stop and report when the branch is ready, don't run `gh pr create`.
- The Firefox carousel fix (`shrink-0` on the slides) is already committed first on the branch.
- shadcn primitives are restyled **in place**: only their class strings in `src/lib/components/ui/` change to use our tokens. No wrapper components around them. CLAUDE.md gets a line saying so.
- The accent stays `accent-color` in code (`text-accent-color`, `bg-accent-color`), because Tailwind's `accent` is shadcn's layer-3 alias. The artifact gets a note: `accent` = `accent-color` in code.
- Custom components use only `crust`, `surface`, `layer-1..5`, `overlay`, `text`, `text-muted`, `accent-color` and the semantic colors. The shadcn aliases (`card`, `popover`, `secondary`, `muted`, `accent`, `primary`, `background`, `foreground`) stay defined, for `ui/` only.
- Own components only where two or more places use them (no over-abstraction). One-line patterns stay utility classes.
- Dashboard feedback #1, #2, #3 and #5 (`docs/superpowers/notes/2026-11-09-dashboard-feedback.md`) are fixed here.

### Out of scope

- Dashboard feedback #4 (Setup tab → read-only preview of the real setup): the next PR.
- Skin card redesign with shadcn `aspect-ratio`: after that. This pass only touches the skin card's chrome (hover, badge over the image, radius).
- Fullscreen image viewer, device catalog, any Convex change.

## Phase 1 · Tokens (`src/routes/layout.css`)

**Radius.** Replace the `calc(var(--radius) * n)` scale with fixed values and drop the rest:

| Token          | Value | Role                                                        |
| -------------- | ----- | ----------------------------------------------------------- |
| `--radius-sm`  | 4px   | badges over images, tiny counters                           |
| `--radius-md`  | 8px   | controls: buttons, inputs, chips, tiles, rows inside a card |
| `--radius-lg`  | 12px  | cards and list rows on the page                             |
| `--radius-xl`  | 16px  | panels: editor card, drawers, dialogs                       |
| `rounded-full` | –     | pills, dots, scrollbar thumb                                |

`--radius-2xl`, `--radius-3xl` and `--radius-4xl` are removed, so leftover uses fail visibly instead of silently drifting. `--radius` itself stays at 8px for any primitive that reads it directly.

Expected side effect: everything using `rounded-md` becomes 8px (was 6.4px), and everything using `rounded-lg` becomes 12px (was 8px). Cards want that; tiles, rows inside cards and popovers move to `rounded-md` in the page phases.

**Type.** One `@utility` per named style, each setting size, line height and weight together:

| Utility              | Size / line | Weight | Notes                             |
| -------------------- | ----------- | ------ | --------------------------------- |
| `text-page-title`    | 24 / 32     | 700    | one per page                      |
| `text-section-title` | 18 / 24     | 700    | a group of cards                  |
| `text-card-title`    | 16 / 24     | 700    | consumer adds `text-accent-color` |
| `text-body`          | 14 / 20     | 400    | default                           |
| `text-body-strong`   | 14 / 20     | 500    | names in rows, button labels      |
| `text-label`         | 12 / 16     | 500    | consumer adds `text-text-muted`   |
| `text-caption`       | 12 / 16     | 400    | consumer adds `text-text-muted`   |
| `text-value-lg`      | 24 / 28     | 700    | tile number                       |

Color is not baked into the utilities, so they compose with hover and selected states. If a `text-*` utility name collides with an existing Tailwind theme key, the plan picks a non-colliding name and records it.

**New tokens.**

- `--overlay: oklch(0% 0 0 / 0.6)` → `bg-overlay` (replaces `bg-black/50..70`).
- `--shadow-float: 0 8px 32px oklch(0% 0 0 / 0.6)` → `shadow-float`.
- `--duration-fast: 100ms`, `--duration-base: 150ms`, exposed as Tailwind durations.

Existing values (layers, text, accent, semantic colors) don't change.

## Phase 2 · Components

### shadcn primitives, restyled in place

| Primitive                          | Result                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `button`                           | variants primary (`default`, accent fill, `on-accent` text), `secondary` (`layer-2`, hover `layer-3`), `ghost` (no fill, `text-muted`, hover `layer-2` + `text`), `destructive`; icon sizes square. Height 36px, 44px below 900px. `radius-md`, label `body-strong`, 16px icon with an 8px gap. Focus: 2px accent outline, 2px offset. Disabled: 50% opacity. |
| `tabs`                             | `variant="line"`: labels `text-muted` → `text` when active, active line 2px `accent-color`. Default variant: `layer-2` track (`radius-lg`, 4px padding), active trigger `layer-3`.                                                                                                                                                                            |
| `select`                           | trigger `layer-1`, hover/open `layer-2`, chevron 8px from the right edge; menu `layer-2`, `radius-md`, `shadow-float`; options 32px, highlighted `layer-3`, accent check on the current one.                                                                                                                                                                  |
| `input`, `input-group`, `textarea` | `layer-1` (on `surface`) or `layer-2` (inside a card), `radius-md`, same 36/44px height as buttons, accent focus outline.                                                                                                                                                                                                                                     |
| `dialog`                           | `layer-1` panel, `radius-xl`, `bg-overlay` scrim, `card-title`-style heading.                                                                                                                                                                                                                                                                                 |

New installs (`bunx shadcn-svelte@latest add <name>`):

- `badge`: variants accent, success, warning, soft (`layer-2` + `text-muted`), over-image (`bg-overlay`, `radius-sm`). 24px pill, 12px semibold. Never clickable.
- `toggle-group`: the base of the filter chips.
- `card`: installed and used only if its parts fit the Card anatomy below without overrides on every use; otherwise our own `card.svelte`. The plan checks and records which.

### Own components (`src/lib/components/`)

| File                           | Anatomy                                                                                                                                                                                                                                                                                                                                                                                                                   | Replaces                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `filter-chips.svelte`          | shadcn toggle-group `type="single"`; each item is underline text (`text-muted`, hover `text`, selected `text` + `body-strong` + 2px accent line) with a `caption` count in tabular figures; "All" first, selected when no filter is on; value bound by the consumer (dashboard binds it to `?filter=`). 32px tall, 44px below 900px, 16px between items, one row that scrolls horizontally without a scrollbar on phones. | dashboard filter pills; profile setup filter chips    |
| `tag-chip.svelte`              | `layer-2`, `radius-md`, `caption`; optional × button with an `aria-label`; "+ tag" variant with a dashed `layer-5` outline.                                                                                                                                                                                                                                                                                               | tag-input pill; assign dialog toggle chips            |
| `card.svelte` (or shadcn card) | `layer-1`, `radius-lg`, `p-4`, children 12px apart; optional header: 32px icon tile (`layer-2`, `radius-md`, icon in accent), `card-title` in accent, trailing slot.                                                                                                                                                                                                                                                      | settings, sidebar, about, setup and empty-state cards |
| `tile.svelte`                  | `layer-2`, `radius-md`, `p-3`, 8px between label and value; `label` on top; `value-lg` + `caption` unit, or `body-strong` text with the `fade` utility; "–" when empty.                                                                                                                                                                                                                                                   | setup tiles                                           |
| `list-row.svelte`              | whole row is the link; `layer-1`, `radius-lg`, `p-3`, 12px gap; leading slot (avatar or thumbnail), `body-strong` name, trailing `caption` meta; hover `layer-2`, selected `layer-3` + `aria-current`. No cover, no accent outline.                                                                                                                                                                                       | public player card; dashboard player and skin rows    |
| `avatar.svelte`                | shadcn avatar inside, squircle (`shape-squircle`, falling back to `radius-md`); sizes 80, 56, 40, 28; image from `osuAvatar(osu_id)`.                                                                                                                                                                                                                                                                                     | round and squircle avatar mix                         |
| `search-toolbar.svelte`        | input-group with a search icon (grows), shadcn select for sort, ghost icon button for order (`aria-label`), all one height on `layer-1`; below: `caption` "n of N shown", then an optional filter-chips slot.                                                                                                                                                                                                             | `search-sorted.svelte`; dashboard list header         |
| `empty-state.svelte`           | icon tile, one `body-strong` line, one `caption` line, at most one button. Inline "No setup yet." stays plain `text-muted` text.                                                                                                                                                                                                                                                                                          | dashboard and profile empty cards                     |
| `unsaved-bar.svelte`           | moved from `src/routes/(admin)/dashboard/` to `$comp`; `layer-2`, `radius-lg`, `shadow-float`, max 640px, bottom center; Reset (ghost) and Save changes (primary); shake + `error` ring for 600ms. Behavior unchanged.                                                                                                                                                                                                    | –                                                     |

Section headers stay a utility pattern (`text-section-title` + 12px below), not a component.

## Phase 3 · Page by page

Every area gets the same treatment:

1. shadcn aliases → layer tokens;
2. radius by role;
3. type utilities instead of ad-hoc `text-* font-*` pairs;
4. 4px grid, equal padding on all four sides of cards and tiles, same gap at every level of a group;
5. hover = one layer up; accent ring/outline only on keyboard focus;
6. the components above instead of hand-rolled ones.

One commit per area, in this order:

1. **Shell and shared:** `navbar`, `page-heading`, `+error.svelte`, `popover` (`layer-2`, `radius-md`, `shadow-float`), `confirm-dialog`, toaster, skin card chrome (outline hover → layer step, image badge → over-image Badge, radius), `image-carousel` buttons and indicators (tokens only).
2. **Public lists:** players list `/` (player card → `list-row` + squircle avatar), `/skins`, `/skins/[skinId]`; both lists use `search-toolbar`.
3. **Player profile:** `profile-sidebar`, `link-button`, `links-card`, `profile-tabs` (shadcn tabs `line`, value in `?tab=`), `about-panel`, `setup-card` (card header pattern), `setup-panel` (tiles, filter chips), rapid-trigger and "Main input" → Badge, settings tab cards (`settings-card`, `colors-card`, `preferences-card`, `tab-order-card`), `setup-dialog`.
4. **Dashboard:**
   - rail and bottom tabs;
   - `list-pane` → `search-toolbar` + `filter-chips` (feedback #5);
   - `player-row` / `skin-row` → `list-row`, cover banner removed (#1); the faded cover stays only in the player editor header;
   - `editor-frame`: segmented tabs, `radius-xl`; the ‹ n/N › stepper removed with its keyboard and route wiring if nothing else uses it (#2);
   - `links-tab`: tighter spacing (#3), on the 4px grid;
   - dialogs: `tag-input` → `tag-chip`, assign pickers keep their behavior and layout, delete/creator dialogs restyled;
   - unsaved bar imported from `$comp`.

## Testing and done criteria

- `bun run check`, `bun run lint` and `bun run test` pass after every commit.
- Logic that has tests keeps them (`list-query`, dashboard helpers, unsaved-bar and popover browser tests). New logic gets a colocated test: the filter-chips "All"/value mapping if it isn't a direct binding, and anything the stepper removal changes in the dashboard route helpers.
- A grep over custom `.svelte` files (excluding `src/lib/components/ui/`) finds none of:
  - `bg-card`, `bg-popover`, `bg-secondary`, `bg-muted`, `bg-accent` (but `bg-accent-color` is fine), `bg-primary`, `text-primary`, `bg-black/`
  - `rounded-2xl`, `rounded-3xl`, plain `rounded`
  - fractional spacing (`-0.5`, `-1.5`, `-2.5`, `-3.5`)
  - `hover:ring-`, `hover:outline-`

  Deliberate exceptions (e.g. a 2px underline offset, the carousel indicator heights) are listed in the plan with their reason.

- Before/after screenshots of `/`, `/skins`, `/skins/[skinId]` and a player profile in the preview browser. The dashboard needs an admin login, so the user checks it in their browser.
- After the last commit: update the Design System artifact (accent naming note, "shadcn primitives are restyled in place" rule, any value the plan had to change) and report the branch as ready for the user's PR skill.
