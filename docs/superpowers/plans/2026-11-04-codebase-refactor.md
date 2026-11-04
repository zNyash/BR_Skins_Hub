# Codebase Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify BR Skins Hub: remove dead code, consolidate Convex functions with server-side access checks, rebuild the API routes around one auth → validate → act shape, add clear error feedback, and clean up the frontend structure.

**Architecture:** Convex functions are wrapped in `serverQuery` / `serverMutation` / `adminMutation` (convex-helpers custom functions) that check `CONVEX_SERVER_SECRET` and `ADMIN_OSU_IDS`. SvelteKit routes are the only callers of protected functions; they add the secret through `$lib/server/convex.ts`, validate bodies with valibot and map `ConvexError({ status, message })` to `error(status, message)`. The dashboard calls the API through one `request()` helper and reports outcomes with toasts.

**Tech Stack:** SvelteKit 2 + Svelte 5 runes, Convex (+ `convex-helpers`), valibot, svelte-sonner, UploadThing, vitest, bun.

**Spec:** `docs/superpowers/specs/2026-11-04-codebase-refactor-design.md`

## Global Constraints

- Branch: `refactor`. Commit after every task with a conventional message (`feat(...)`, `refactor(...)`, `fix(...)`, `chore(...)`). **No `Co-Authored-By` trailer, ever.**
- Every task ends green: `bun run check` (0 errors), `bunx eslint .` (0 errors), `bunx vitest --run --project server`, `bunx vite build`. Call this the **gate**.
- Convex codegen/push: `bunx convex dev --once` (pushes to the dev deployment and regenerates `convex/_generated`). Run it whenever `convex/*.ts` signatures change, before `bun run check`.
- Repetition of 2–3 occurrences is fine; extract only zero-cost abstractions.
- Imports use `$comp/...` (never `$lib/components/...`), no `.js` suffixes (enforced from Task 12 on).
- Error copy is exact: `"Player not found"`, `"Skin not found"`, `"Only admins can do this"`, `"Invalid server secret"`, `"You can only edit your own profile"`, `"You need to log in first"`, `"No osu! user with ID <id>"`, `"Couldn't reach osu!, try again in a moment"`, `"Request body must be valid JSON"`, `"Too many requests, try again in <n>s"`.
- Responses: `201` + body on create, `204` (`new Response(null, { status: 204 })`) on update/delete/counters, never `{ success: true }`.
- Never write the words "vulnerability", "impersonation" or "anyone can call" into the repo (public on GitHub).

**Deviations from the spec, decided while planning:**

- `$lib/server/convex.ts` exports `convex` (public queries), `serverQuery(fn, args)` and `mutate(fn, args)`. The spec's `query` is named `serverQuery`, because public queries must not receive a `secret` arg.
- The two relation routes (`/api/player-skins`, `/api/skin-players`) are removed in Task 4 rather than phase 3, because `playerSkins.ts` disappears there and the app has to keep working.

## Review Focus

1. Login `from` set to `//evil.com`, `javascript:alert(1)` or a garbage string must redirect to `/`. Tested in Task 8.
2. Body with extra fields (`_id`, `download_count`, `synced_at`) must have them stripped, never forwarded to Convex. Tested in Task 6.
3. Clearing the hue input sends `hue: null` (Svelte number binding). It must save as "unset", not fail with a 400. Tested in Task 6.
4. `skin_ids` / `player_ids` with duplicates must not create duplicate relation rows. Tested in Task 2.
5. Malformed id in a URL (`/api/skins/abc`) must return `404 "Skin not found"`, not 500. Checked with curl in Task 7.

---

## Phase 1: Dead code removal

### Task 1: Remove dead code, unused deps, and fix existing lint errors

**Files:**

- Delete: `src/routes/(admin)/dashboard_old/`; `src/lib/components/ui/{alert-dialog,badge,card,empty,form,label,navigation-menu,scroll-area,skeleton}/`
- Modify: `package.json`, `bun.lock`, `src/routes/layout.css` (drop `@plugin "@iconify/tailwind4";`), `src/routes/(public)/+page.svelte` (drop the commented palette), `src/routes/(public)/+layout.svelte` (drop `isHidden`, its `$effect`, `class:-translate-y-full`; keep `isFloating`), `src/lib/components/ui/hold-button/hold-button.svelte` (replace `any` with real types: `startHold()` / `cancelHold()` take no params, rest props typed `HTMLButtonAttributes`-style via `ButtonProps` from `$comp/ui/button`), `src/routes/(public)/skins/[skinId]/+page.svelte` (drop unused `e`)

