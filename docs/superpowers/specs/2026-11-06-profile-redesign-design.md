# Player profile redesign (part 1)

Date: 2026-11-06

## Goal

Redesign the player profile page (`/player/[osuId]`) into a sidebar plus tabs, give every profile its owner's color, and let the owner edit their bio, links, description and tab order in place.

This is part 1 of a larger effort. Later parts each get their own spec:

1. **Profile redesign (this spec):** sidebar, tabs, tab order, per-page color, in-place editing of bio, links and description.
2. **Description rendering:** Markdown with osu! BBCode tags allowed, rendered safely (`markdown-it`, raw HTML off, plus an osu! BBCode plugin). Replaces the About tab's plain text.
3. **Setup tab:** keyboard, tablet, mouse, monitor, in-game and PC data, layout "K" from the design canvas, edit dialogs per card, "Main input" badge.
4. **Device catalog:** our own `devices` table with photos, an admin page, and a tablet import from OpenTabletDriver's configurations.
5. **Settings page leftovers:** colors (including a separate website color), the CodeMirror description editor with Vim mode and live preview, skin order and visibility.

Mockups: the "Player Profile Redesign" design canvas (layout B with the edits made there, plus the tab bar from D to K).

## Decisions

- **Short bio and long description are separate fields.** The sidebar shows a plain-text bio of at most 200 characters. The full description only appears in the About tab.
- **Tabs:** Skins, About and Setup. The Setup tab exists in the data model now but is never rendered until part 3.
- **Tab order is per player** and stored in the database. The owner reorders by dragging the tabs on their own profile. The new order saves on drop.
- **Visitors only see tabs with content.** Skins always shows. About shows when there is a description. (Part 3 defines Setup: at least one card with data.) The owner always sees every tab; empty ones show an "Add…" prompt.
- **The open tab lives in the URL** as `?tab=<id>`. Without `?tab`, the first visible tab in the player's order opens. An unknown or hidden `?tab` falls back to the same.
- **Color:** a player's page uses that player's `hue` for everything (navbar, accents, surfaces). Every other page uses the logged-in player's `hue`. Logged out, or no hue set, the site default (the `--hue` already in `layout.css`) applies.
- **Editing in place is owner-only.** Admins keep editing other players from the dashboard, so no admin endpoints are added for the profile page.
- **Links are shown as buttons:** the platform icon plus the username or host. Discord has no profile URL, so its button copies the username.

## Data model

`convex/schema.ts`, table `players`, two new optional fields:

```ts
/** Plain text, at most 200 characters. Shown in the profile sidebar. */
bio: v.optional(v.string()),
/** The owner's tab order. Missing or partial = default order (see resolveTabs). */
tab_order: v.optional(v.array(v.union(v.literal("skins"), v.literal("about"), v.literal("setup")))),
```

No migration: missing fields mean "no bio" and "default order".

`convex/validators.ts`: `playerFields` gains `bio` (admin edits). A shared `profileTab` validator holds the three literals so the schema, mutations and the client type come from one place.

## Pure helpers (unit tested)

### `resolveTabs(stored?: ProfileTab[]): ProfileTab[]`

In `src/lib/profile-tabs.ts`. Returns all three tabs in display order:

- keeps the stored order;
- drops duplicates (first one wins) and unknown values;
- appends any missing tab in the default order `skins, about, setup`.

`visibleTabs(order, content, isOwner)` filters that list: the owner gets everything; visitors only get tabs whose `content[tab]` is true. Setup is always passed as `false` until part 3.

### `linkTarget(type, value): { href: string | null; label: string }`

In `src/lib/links.ts`. Accepts either a full URL or a bare username, because existing data has both.

| type    | `href`                                    | `label`             |
| ------- | ----------------------------------------- | ------------------- |
| twitter | `https://x.com/<user>`                    | `@<user>`           |
| twitch  | `https://twitch.tv/<user>`                | `<user>`            |
| youtube | `https://youtube.com/@<user>`             | `@<user>`           |
| github  | `https://github.com/<user>`               | `<user>`            |
| discord | `null` (the button copies the username)   | `<user>`            |
| custom  | the URL, only if its scheme is http/https | host without `www.` |

- A URL for a platform is accepted from that platform's hosts only (for twitter: `x.com` and `twitter.com`); the username is the first path segment (`@` stripped for YouTube).
- Anything that can't be parsed falls back to `{ href: null, label: value }`, so a bad value never becomes a clickable link. `javascript:` and other schemes never produce an `href`.

