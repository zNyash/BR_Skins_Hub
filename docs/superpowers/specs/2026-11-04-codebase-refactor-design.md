# Codebase refactor: design

Date: 2026-11-04 · Branch: `refactor`

## Goal

Make the codebase simpler and easy to scan, the way a senior engineer would write it: the simplest
code that works, no dead code, one Convex function per job, only the API routes that need to exist,
consistent structure and clear names.

Ground rules:

- Repetition of 2–3 occurrences is fine. Extract only when the abstraction costs nothing to
  understand (it reads as obviously as the code it replaces).
- No user-facing behavior changes except the fixes and features listed here.
- Every phase leaves the app working: `bun run check`, `bun run lint` (0 errors), `bun run test`
  and `vite build` all pass.

## Phases

One branch, five phases, committed in order. Later phases depend on earlier ones.

1. Dead code removal
2. Convex layer
3. API routes
4. Errors and feedback
5. Frontend cleanup (includes the delete dialog and folder/naming moves for components)

Folder moves for non-component files (`$lib/hooks`, `$lib/server/*`) happen in the phase that
first touches each file.

Phases 2 and 3 change contracts that other code depends on. Each one updates its callers
minimally in the same phase (loaders and routes in phase 2; dashboard `fetch` URLs and bodies in
phase 3) so the app keeps working. Phase 4 then converts those call sites to `request()`.

---

## Phase 1: Dead code removal

Delete:

- `src/routes/(admin)/dashboard_old/` (whole folder).
- Unused shadcn components in `src/lib/components/ui/`: `alert-dialog`, `badge`, `card`, `empty`,
  `form`, `label`, `navigation-menu`, `scroll-area`, `skeleton`.
- Unused dependencies: `@svelte-put/copy`, `@svelte-put/popover`, `svelte-portal`,
  `@internationalized/date`, `mode-watcher`, `@iconify/tailwind4` (and its `@plugin` line in
  `layout.css`), `@iconify-json/lucide`, `formsnap`, `sveltekit-superforms`.
- Commented-out color palette in `src/routes/(public)/+page.svelte`.
- Navbar hide-on-scroll logic in `src/routes/(public)/+layout.svelte` (`isHidden` and its
  `$effect`). The navbar stays always visible and keeps the `isFloating` style past 60px.

Keep `valibot` (used for request validation in phase 3).

Add `uploadthing` to `dependencies` explicitly (it is imported but only present transitively).

---

## Phase 2: Convex layer

### Structure

```
convex/
  schema.ts
  validators.ts        shared validators: playerLink, player editable fields, skin fields
  lib/functions.ts     serverQuery / serverMutation / adminMutation wrappers
  lib/relations.ts     setPlayerSkins / setSkinPlayers helpers (plain functions taking ctx.db)
  players.ts
  skins.ts
  auth.ts
```

`convex/playerSkins.ts` is removed; its logic moves into `lib/relations.ts` and the joined queries.

### Access levels

Built with `customQuery` / `customMutation` from `convex-helpers` (new dependency).

| Level | Requirement | Used for |
|---|---|---|
| public | none (plain `query`) | reading public data: players, skins |
| server | `secret` arg equals `process.env.CONVEX_SERVER_SECRET` | counters, login sync, osu! sync, auth users, own-profile updates |
| admin | server requirement + `actor_osu_id` is in `process.env.ADMIN_OSU_IDS` | creating, editing, deleting players and skins |

- The wrapper consumes `secret` (and checks `actor_osu_id` for admin) so handlers never see the
  secret.
- `actor_osu_id` is trusted only because the secret proves the call came from our server.
- Both env vars are already set on the dev and prod Convex deployments.

### Functions