- [ ] **Step 1:** `bun remove @svelte-put/copy @svelte-put/popover svelte-portal @internationalized/date mode-watcher @iconify/tailwind4 @iconify-json/lucide formsnap sveltekit-superforms` then `bun add uploadthing`.
- [ ] **Step 2:** Delete the folders and make the file edits listed above.
- [ ] **Step 3:** `grep -rn "dashboard_old\|superforms\|formsnap\|svelte-put\|mode-watcher" src` returns nothing.
- [ ] **Step 4:** Run the gate. Expected: all green, eslint 0 errors (the 4 `_generated` warnings are fine).
- [ ] **Step 5:** Commit: `chore: remove dead code, unused components and dependencies`.

---

## Phase 2: Convex layer

### Task 2: Convex pure helpers: usernames and relations

**Files:**

- Modify: `vite.config.ts` (server project `include`: add `"convex/**/*.{test,spec}.{js,ts}"`)
- Create: `convex/lib/usernames.ts`, `convex/lib/usernames.test.ts` (move `mergeUsernames` and its tests out of `src/lib/utils/osu.ts` / `osu.test.ts`; `parseOsuId` and `osuAvatar` stay)
- Create: `convex/lib/relations.ts`, `convex/lib/relations.test.ts`

**Interfaces:**

- Produces: `mergeUsernames(existing: string[], incoming: string[]): string[]`
- Produces: `setPlayerSkins(db: DatabaseWriter, playerId: Id<"players">, skinIds: Id<"skins">[]): Promise<void>` and `setSkinPlayers(db: DatabaseWriter, skinId: Id<"skins">, playerIds: Id<"players">[]): Promise<void>` (`DatabaseWriter` from `convex/_generated/server`). Both make the relation rows match the target list exactly.
- Produces: `deleteRelations(db: DatabaseWriter, by: { player: Id<"players"> } | { skin: Id<"skins"> }): Promise<void>`

- [ ] **Step 1: Write failing tests** in `relations.test.ts` with a fake db (an in-memory array of `{ _id, player_id, skin_id }`, implementing `query("playerSkins").withIndex(name, fn).collect()`, `insert`, `delete`):
  - `setPlayerSkins inserts missing and deletes removed`: start `[p1-s1, p1-s2]`, target `[s2, s3]`, expect rows `[p1-s2, p1-s3]`, and `p1-s2` keeps its original `_id`.
  - `setPlayerSkins ignores duplicate ids`: target `[s1, s1]` on empty, expect exactly one row.
  - `setSkinPlayers mirrors from the skin side`: start `[p1-s1, p2-s1]`, target `[p2]`, expect `[p2-s1]`.
  - `deleteRelations removes only rows for that player`: start `[p1-s1, p2-s1]`, `{ player: p1 }`, expect `[p2-s1]`.