## Endpoints

### `PATCH /api/me/profile` (owner)

The body gains two fields, validated in `src/lib/server/schemas.ts`:

- `bio`: trimmed string, at most 200 characters ("must be at most 200 characters").
- `tab_order`: an array containing each of `skins`, `about`, `setup` exactly once ("must list each tab exactly once").

`players.updateOwnProfile` accepts and writes both. The player is still identified from the session (`actor_osu_id` → `authUsers.player_id`), never from the body.

### `PATCH /api/players/[id]` (admin)

The body gains `bio` with the same rule. The dashboard player editor gets a bio field with a character counter.

## Color

The root layout (`src/routes/+layout.svelte`) renders, in `<svelte:head>`:

```svelte
<style>
:root { --hue: {hue}; }
</style>
```

- `hue = page.data.pageHue ?? data.user?.hue ?? null`. When it is `null`, no style is rendered and `layout.css` decides.
- `pageHue` comes from the player page's `load` (`player.hue`).
- `data.user.hue` is new: the root layout's `load` adds the logged-in user's player `hue` (looked up through `player_id`) to `AuthUser`.
- Before rendering, the value must pass `Number.isFinite` and is clamped to 0–360, so nothing but a number reaches the style tag.

Being server-rendered, the color is correct on first paint. The head updates by itself on client navigation, so leaving a profile switches back to the viewer's color. Part 5's separate "website color" will replace `data.user.hue` here and nothing else.

## Page layout

Route `src/routes/(public)/player/[osuId]/`. New components in that folder:

- `profile-sidebar.svelte`: avatar and name (previous usernames on hover, unchanged), the bio, a "Read more" link to the About tab when there is a description, the link buttons, and, for the owner, an "Edit profile" button. Stacks above the tabs on narrow screens.
- `link-button.svelte`: icon plus label from `linkTarget`. Icons: `simple-icons:x`, `simple-icons:twitch`, `simple-icons:youtube`, `simple-icons:github`, `simple-icons:discord` through the existing `Icon` component, `link` (Lucide) for custom. Discord copies the username and briefly shows "Copied".
- `profile-tabs.svelte`: the tab bar and the active panel. Switching tabs calls `goto("?tab=<id>", { replaceState: true, noScroll: true, keepFocus: true })`.
  - **Skins panel:** today's section moved as is: search, sort, "Show hidden skins" toggle, grid.
  - **About panel:** the description as plain text with `white-space: pre-wrap`. Part 2 replaces only this.
- `edit-profile-dialog.svelte`: bio (textarea, counter out of 200), links (type, value, remove, "Add link"), description (plain textarea until part 5). Save sends one `PATCH /api/me/profile`, then `invalidate("app:player:<osuId>")`.

Banner: unchanged, except that a broken image falls back to a block in the player's color, and the "needs to log in again" message only shows to the owner.

Owner detection: `isOwner = data.user?.player_id === data.player._id`.

### Owner-only behavior

- **Tab reordering:** `use:sortable` on the tab bar, with a grip icon on hover. On move, the local order updates immediately and `tab_order` is sent. On failure, the order reverts and the error shows the way the dashboard shows request errors.
- **Empty states:** no bio shows "Add a short bio"; an empty About tab shows "Add a description". Both open the edit dialog.

## Testing

- `resolveTabs` and `visibleTabs`: stored order kept, duplicates and unknown values dropped, missing tabs appended, owner sees all, visitors filtered.
- `linkTarget`: URL and bare-username input for every type; `twitter.com` and `x.com`; custom http/https; `javascript:` and unparseable input give `href: null`; empty value.
- Valibot: bio over 200 characters rejected; `tab_order` with a duplicate, a missing tab or an unknown tab rejected; a valid permutation accepted.
- The hue clamp helper: non-numbers give `null`, values outside 0–360 are clamped.
- No browser tests (Playwright's Chromium is not installed). The UI is checked by hand: tab switching and `?tab`, hidden empty tabs for visitors, drag-to-reorder saving, the edit dialog, the color switch between a profile and other pages.

## Out of scope

Markdown/BBCode rendering (part 2), the Setup tab and its data (part 3), the device catalog (part 4), the settings page, website color and description editor (part 5), and the fullscreen image viewer.
