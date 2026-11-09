# Design system audit (2026-11-09)

What the site uses today, grouped by kind, with the duplicates that make it feel inconsistent. Counts are across the 69 custom `.svelte` files (shadcn `ui/` excluded).

## Tokens

### Color: background layers

One elevation scale exists in `layout.css` (`crust` → `surface` → `layer-1..5`), but it's reached through **6 names** for the same values:

| Used as                                      | Count       | Is really                                 |
| -------------------------------------------- | ----------- | ----------------------------------------- |
| `bg-layer-1` / `bg-card` / `bg-muted`        | 21 / 13 / – | layer-1                                   |
| `bg-layer-2` / `bg-popover` / `bg-secondary` | 28 / 5 / –  | layer-2                                   |
| `bg-layer-3` / `bg-accent`                   | 16 / 9      | layer-3                                   |
| `bg-surface` / `bg-background`               | 7 / 1       | surface                                   |
| `bg-black/50..70`                            | 9           | ad-hoc overlays (image badges, backdrops) |

→ Decide: components use only `surface`, `layer-1..5` (+ one overlay token). The shadcn names stay as aliases for the generated primitives only.

### Color: accent and semantic

`bg-primary` (12) and `text-accent-color` / `text-primary` are the same accent under two names. Semantic colors (`success`, `warning`, `error`) exist and are used sparingly (good).

### Radius

**8 values in use:** `rounded-sm` 3, `rounded` 4, `rounded-md` 13, `rounded-lg` 36, `rounded-xl` 14, `rounded-2xl` 9, `rounded-3xl` 1, `rounded-full` 25.
The same kind of thing gets different radii: cards are `lg`, `xl` or `2xl`; empty states `2xl`; settings cards `xl`; setup tiles `lg`.
→ Decide a small scale by role (e.g. control 8 · tile 8 · card 12 · panel 16 · pill full).

### Type

Sizes: `text-xs` 49, `text-sm` 83, `text-base` 4, `text-lg` 3, `text-xl` 6, `text-2xl` 6.
Titles mix weights for the same role: page titles `font-bold` (profile, skin page) vs `font-semibold` (dashboard); card titles `text-base font-bold text-primary` (settings, setup) vs `text-lg font-bold` (setup panel) vs `mb-3 text-base font-bold` (filter popover).
→ Decide a named scale: page title, section title, card title, body, label, caption, and one weight per role.

### Spacing

On the 4px grid in new code; older code still has `py-0.5`, `pl-2.5`, `px-5 py-4` / `px-4 py-3` / `px-7 py-6` card paddings (asymmetric, against the rule).

### Elevation / hover

Three hover languages: background step (`hover:bg-layer-2/3/4`, 21), ring (`hover:ring-primary`, player cards), outline (`hover:outline-primary`, skin cards).
Shadows: `shadow`, `shadow-sm`, `shadow-lg` used ad hoc.
→ Decide one rule: interactive surfaces step up one layer on hover; accent ring/outline only for focus (and maybe for "media cards").

## Components

| Component                | Variants found today                                                                                                                                                                                                                                                                                                 | Where                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Pill / chip**          | 6 different implementations: tag pill (`layer-2`, `py-0.5 pl-2.5`), dialog toggle chips (`border px-3 py-0.5`), dashboard filter chips (`rounded-full px-4`, counts), setup filter chips (`layer-3 px-3 py-1 font-medium`), setup badge (`bg-primary px-2 py-1`), rapid-trigger badge (`border px-3 py-1`, 3 states) | tag-input, assign dialogs, dashboard layouts, filter-chips, setup-card, setup-panel |
| **Card**                 | settings card (`rounded-xl bg-card px-5 py-4`, accent title), sidebar card (`rounded-xl bg-card px-4 py-3`), about card (`px-7 py-6`), setup card, dashboard editor card (`rounded-2xl`), empty state card (`rounded-2xl p-4`)                                                                                       | profile, dashboard                                                                  |
| **Tile** (label + value) | setup tiles (`rounded-lg bg-layer-2 p-3`, small label + big value + unit)                                                                                                                                                                                                                                            | setup-panel                                                                         |
| **List row**             | player card (cover bg, ring hover), dashboard player row, skin row, home rows (`rounded-xl bg-layer-1 p-3`)                                                                                                                                                                                                          | public list, dashboard                                                              |
| **Media card**           | skin card (carousel, outline hover, image badge `bg-black/60`)                                                                                                                                                                                                                                                       | skins, profile, dashboard                                                           |
| **Tabs**                 | underline tabs with muted count (profile), segmented tabs in a `layer-2` track (dashboard editor)                                                                                                                                                                                                                    | profile-tabs, editor-frame                                                          |
| **Search + sort**        | `search-sorted` (icon input + ghost select + order button) vs dashboard header (input + select, different sizes)                                                                                                                                                                                                     | lists                                                                               |
| **Section header**       | icon tile + accent title + right badge (setup cards)                                                                                                                                                                                                                                                                 | setup-card                                                                          |
| **Link chip**            | social link buttons (`layer-1`, icon + handle)                                                                                                                                                                                                                                                                       | profile sidebar                                                                     |
| **Buttons**              | shadcn Button (variants default/secondary/ghost/destructive) + hand-rolled buttons with `bg-layer-2/3 hover:…`                                                                                                                                                                                                       | everywhere                                                                          |
| **Inputs**               | shadcn Input/Select/Textarea + hand-rolled `{field} rounded-lg bg-layer-2`                                                                                                                                                                                                                                           | dashboard                                                                           |
| **Popover**              | own native popover (`bg-layer-2 rounded-lg outline`)                                                                                                                                                                                                                                                                 | profile, skin card, dashboard menu                                                  |
| **Dialog**               | shadcn Dialog; delete (type the name), confirm, creators, assign                                                                                                                                                                                                                                                     | dashboard, profile                                                                  |
| **Toast**                | svelte-sonner                                                                                                                                                                                                                                                                                                        | everywhere                                                                          |
| **Floating bar**         | unsaved bar (`rounded-xl bg-layer-2 shadow-lg`)                                                                                                                                                                                                                                                                      | dashboard                                                                           |
| **Empty state**          | "Select a player" cards, "No setup yet.", "All good."                                                                                                                                                                                                                                                                | dashboard                                                                           |
| **Avatar**               | squircle (`shape-squircle rounded-md`) in player cards, round in dashboard rows                                                                                                                                                                                                                                      | public, dashboard                                                                   |

## What the public site does well (keep)

- Calm dark layers with one hue; the page hue recolors everything.
- Underline tabs with a muted count ("Skins 10").
- Setup tiles: small muted label, big value, small unit.
- Section header with an icon tile and accent title.
- Squircle avatars.
- Accent used sparingly (titles, badges, primary action).

## Problems to solve

1. One name per layer, one hover rule.
2. A radius scale by role.
3. A type scale by role (one weight each).
4. **One chip component** with variants (filter/toggle, tag/removable, status badge) — today there are 6.
5. **One card component** with equal padding and one title style.
6. One list-row pattern for players and skins (public + dashboard), one avatar shape.
7. One search/sort/filter toolbar.
8. Tabs: decide when underline vs segmented.