- [ ] **Step 2:** `bunx vitest --run --project server convex` → FAIL (module not found).
- [ ] **Step 3:** Implement `convex/lib/relations.ts` (dedupe the target with a `Set`; diff against current rows like today's `updatePlayerSkins`) and move `mergeUsernames` into `convex/lib/usernames.ts`. Update the `mergeUsernames` import in `src/lib/server/osu.ts` to `$convex/lib/usernames`.
- [ ] **Step 4:** `bunx vitest --run --project server` → all PASS.
- [ ] **Step 5:** Gate, then commit: `feat(convex): add relation and username helpers`.

### Task 3: Access wrappers, shared validators, server secret

**Files:**

- Create: `convex/lib/functions.ts`, `convex/lib/functions.test.ts`, `convex/validators.ts`
- Modify: `package.json` (`bun add convex-helpers`), `example.env` (add `CONVEX_SERVER_SECRET=`), `convex/schema.ts` (use `playerLink` from validators)

**Interfaces:**

- Produces in `convex/lib/functions.ts`:
  - `type ErrorData = { status: number; message: string }`
  - `fail(status: number, message: string): never` throws `new ConvexError<ErrorData>({ status, message })`
  - `parseAdminIds(raw: string | undefined): Set<number>` (comma list, trims, drops non-positive/NaN)
  - `serverQuery`, `serverMutation`: `customQuery` / `customMutation` from `convex-helpers/server/customFunctions` with `args: { secret: v.string() }`. `input` fails `401 "Invalid server secret"` when `secret !== process.env.CONVEX_SERVER_SECRET` or the env var is unset, and passes no extra args to the handler.
  - `adminMutation`: args `{ secret: v.string(), actor_osu_id: v.number() }`. Same secret check, then `403 "Only admins can do this"` if `actor_osu_id` isn't in `parseAdminIds(process.env.ADMIN_OSU_IDS)`. It consumes both args.
- Produces in `convex/validators.ts`: `playerLink` (the `v.object({ type: v.union(...6 literals), value: v.string() })`), `playerFields` (object of optional validators: `name, cover_url, hue, description, previous_usernames, links: v.array(playerLink), tags`), `skinFields` (`name: v.string(), author: v.optional(v.string()), download_url: v.string(), preview_images: v.array(v.string()), tags: v.optional(v.array(v.string()))`)

- [ ] **Step 1: Write failing tests** in `functions.test.ts`:
  - `parseAdminIds("1, 2,x,,-3")` equals `new Set([1, 2])`; `parseAdminIds(undefined)` is empty.
  - `fail(404, "Skin not found")` throws a `ConvexError` whose `data` equals `{ status: 404, message: "Skin not found" }`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement the files above. `schema.ts` imports `playerLink` instead of its inline copy.
- [ ] **Step 4:** Run tests → PASS. `bunx convex dev --once` succeeds.
- [ ] **Step 5:** Gate, then commit: `feat(convex): add server and admin access wrappers`.

### Task 4: Rewrite Convex functions and update their callers

**Files:**

- Rewrite: `convex/players.ts`, `convex/skins.ts`, `convex/auth.ts`
- Delete: `convex/playerSkins.ts`, `src/routes/api/player-skins/`, `src/routes/api/skin-players/`
- Create: `src/lib/server/convex.ts` (rewrite), `src/lib/server/convex.test.ts`
- Modify (callers): `src/routes/+layout.server.ts`, `src/routes/(public)/+page.server.ts`, `(public)/skins/+page.server.ts`, `(public)/skins/[skinId]/+page.server.ts`, `(public)/player/[osuId]/+page.server.ts`, `(admin)/dashboard/+page.server.ts`, `src/lib/server/osu.ts`, `src/routes/auth/callback/+server.ts`, all `src/routes/api/**/+server.ts`, `src/routes/(admin)/dashboard/PlayerEditor.svelte` and `SkinEditor.svelte` (send `skin_ids` / `player_ids` inside the PATCH body; drop the second fetch)

**Interfaces:**

- Consumes: Task 2 helpers, Task 3 wrappers and validators.
- Produces (Convex), exactly as in the spec's function table:
  - `players.list()`, `players.get({ osu_id })` → `(Doc<"players"> & { skins: Doc<"skins">[] }) | null`
  - `players.syncFromOsu({ osu_id, name, cover_url?, previous_usernames, only_if_exists })` → `Doc<"players"> | null`
  - `players.update({ id: string, ...playerFields, skin_ids: Id<"skins">[] })`
  - `players.updateOwnProfile({ actor_osu_id, description?, links? })`
  - `players.incrementViews({ id: string })`, `players.remove({ id: string })`
  - `skins.list()`, `skins.listWithPlayers()`, `skins.get({ id: string })` → `(Doc<"skins"> & { players: Doc<"players">[] }) | null`
  - `skins.upsert({ id?: string, ...skinFields, player_ids?: Id<"players">[] })` → `Id<"skins">`
  - `skins.incrementDownloads({ id: string })`, `skins.remove({ id: string })` → `string[]` (the removed `preview_images`)
  - `auth.getUser({ osu_id })`, `auth.upsertUser({ osu_id, username })`
- Produces (SvelteKit) in `$lib/server/convex.ts`:
  - `convex: ConvexHttpClient` for public queries
  - `serverQuery<F extends FunctionReference<"query">>(fn: F, args: Omit<FunctionArgs<F>, "secret">): Promise<FunctionReturnType<F>>`
  - `mutate<F extends FunctionReference<"mutation">>(fn: F, args: Omit<FunctionArgs<F>, "secret">): Promise<FunctionReturnType<F>>`
  - `rethrowAsHttpError(e: unknown): never`: a `ConvexError` whose `data` has a numeric `status` and a string `message` becomes `error(status, message)`, anything else is rethrown unchanged.
- `CONVEX_SERVER_SECRET` is read from `$env/static/private`.

- [ ] **Step 1: Write failing tests** in `convex.test.ts` for `rethrowAsHttpError`:
  - A `ConvexError({ status: 404, message: "Skin not found" })` throws an `HttpError` (`isHttpError` from `@sveltejs/kit`) with `status === 404` and `body.message === "Skin not found"`.
  - `new Error("boom")` is rethrown as the same object.
  - A `ConvexError("plain string")` is rethrown unchanged.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement `$lib/server/convex.ts`.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Rewrite the Convex modules.
  - Every id arg is `v.string()`, normalized with `ctx.db.normalizeId`, then `fail(404, ...)` when the id is invalid or the document is missing.
  - `players.remove` calls `deleteRelations`, then patches `player_id: undefined` on `authUsers` rows pointing at the player (query `authUsers` filtered by `player_id`; the table is small, so a filter is fine), then deletes the player.
  - `syncFromOsu` merges usernames with `mergeUsernames` and sets `synced_at` and `updated_at` to `Date.now()`.
  - `skins.list` returns docs without players.
- [ ] **Step 6:** `bunx convex dev --once` succeeds.
- [ ] **Step 7:** Update every caller listed above to the new names.
  - Admin routes pass `actor_osu_id: requireAdmin(event).osu_id`.
  - Loaders use `convex.query(api.players.get, ...)` and `convex.query(api.skins.get, ...)`, then `error(404, "Player not found" | "Skin not found")` on `null`.
  - `osu.ts` drops its `getPlayerByOsuId` lookup.
  - The callback calls `syncFromOsu` with `only_if_exists: true`.
- [ ] **Step 8:** Gate. Then on `bun run dev`: open `/`, `/skins`, a player page and a skin page, and save a player and a skin in the dashboard with a changed skin/player assignment. All work.
- [ ] **Step 9:** `curl -s -X POST "$PUBLIC_CONVEX_URL/api/mutation" -H 'content-type: application/json' -d '{"path":"skins:incrementDownloads","args":{"id":"x","secret":"wrong"},"format":"json"}'` returns an error containing `Invalid server secret`.
- [ ] **Step 10:** Commit: `refactor(convex): consolidate functions behind server and admin checks`.

---

## Phase 3: API routes

### Task 5: Auth and UploadThing server modules

**Files:**

- Modify: `src/lib/server/auth.ts` (absorbs `admin.ts`); delete `src/lib/server/admin.ts`
- Modify: `src/lib/server/uploadthing.ts` (absorbs `src/lib/utils/uploadthingUrl.ts` + test → `src/lib/server/uploadthing.test.ts`, and `deleteUploadThingImages` from `api/skins/[id]/+server.ts`)
- Create: `src/lib/server/auth.test.ts`
- Modify: every importer of `$lib/server/admin` and `$lib/utils/uploadthingUrl`

**Interfaces:**

- Produces in `$lib/server/auth.ts`:
  - `createToken({ osu_id }): Promise<string>`, `verifyToken(token): Promise<{ osu_id: number } | null>` (unchanged)
  - `getSessionUser(request: Request): Promise<{ osu_id: number } | null>` (reads the `session` cookie from the `cookie` header with `parse` from the `cookie` package, which SvelteKit already depends on; add it explicitly with `bun add cookie`)
  - `isAdmin(osuId: number): boolean`
  - `requireUser(event: RequestEvent): { osu_id: number }` → `401 "You need to log in first"`
  - `requireAdmin(event: RequestEvent): { osu_id: number }` → that `401`, or `403 "Only admins can do this"`
- Produces in `$lib/server/uploadthing.ts`: `ourFileRouter`, `OurFileRouter`, `getUploadThingKey(url): string | null`, `deleteUploadThingImages(urls: string[]): Promise<void>`

- [ ] **Step 1: Write failing tests** in `auth.test.ts`:
  - `getSessionUser` returns `{ osu_id: 42 }` for a request whose cookie header is `"a=1; session=<createToken({ osu_id: 42 })>"`.
  - It returns `null` with no cookie header, and `null` for `session=garbage`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement the modules. The UploadThing middleware becomes `const user = await getSessionUser(req); if (!user || !isAdmin(user.osu_id)) throw new UploadThingError("Only admins can do this");`.
- [ ] **Step 4:** Run tests → PASS.
- [ ] **Step 5:** Gate, then commit: `refactor(server): merge auth helpers and UploadThing utilities`.

### Task 6: Request validation

**Files:**

- Create: `src/lib/server/validation.ts`, `src/lib/server/schemas.ts`, `src/lib/server/validation.test.ts`
- Move: `src/lib/utils/tags.ts` + test → `src/lib/tags.ts` + test (update importers)

**Interfaces:**

- Produces: `parseBody<S extends v.GenericSchema>(request: Request, schema: S): Promise<v.InferOutput<S>>`
  - Invalid JSON → `400 "Request body must be valid JSON"`.
  - Schema failure → `400` with `` `${dotPath} ${message}` `` from the first issue (`v.getDotPath`). The message comes from each schema's own text, e.g. `"must be a valid URL"`.
- Produces in `schemas.ts`:
  - `trimmedString` (trim, min length 1, `"is required"`)
  - `httpUrl` (trim, `v.url("must be a valid URL")`)
  - `osuId` (integer > 0, `"must be a valid osu! ID"`)
  - `hue` (`v.nullish(integer 0–360, "must be between 0 and 360")`, transformed so `null` → `undefined`)
  - `links` (array of `{ type: picklist of 6, value: string }`, empty values dropped)
  - `tags` (array of string, transformed with `normalizeTags`)
  - `convexId` (non-empty string)
- `v.object` strips unknown keys. Don't use `looseObject`.

- [ ] **Step 1: Write failing tests** in `validation.test.ts`, using `parseBody(new Request("http://x", { method: "POST", body }), schema)`:
  - Invalid JSON (`"{"`) throws an HttpError 400 with message `"Request body must be valid JSON"`.
  - `v.object({ download_url: httpUrl })` with `{ download_url: "nope" }` gives 400 `"download_url must be a valid URL"`.
  - Unknown keys are stripped: `v.object({ name: trimmedString })` with `{ name: " a ", _id: "x", download_count: 9 }` gives `{ name: "a" }`.
  - `hue`: `null` → `undefined`, `120` → `120`, `400` → 400 `"hue must be between 0 and 360"`.
  - `tags`: `[" Foo  Bar ", "foo bar", ""]` → `["foo bar"]`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Gate, then commit: `feat(api): add request body validation`.

### Task 7: Rebuild API routes

**Files:**

- Rewrite: `src/routes/api/players/+server.ts` (POST), `api/players/[id]/+server.ts` (PATCH, DELETE), `api/players/[id]/views/+server.ts`, `api/skins/+server.ts`, `api/skins/[id]/+server.ts`, `api/skins/[id]/download/+server.ts`
- Create: `src/routes/api/players/sync/+server.ts`, `src/routes/api/me/profile/+server.ts`
- Delete: `src/routes/api/player/refresh/`, `src/routes/api/players/[id]/profile/`
- Modify: `src/lib/server/osu.ts`, `src/routes/(admin)/dashboard/PlayerEditor.svelte` (refresh → `POST /api/players/sync` with `{ osu_id }`), `PlayerCreatorDialog.svelte` (reads `{ player }` and `response.status === 200` means it existed)

**Interfaces:**

- Consumes: `requireUser`, `requireAdmin`, `isAdmin` (Task 5); `parseBody` + schemas (Task 6); `mutate`, `convex` (Task 4); `deleteUploadThingImages` (Task 5); `createRateLimiter` (unchanged).
- Produces in `osu.ts`: `fetchOsuProfile(osuId: number): Promise<{ id: number; username: string; cover_url?: string; previous_usernames: string[] }>`. The osu! client login and lookup are wrapped:
  - No user → `404 "No osu! user with ID <id>"`.
  - A thrown or network error → `502 "Couldn't reach osu!, try again in a moment"`.
- Every handler is `export const METHOD: RequestHandler = async (event) => {...}` with `RequestHandler` from `./$types`, following the order auth → `parseBody` → `mutate` → response. Status codes and bodies come from the spec's route table.
  - `POST /api/players`: checks existence with `convex.query(api.players.get, { osu_id })`, then calls `syncFromOsu({ ..., only_if_exists: false })`. Returns `201 { player }` when new, `200 { player }` when it already existed.
  - `POST /api/players/sync`: `requireUser`, then the rate limiter unless `isAdmin`, then `syncFromOsu({ ..., only_if_exists: true })`. A `null` result → `404 "Player not found"`; otherwise `204`.
  - `PATCH /api/skins/[id]`: reads the old skin with `convex.query(api.skins.get)` before the upsert and deletes the removed images after it (same logic as today).
  - `DELETE /api/skins/[id]`: `deleteUploadThingImages(await mutate(api.skins.remove, ...))`.
  - Body schemas sit at the top of each file:
    - `PlayerBody`: `name?, cover_url?, hue, description?, previous_usernames?, links?, tags?, skin_ids: array(convexId)`
    - `SkinBody`: `name: trimmedString, author?, download_url: httpUrl, preview_images: array(string)` (POST defaults to `[]`), `tags?, player_ids?` (PATCH only)
    - `ProfileBody`: `description?, links?`
    - `{ osu_id: osuId }` for create and sync

- [ ] **Step 1:** Rewrite and create the routes and `osu.ts` as specified, and update the two dashboard components.
- [ ] **Step 2:** Gate.
- [ ] **Step 3:** With `bun run dev` running (`$DEV` = its URL, e.g. `http://localhost:5173`), check with curl (no cookie):
  - `curl -si -X PATCH $DEV/api/skins/abc -d '{}'` → `401`.
  - `curl -si -X POST $DEV/api/skins/abc/download` → `404` with `"Skin not found"` (Review Focus 5).
  - `curl -si -X POST $DEV/api/players/sync -d '{"osu_id":1}'` → `401`.
- [ ] **Step 4:** In the browser as admin: create a player (and an existing one → info toast), refresh from osu!, edit and save a player and a skin, delete a skin. All work.
- [ ] **Step 5:** Commit: `refactor(api): rebuild routes around auth, validation and Convex`.

### Task 8: Move login and validate the redirect target

**Files:**

- Move: `src/routes/(public)/login/+server.ts` → `src/routes/auth/login/+server.ts`
- Create: `src/lib/server/redirect.ts`, `src/lib/server/redirect.test.ts`
- Modify: `src/lib/components/user-icon.svelte`, `src/routes/(admin)/+layout.server.ts`, `src/routes/auth/callback/+server.ts` (`/login` → `/auth/login`)

**Interfaces:**

- Produces: `safeRedirectTarget(from: string | null, siteUrl: string): string`. Returns `from` resolved against `siteUrl` when its origin equals `new URL(siteUrl).origin`, otherwise `"/"`. It never throws.

- [ ] **Step 1: Write failing tests** with `site = "https://brskins.com"`:
  - `"https://brskins.com/skins"` → `"https://brskins.com/skins"`.
  - `"/player/1"` → `"https://brskins.com/player/1"`.
  - `null` → `"/"`.
  - `"https://brskins.com.evil.com/x"` → `"/"`.
  - `"//evil.com"` → `"/"`.
  - `"javascript:alert(1)"` → `"/"`.
  - `"http://[bad"` → `"/"`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement it with `URL.canParse` / `new URL(from, siteUrl)`, then move the route and use the function there.
- [ ] **Step 4:** Run → PASS. Gate.
- [ ] **Step 5:** Manually: log out, click Login from a skin page, and after osu! you land back on that skin page.
- [ ] **Step 6:** Commit: `refactor(auth): move login under /auth and validate redirect origin`.

---

## Phase 4: Errors and feedback

### Task 9: `request()` helper and toasts

**Files:**

- Create: `src/lib/api.ts`, `src/lib/api.test.ts` (move `readErrorMessage` and its tests from `src/lib/utils/http.ts` / `http.test.ts`, then delete those)
- Modify: `src/routes/+layout.svelte` (add `<Toaster />`), `src/routes/(admin)/dashboard/+page.svelte` (remove `<Toaster />`), `PlayerEditor.svelte`, `SkinEditor.svelte`, `PlayerCreatorDialog.svelte`, `SkinCreatorDialog.svelte`

**Interfaces:**

- Produces: `request<T = undefined>(path: string, options?: { method?: string; body?: unknown }): Promise<T>`. It sends a JSON body and `Content-Type` when `body` is given, returns `undefined` for `204` and parsed JSON otherwise, and throws `new Error(await readErrorMessage(response))` when `!response.ok`.

- [ ] **Step 1: Write failing tests** (stub `globalThis.fetch` with `vi.stubGlobal`):
  - On `204` it resolves `undefined`.
  - On `201` with `{"id":"x"}` it resolves `{ id: "x" }`.
  - On `400` with `{"message":"download_url must be a valid URL"}` it rejects with that message.
  - It sends `method: "PATCH"`, `content-type: application/json` and the stringified body.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement. Then convert every dashboard `fetch` to `request` with a `toast.success` / `toast.error(e.message)` pair:
  - Save → `"Player saved"` / `"Skin saved"`
  - Create → `"Player created"` / `"Skin created"`
  - Refresh → `"Synced from osu!"`
  - Delete → `"Skin deleted"`

  Remove the `errorMessage` state and the red header text everywhere. Inline field hints stay.

- [ ] **Step 4:** Run → PASS. Gate.
- [ ] **Step 5:** Manually: save a skin with the download URL set to `x` by editing the request (or temporarily remove the client-side `canSave` check). The toast shows `download_url must be a valid URL`.
- [ ] **Step 6:** Commit: `feat(ui): show request results as toasts`.

### Task 10: Error page

**Files:**

- Create: `src/routes/+error.svelte`

- [ ] **Step 1:** Implement it with `page.status`, `page.error.message` and `page.error.errorId` from `$app/state`.
  - 404 heading: "This page doesn't exist". The subtext shows `page.error.message` unless it is the default `"Not Found"`.
  - Other statuses: the status, the message and `ref <errorId>` when present.
  - A minimal header with links to `/` (Players) and `/skins` (Skins). Use `PageHeading` with title `"<status>"`.
- [ ] **Step 2:** Gate. Manually: `/nope` shows the 404 page, `/player/1` shows "Player not found" and `/skins/abc` shows "Skin not found".
- [ ] **Step 3:** Commit: `feat(ui): add error page`.

---

## Phase 5: Frontend cleanup

### Task 11: Folder moves, renames and import conventions

**Files (moves; update every importer):**

- `src/lib/utils/clipboard.svelte.ts` → `src/lib/hooks/copy-link.svelte.ts`
- `src/lib/utils/skinImages.ts` (+ test) → `src/routes/(admin)/dashboard/skin-images.ts` (+ test)
- `src/lib/utils/uploadthing.ts` → `src/lib/uploadthing.ts`
- `src/lib/utils/osu.ts` (+ test) → `src/lib/osu.ts` (+ test)
- `src/lib/utils/helpers.ts` → delete (the hue clamp is gone since Task 7)
- `src/lib/components/ui/hold-button/` → `src/lib/components/hold-button.svelte`
- Dashboard: `PlayerEditor.svelte` → `player-editor.svelte`, `SkinEditor` → `skin-editor`, `PlayerCreatorDialog` → `player-creator-dialog`, `SkinCreatorDialog` → `skin-creator-dialog`, `AssignSkinsDialog` → `assign-skins-dialog`, `AssignPlayersDialog` → `assign-players-dialog`
- `svelte.config.js`: remove the `$routes` alias. `src/routes/+layout.svelte` imports `"./layout.css"`.
- All files: `$lib/components/` → `$comp/` and drop the `.js` suffixes on imports (except inside `src/lib/components/ui/`, which shadcn generates). `fuzzyFilter.svelte.ts` and `sorted.svelte.ts` stay where they are until Task 12.

- [ ] **Step 1:** Use `git mv` for every move (keeps history), then fix the imports.
- [ ] **Step 2:** `grep -rn '\$lib/components/\|\$routes\|from "[^"]*\.js"' src --include=*.svelte --include=*.ts | grep -v components/ui/` returns nothing, and `ls src/lib/utils` shows only `fuzzyFilter.svelte.ts` and `sorted.svelte.ts`.
- [ ] **Step 3:** Gate.
- [ ] **Step 4:** Commit: `refactor: reorganize folders and normalize file names and imports`.

### Task 12: `useListQuery` and search-sorted

**Files:**

- Create: `src/lib/hooks/list-query.svelte.ts`
- Delete: `src/lib/utils/fuzzyFilter.svelte.ts`, `src/lib/utils/sorted.svelte.ts` (and the now-empty `src/lib/utils/`)
- Modify: `src/lib/constants.ts` (keeps only `POPOVER_SETTINGS`), `src/lib/components/search-sorted.svelte`, `src/routes/(public)/+page.svelte`, `(public)/skins/+page.svelte`, `(public)/player/[osuId]/+page.svelte`, `(admin)/dashboard/+page.svelte`, `assign-skins-dialog.svelte`, `assign-players-dialog.svelte`

**Interfaces:**

- Produces:
  ```ts
  type SortOption<T> = {
  	value: string;
  	label: string;
  	ascIcon: string;
  	descIcon: string;
  	compare: (a: T, b: T) => number;
  };
  type ListConfig<T> = {
  	keys: IFuseOptions<T>["keys"];
  	threshold?: number;
  	sortOptions: readonly SortOption<T>[];
  	defaultSort: string;
  	defaultOrder: "asc" | "desc";
  };
  function useListQuery<T>(
  	list: () => T[],
  	config: ListConfig<T>
  ): {
  	query: string;
  	sortBy: string;
  	orderBy: "asc" | "desc";
  	readonly results: T[];
  	readonly sortOptions: readonly SortOption<T>[];
  };
  export const PLAYER_LIST: ListConfig<Doc<"players">>; // keys name, osu_id, previous_usernames, tags; default name/asc
  export const SKIN_LIST: ListConfig<Doc<"skins">>; // keys name, tags; default date/desc
  export const DASHBOARD_SKIN_LIST: ListConfig<SkinWithPlayers>; // SKIN_LIST + keys author, players.name, players.previous_usernames
  ```

  - `query`, `sortBy` and `orderBy` are `$state` behind getters and setters. `results` is `$derived` (fuzzy filter with threshold 0.4 by default, then sort).
  - `SkinWithPlayers` comes from Task 14. Until then, define it locally in this file and move it in Task 14.
- Also export `type ListQuery<T> = ReturnType<typeof useListQuery<T>>`. `search-sorted.svelte` uses `<script lang="ts" generics="T">` with props `{ list: ListQuery<T>; placeholder: string }` (no `any`). It binds to `list.query` and `list.sortBy` and toggles `list.orderBy`.
- Page snapshots: `capture: () => ({ query: x.query, sortBy: x.sortBy, orderBy: x.orderBy })`, and `restore` assigns them back.

- [ ] **Step 1:** Implement the hook and update the 6 screens and `search-sorted`.
- [ ] **Step 2:** Gate. Manually: search, sort and toggle the order on `/`, `/skins`, a player page, both dashboard tabs and both assign dialogs. On `/` and `/skins`, navigating away and back restores the search state.
- [ ] **Step 3:** Commit: `refactor(ui): replace filter and sort hooks with useListQuery`.

### Task 13: Delete dialog and hold-to-delete everywhere

**Files:**

- Create: `src/routes/(admin)/dashboard/delete-dialog.svelte`
- Modify: `src/lib/components/hold-button.svelte` (the direction `switch` becomes `const FILL = { top: { origin: "origin-top", axis: "Y" }, ... }`), `player-editor.svelte`, `skin-editor.svelte`, `dashboard/+page.svelte`

**Interfaces:**

- Produces: `delete-dialog.svelte` props `{ open: boolean (bindable); name: string; kind: "player" | "skin"; onConfirm: () => Promise<void> }`.
  - Text: `Type <strong>{name}</strong> to delete this {kind}.`
  - The Delete button is disabled unless `input === name`.
  - Enter submits (form), Esc and Cancel close it, and the input clears each time it opens.
  - While `onConfirm` is running the button shows a spinner. The dialog closes when it resolves and stays open when it rejects.
- Delete handler (one per editor plus one in the page for the sidebar):
  - `await request(\`/api/players/${id}\`, { method: "DELETE" })`, then `toast.success("Player deleted")`.
  - Close the editor if it showed that item (`selected = null`).
  - `invalidate("app:players")` / `invalidate("app:skins")`.

  The sidebar's context-menu `HoldButton`s get `onComplete` that opens the dialog for that item.

- [ ] **Step 1:** Implement and wire up the dialog in all four places.
- [ ] **Step 2:** Gate. Manually:
  - Hold delete on a player in the sidebar, type a wrong name (button disabled), type the right name, Enter: the player is gone, the toast shows and the editor is closed.
  - Delete a skin from the skin editor.
  - Check in the Convex dashboard that no `playerSkins` rows still point at the deleted player.
- [ ] **Step 3:** Commit: `feat(dashboard): confirm deletes by typing the name`.

### Task 14: Tag input, shared types, dashboard state

**Files:**

- Create: `src/routes/(admin)/dashboard/tag-input.svelte`
- Modify: `src/lib/types.ts`, `src/lib/utils.ts`, `src/app.d.ts`, `player-editor.svelte`, `skin-editor.svelte`, `assign-skins-dialog.svelte`, `assign-players-dialog.svelte`, `dashboard/+page.svelte`, `src/lib/hooks/list-query.svelte.ts` (import `SkinWithPlayers` from `$lib/types`)

**Interfaces:**

- Produces: `tag-input.svelte` props `{ tags: string[] (bindable); suggestions: string[]; id: string }`. It contains the input, datalist, Enter/`,`/blur add logic and removable chips moved from the editors, uses `normalizeTags`, and only offers suggestions that aren't already chosen.
- Produces in `$lib/types.ts`:
  - `AuthUser` (`player_id: Id<"players"> | null`)
  - `PlayerWithSkins = NonNullable<FunctionReturnType<typeof api.players.get>>`
  - `SkinWithPlayers = FunctionReturnType<typeof api.skins.listWithPlayers>[number]`
- Produces in `$lib/utils.ts`: `formatDate(ms: number): string` (the existing `toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })`).
- `app.d.ts`: `interface PageData { user: AuthUser | null }`.
- Dashboard page: `let selected = $state<{ type: "player" | "skin"; id: string } | null>(null)`. `selectedPlayer` and `selectedSkin` are derived and both guarded with `{#if}` (no `!`).

- [ ] **Step 1:** Implement, replacing the 3 local `SkinWithPlayers` types and the 3 `formatDate` copies.
- [ ] **Step 2:** Gate. Manually: add and remove tags in both editors (Enter, comma, blur), and select and Esc out of editors.
- [ ] **Step 3:** Commit: `refactor(dashboard): extract tag input and share types`.

### Task 15: Small component fixes and script order pass

**Files:**

- Modify: `src/lib/components/page-heading.svelte`, `image-carousel.svelte`, `user-icon.svelte`, `navbar.svelte`, then every `.svelte` file outside `components/ui/` for the script order

- [ ] **Step 1:** Make the component fixes:
  - **page-heading:** `const fullTitle = $derived(...)`, remove the `svelte-ignore`, and rename the prop `titleSufix` → `titleSuffix`.
  - **image-carousel:** `prev = () => (currentIndex = (currentIndex - 1 + total) % total)`, `next` likewise. Type `RADIUS_MAP` as `Record<Radius, string>` without the fallback.
  - **user-icon:** initials `user.username?.slice(0, 2) ?? ""`.
  - **user-icon and navbar:** read `page.data.user` without casts (the type now comes from `App.PageData`).
- [ ] **Step 2:** Reorder every script block in this order: imports (external → `$app` → `$comp` → `$lib`/`$convex` → local) → types → props → state → derived → effects → functions grouped by feature with `// --- Name ---` headers when there is more than one feature. Snippets go at the end of the markup.
- [ ] **Step 3:** Gate. Manually: navigating from one player page to another updates the browser tab title, the carousel wraps both ways, and the avatar fallback shows 2 letters.
- [ ] **Step 4:** Commit: `refactor(ui): simplify components and order script blocks`.

### Task 16: Final verification

- [ ] **Step 1:** Run the gate plus `bun run lint` (prettier check included). Fix formatting with `bun run format` if needed and commit `style: format`.
- [ ] **Step 2:** Check every spec section against the code. `grep -rn "playerSkins\.\|listPlayers\|getPlayerByOsuId\|upsertPlayer\|/api/player/refresh\|/api/player-skins\|/api/skin-players\|titleSufix" src convex --include=*.ts --include=*.svelte | grep -v _generated` returns nothing.
- [ ] **Step 3:** Hand the user the manual smoke checklist from the spec's Testing section, plus the deploy order: Convex prod deploy first (`bunx convex deploy`), then Vercel. Remind them to add `CONVEX_SERVER_SECRET` to the Vercel env before deploying.