| Function | Access | Behavior |
|---|---|---|
| `players.list` | public | all players |
| `players.get({ osu_id })` | public | player with `skins: Doc<"skins">[]` attached, or `null` |
| `players.syncFromOsu({ osu_id, name, cover_url, previous_usernames, only_if_exists })` | server | upsert by `osu_id`; merges usernames (existing order kept, new ones appended, none dropped); sets `synced_at` and `updated_at`. With `only_if_exists`, does nothing when the player doesn't exist (login). Returns the player or `null` |
| `players.update({ id, ...editableFields, skin_ids })` | admin | patches fields and sets relations in one transaction; `404` if missing |
| `players.updateOwnProfile({ actor_osu_id, description?, links? })` | server | finds the actor's linked player via `authUsers`; `403` if none. Empty links are dropped |
| `players.incrementViews({ id })` | server | |
| `players.remove({ id })` | admin | deletes relations, clears `player_id` on any `authUsers` pointing at it, deletes the player |
| `skins.list` | public | all skins, no players (keeps the public `/skins` payload small) |
| `skins.listWithPlayers` | public | all skins with `players` attached, built in memory from 3 collects |
| `skins.get({ id })` | public | skin with `players` attached, or `null` |
| `skins.upsert({ id?, ...fields, player_ids? })` | admin | no `id`: insert (`download_count: 0`); with `id`: patch. Sets relations when `player_ids` is given. Returns the id |
| `skins.incrementDownloads({ id })` | server | |
| `skins.remove({ id })` | admin | deletes relations, then the skin; returns the deleted skin's `preview_images` so the API can clean up files |
| `auth.getUser({ osu_id })` | server | |
| `auth.upsertUser({ osu_id, username })` | server | insert, or a single `patch` of `username` and `player_id` |

Why players have no generic upsert: players are only ever created from osu! data, so
`syncFromOsu` is the upsert; admin edits are plain updates by id. Skins are created and edited by
hand, so one upsert fits.

`players.getPlayer` (unused) and the old names (`listPlayers`, `getPlayerByOsuId`, `upsertPlayer`,
`updatePlayerProfile`, `incrementPlayerViews`, `deletePlayer`, `createSkin`, `updateSkin`,
`listSkins`, `getSkin`, `incrementSkinDownloads`, `deleteSkin`, `listSkinsWithPlayers`,
`getAuthUser`, all of `playerSkins.ts`) are removed.

### IDs and errors

- Functions that take a document id accept `v.string()` and call `ctx.db.normalizeId(table, id)`;
  an invalid or missing id throws `ConvexError({ status: 404, message: "Skin not found" })`.
- All expected failures throw `ConvexError<{ status: number; message: string }>`:
  - `401`/`403` from the wrappers: `"Only admins can do this"`, `"Invalid server secret"`.
  - `403 "You can only edit your own profile"`.
  - `404 "Player not found"` / `"Skin not found"`.

### SvelteKit side

`$lib/server/convex.ts` exports:

- `convex` (the `ConvexHttpClient`, for public queries).
- `query(fn, args)` / `mutate(fn, args)`: add `secret: CONVEX_SERVER_SECRET` automatically
  (`args` type is the function's args without `secret`), and turn a `ConvexError` with
  `{ status, message }` into SvelteKit's `error(status, message)`. Other errors are rethrown.

Loaders become single queries: the player page calls `players.get`, the skin page calls
`skins.get`, and both `error(404, ...)` on `null`.

---

## Phase 3: API routes

### Routes

| Route | Auth | Behavior |
|---|---|---|
| `POST /api/players` | admin | body `{ osu_id }`; fetches from osu! and calls `syncFromOsu`; `201 { player }` if created, `200 { player }` if it already existed (re-synced) |
| `POST /api/players/sync` | logged in; rate-limited 3/min unless admin | body `{ osu_id }`; refreshes an existing player from osu! (`only_if_exists`); never creates; `404 "Player not found"` if missing; `204` |
| `PATCH /api/players/[id]` | admin | body: editable fields + `skin_ids`; `204` |
| `DELETE /api/players/[id]` | admin | `204` |
| `POST /api/players/[id]/views` | public; rate-limited 5/min | `204` |
| `PATCH /api/me/profile` | logged in | body `{ description?, links? }`; `204` |
| `POST /api/skins` | admin | body: skin fields; `201 { id }` |
| `PATCH /api/skins/[id]` | admin | body: skin fields + `player_ids`; deletes removed UploadThing images after the write; `204` |
| `DELETE /api/skins/[id]` | admin | deletes the skin's UploadThing images after the write; `204` |
| `POST /api/skins/[id]/download` | public; rate-limited 5/min | `204` |
| `/api/uploadthing` | admin (in UploadThing middleware) | unchanged behavior; middleware uses a shared `getSessionUser(request)` helper instead of hand-parsing cookies |

Removed: `/api/player-skins/[playerId]`, `/api/skin-players/[skinId]`, `/api/player/refresh`.

### Route shape

Every write route does three steps in this order: auth, validate, act.

```ts
export const PATCH: RequestHandler = async (event) => {
	const admin = requireAdmin(event);
	const body = await parseBody(event.request, SkinBody);
	await mutate(api.skins.upsert, { actor_osu_id: admin.osu_id, id: event.params.id, ...body });
	return new Response(null, { status: 204 });
};
```

- Handlers are typed with the generated `RequestHandler` from `./$types`.
- No `try/catch` in routes: `ConvexError`s map to 4xx via `mutate`/`query`; anything else reaches
  `handleError` in `hooks.server.ts`.
- No `{ success: true }` bodies.

### Validation

- `$lib/server/validation.ts`: `parseBody(request, schema)`.
  - Non-JSON body: `400 "Request body must be valid JSON"`.
  - Schema failure: `400` with the first issue as `"<field> <problem>"`, e.g.
    `"download_url must be a valid URL"`.
- `$lib/server/schemas.ts`: shared pieces `trimmedString`, `httpUrl`, `osuId`, `hue` (integer
  0–360), `links`, `tags` (runs `normalizeTags` as a transform).
- Each route defines its own body schema at the top of its `+server.ts`.

### Auth helpers

`$lib/server/admin.ts` merges into `$lib/server/auth.ts`, which holds `createToken`,
`verifyToken`, `getSessionUser(request)`, `isAdmin(osuId)`, `requireUser(event)` (`401 "You need to
log in first"`) and `requireAdmin(event)` (`401` as above, `403 "Only admins can do this"`).

### osu! helpers

`$lib/server/osu.ts` keeps `fetchOsuProfile(osu_id)`:

- `404 "No osu! user with ID <id>"` when the user doesn't exist.
- `502 "Couldn't reach osu!, try again in a moment"` when the osu! API fails.

The username merge moves into `players.syncFromOsu`; `mergeUsernames` and its tests move to
`convex/lib/usernames.ts`. The extra `getPlayerByOsuId` lookup in `osu.ts` goes away.

### Login

- `src/routes/(public)/login/+server.ts` moves to `src/routes/auth/login/+server.ts`; the three
  references to `/login` are updated to `/auth/login`.
- The `from` redirect is accepted only when `new URL(from, CURRENT_DOMAIN).origin` equals
  `new URL(CURRENT_DOMAIN).origin`; otherwise it falls back to `/`. This check is a small exported
  function with unit tests.
- The callback calls `syncFromOsu` with `only_if_exists: true` (login never creates players).

### UploadThing helpers

`$lib/utils/uploadthingUrl.ts` and the `deleteUploadThingImages` function from the skins route
move into `$lib/server/uploadthing.ts`.

---

## Phase 4: Errors and feedback

### Backend messages

| Situation | Response |
|---|---|
| Unknown player/skin id | `404 "Player not found"` / `"Skin not found"` |
| Not an admin | `403 "Only admins can do this"` |
| Someone else's profile | `403 "You can only edit your own profile"` |
| osu! user missing | `404 "No osu! user with ID <id>"` |
| osu! API failing | `502 "Couldn't reach osu!, try again in a moment"` |
| Rate limited | `429 "Too many requests, try again in <n>s"` |
| Not logged in | `401 "You need to log in first"` |
| Bad body | `400 "<field> <problem>"` |
| Unexpected | `500 "<message> (ref <id>)"`, details only in server logs |

### Frontend

- `$lib/api.ts`: `request<T>(path, { method, body })` sends JSON, returns the parsed body (or
  `undefined` for `204`), and throws `Error(message)` from `readErrorMessage` when the response is
  not OK. `readErrorMessage` moves into this file with its tests.
- All 8 current `fetch` call sites in the dashboard use `request`.
- `<Toaster />` moves from the dashboard page to `src/routes/+layout.svelte`.
- Request outcomes show as toasts: `toast.success` on save/create/delete/sync, `toast.error` with
  the backend message on failure. The `errorMessage` state and red header text in the editors and
  creator dialogs are removed.
- Field hints (e.g. "Enter a valid URL.") stay inline under their inputs.

### Error page

`src/routes/+error.svelte`:

- 404: "This page doesn't exist" (or the error's own message, e.g. "Player not found") with links
  to Players and Skins.
- Other statuses: status, message, and the `ref` id when present.
- Has its own minimal header, since it renders outside the `(public)` layout.

---

## Phase 5: Frontend cleanup

### Delete flow

- `src/routes/(admin)/dashboard/delete-dialog.svelte`: props `open` (bindable), `name`,
  `kind` (`"player" | "skin"`), `onConfirm`. Text: "Type **{name}** to delete this {kind}." The
  Delete button is enabled only when the input equals `name` exactly. Enter confirms, Esc cancels.
- Holding the delete button opens the dialog, in four places: player editor (new), skin editor,
  and the context menu of both sidebar lists (currently missing `onComplete`).
- After deleting: success toast, editor closes if it showed the deleted item, data reloads.

### Shared pieces

- `$lib/hooks/list-query.svelte.ts`: `useListQuery(list, config)` with
  `config = { keys, threshold?, sortOptions, defaultSort, defaultOrder }`. Holds `query`, `sortBy`,
  `orderBy` as state and exposes `results`. Replaces `useFuzzyFilter` + `useSorted` (both
  deleted) on all 6 screens. `PLAYER_LIST` and `SKIN_LIST` configs live in the same file, next to
  the sort options (moved out of `constants.ts`).
- `search-sorted.svelte` takes `list` (a `useListQuery` result) and `placeholder` instead of three
  bindings and `sortOptions`. Page snapshots capture and restore `query`, `sortBy`, `orderBy` from
  the list.
- `src/routes/(admin)/dashboard/tag-input.svelte`: `bind:tags`, `suggestions`. Used by both
  editors.
- `formatDate(ms)` in `$lib/utils.ts` (replaces 3 copies).
- `$lib/types.ts`: `AuthUser`, `PlayerWithSkins`, `SkinWithPlayers` (inferred from Convex return
  types with `FunctionReturnType`). Replaces the 3 local `SkinWithPlayers` definitions.

Kept separate on purpose: `assign-skins-dialog` and `assign-players-dialog`, the two sort option
lists, the copy-link buttons.

### Fixes and simplifications

- `page-heading.svelte`: title is `$derived` (updates on client navigation between pages of the
  same route); prop renamed `titleSufix` → `titleSuffix`.
- `image-carousel.svelte`: prev/next as `(i - 1 + n) % n` / `(i + 1) % n`; remove the unreachable
  radius fallback.
- `hold-button.svelte` moves to `$comp/hold-button.svelte`; direction `switch` becomes a lookup
  object; remove `any` and unused params.
- `user-icon.svelte`: initials are `username.slice(0, 2)`; `page.data.user` typed via
  `App.PageData` (declared in `app.d.ts`), no `as AuthUser` casts (also in `navbar.svelte`).
- Dashboard page: `selected: { type: "player" | "skin"; id: string } | null` replaces
  `EditorState`; both editors are guarded the same way (no non-null assertion).
- `skins/[skinId]/+page.svelte`: remove the unused `e` parameter.
- Player editor "Refresh from osu!" calls `POST /api/players/sync`.

### Folder structure and naming

| Now | After |
|---|---|
| `$lib/utils/fuzzyFilter.svelte.ts`, `sorted.svelte.ts` | `$lib/hooks/list-query.svelte.ts` |
| `$lib/utils/clipboard.svelte.ts` | `$lib/hooks/copy-link.svelte.ts` |
| `$lib/utils/skinImages.ts` (+ test) | `src/routes/(admin)/dashboard/skin-images.ts` (+ test) |
| `$lib/utils/uploadthingUrl.ts` (+ test) | `$lib/server/uploadthing.ts` (+ test) |
| `$lib/utils/uploadthing.ts` (client helper) | `$lib/uploadthing.ts` |
| `$lib/utils/http.ts` (+ test) | `$lib/api.ts` (+ test) |
| `$lib/utils/osu.ts` | `$lib/osu.ts` (`osuAvatar`, `parseOsuId`) |
| `$lib/utils/tags.ts` (+ test) | `$lib/tags.ts` (+ test) |
| `$lib/utils/helpers.ts` | deleted |
| `$lib/server/admin.ts` | merged into `$lib/server/auth.ts` |
| `$lib/components/ui/hold-button/` | `$comp/hold-button.svelte` |
| `src/routes/(public)/login/` | `src/routes/auth/login/` |
| dashboard `PlayerEditor.svelte` etc. (PascalCase) | kebab-case: `player-editor.svelte`, `skin-editor.svelte`, `player-creator-dialog.svelte`, `skin-creator-dialog.svelte`, `assign-skins-dialog.svelte`, `assign-players-dialog.svelte` |

The `$lib/utils/` folder disappears; `$lib/utils.ts` stays (shadcn imports `cn` from it).

Conventions:

- Imports use `$comp/...`, never `$lib/components/...`; no `.js` suffixes.
- The `$routes` alias is removed; `+layout.svelte` imports `./layout.css`.

### Script block order

Every `.svelte` file:

1. Imports: external packages → `$app` → `$comp` → `$lib` / `$convex` → local files.
2. Types.
3. Props.
4. State, then derived, then effects.
5. Functions, grouped by feature. Files with more than one feature use `// --- Name ---` headers.

Snippets go at the end of the markup.

---

## Testing

Unit tests (vitest, server project), written before the code they test:

- `parseBody` and shared schemas: valid input, invalid JSON, first-issue message, tag
  normalization, hue range.
- `ConvexError` → `error(status, message)` mapping.
- `request()`: throws with the backend message; returns `undefined` on `204`.
- Login redirect check: rejects `https://<domain>.evil.com`, accepts same-origin URLs and paths.
- `setPlayerSkins` / `setSkinPlayers` with a fake `db`: inserts missing, deletes removed, leaves
  unchanged rows alone.
- Existing tests move with their files and keep passing.

Tests for Convex helpers live next to them (`convex/lib/*.test.ts`); the vitest `server` project's
`include` gains `convex/**/*.{test,spec}.ts`.

After each phase: `bun run check`, `bun run lint`, `bun run test`, `vite build`.

Manual smoke test on the dev deployment after phases 3 and 5: login/logout; create, edit (fields
and skins), sync and delete a player; create, edit (images upload/reorder/remove, players) and
delete a skin; public player and skin pages; an unknown URL; a protected Convex mutation called
without the secret is rejected. HTTP checks via `curl`; UI checks by the user from a checklist.

## Deployment

Deploy Convex first, then Vercel right after: new Convex function names and args are not
compatible with the old app. Only the admin dashboard is affected in between. `CONVEX_SERVER_SECRET`
and `ADMIN_OSU_IDS` are already set on both Convex deployments; `CONVEX_SERVER_SECRET` must also be
in Vercel and `example.env`.

## Out of scope

- The view counter UI (built right after this refactor; the route and mutation are ready).
- The player settings page that will use `PATCH /api/me/profile`.
- Other auth hardening beyond what is listed above.
