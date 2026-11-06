# Player Profile Redesign (Part 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/player/[osuId]` into a sidebar plus reorderable tabs, color each profile with its owner's hue, and let the owner edit bio, links, description and tab order in place.

**Architecture:** Two new optional player fields (`bio`, `tab_order`) flow through the existing owner endpoint `PATCH /api/me/profile` and admin endpoint `PATCH /api/players/[id]`. Pure helpers (`resolveTabs`, `visibleTabs`, `linkTarget`, `clampHue`) carry the logic and are unit tested; the Svelte components stay thin. The page color is a server-rendered `<style>:root { --hue }</style>` in the root layout's head.

**Tech Stack:** SvelteKit (Svelte 5 runes), Convex, valibot, vitest, Tailwind v4, shadcn-svelte (`dialog`, `textarea`, `select`, `button`), `svelte-sonner` toasts, Iconify via `$comp/icon.svelte`, our `use:sortable` action (`src/lib/sortable.ts`).

**Spec:** `docs/superpowers/specs/2026-11-06-profile-redesign-design.md`

## Global Constraints

- Bio: plain text, trimmed, at most 200 characters; error message "must be at most 200 characters".
- `tab_order`: each of `skins`, `about`, `setup` exactly once; error message "must list each tab exactly once".
- Default tab order: `skins, about, setup`. The Setup tab is never rendered in this part.
- Visitors see Skins always, About only when the description is non-empty (after trim); the owner sees every tab.
- Owner = `data.user?.player_id === data.player._id`. No in-place editing for admins on others' profiles.
- The open tab is `?tab=<id>`; switching uses `goto(url, { replaceState: true, noScroll: true, keepFocus: true })`.
- Hue precedence: viewed player's `hue` on a player page, else the logged-in player's `hue`, else no style (site default from `layout.css`). Only finite numbers clamped to 0–360 reach the style tag.
- Link icons: `simple-icons:x`, `simple-icons:twitch`, `simple-icons:youtube`, `simple-icons:github`, `simple-icons:discord`, and Lucide `link` for custom.
- Commits: no `Co-Authored-By` trailer (user rule).
- Schema changes need `bunx convex dev` run by the user before manual testing; don't run Convex codegen against the deployment yourself.
- No browser tests (Playwright's Chromium is not installed). `bun run test` must stay green.

## Review Focus

- Existing `links` values that are full URLs with query strings or trailing slashes (`https://x.com/foo/`, `https://www.twitch.tv/foo?x=1`) must still give the right label: covered in Task 3 tests.
- A player whose stored `tab_order` is from before a tab existed, or has duplicates, must still show every tab once: covered in Task 2 tests.
- A description that is only whitespace must not make the About tab visible to visitors: covered in Task 2 (`hasDescription`).
- `?tab=about` on a profile with no description, as a visitor, must open Skins, not an empty panel: covered in Task 2 (`pickTab`).
- A `hue` of `NaN`, a string, or `720` from bad data must not break the page's CSS: covered in Task 4 tests.

---

### Task 1: Data fields, validation and endpoints

**Files:**
- Modify: `convex/validators.ts` (add `profileTab`, add `bio` to `playerFields`)
- Modify: `convex/schema.ts` (`players`: `bio`, `tab_order`)
- Modify: `convex/players.ts` (`updateOwnProfile` args and patch)
- Modify: `src/lib/server/schemas.ts` (add `bio`, `tabOrder`)
- Modify: `src/routes/api/me/profile/+server.ts` (body gains `bio`, `tab_order`)
- Modify: `src/routes/api/players/[id]/+server.ts` (body gains `bio`)
- Modify: `src/routes/(admin)/dashboard/player-editor.svelte` (bio textarea with "n/200" counter, included in the PATCH body)
- Test: `src/lib/server/schemas.test.ts`

**Interfaces:**
- Produces: `profileTab` Convex validator (`v.union(v.literal("skins"), v.literal("about"), v.literal("setup"))`); `players.bio?: string`, `players.tab_order?: ("skins"|"about"|"setup")[]`; valibot `bio` and `tabOrder` exported from `$lib/server/schemas`; `PATCH /api/me/profile` accepts `{ bio?, links?, description?, tab_order? }`.

- [ ] **Step 1: Write failing tests** in `schemas.test.ts`:

```ts
describe("bio", () => {
	it("trims and accepts up to 200 characters", () => {
		expect(v.parse(bio, "  hi  ")).toBe("hi");
		expect(v.safeParse(bio, "a".repeat(200)).success).toBe(true);
	});
	it("rejects 201 characters", () => {
		const r = v.safeParse(bio, "a".repeat(201));
		expect(r.success).toBe(false);
		expect(r.issues?.[0].message).toBe("must be at most 200 characters");
	});
});

describe("tabOrder", () => {
	it("accepts a permutation", () => {
		expect(v.safeParse(tabOrder, ["about", "setup", "skins"]).success).toBe(true);
	});
	it.each([[["skins", "skins", "about"]], [["skins", "about"]], [["skins", "about", "setup", "x"]], [["skins", "about", "nope"]]])(
		"rejects %j",
		(value) => {
			const r = v.safeParse(tabOrder, value);
			expect(r.success).toBe(false);
		}
	);
	it("uses the spec's message for a duplicate", () => {
		const r = v.safeParse(tabOrder, ["skins", "skins", "about"]);
		expect(r.issues?.[0].message).toBe("must list each tab exactly once");
	});
});
```

- [ ] **Step 2: Run** `bun run test -- src/lib/server/schemas.test.ts` → FAIL (`bio`/`tabOrder` not exported).

- [ ] **Step 3: Implement** `bio` (`v.pipe(v.string(), v.trim(), v.maxLength(200, "must be at most 200 characters"))`) and `tabOrder` (array of `v.picklist(["skins","about","setup"])` plus a `v.check` that the length is 3 and the set size is 3, message "must list each tab exactly once") in `schemas.ts`. Then the Convex side: `profileTab` in `validators.ts`, the two optional fields in `schema.ts` (with the doc comments from the spec), `bio: v.optional(v.string())` in `playerFields`, and `updateOwnProfile` args `bio: v.optional(v.string())`, `tab_order: v.optional(v.array(profileTab))`, patched with the same `!== undefined` pattern as `description`. Endpoints: add `bio: v.optional(bio)` and `tab_order: v.optional(tabOrder)` to `ProfileBody`; add `bio: v.optional(bio)` to `PlayerBody`. Dashboard editor: bio textarea next to the description, counter `{length}/200`, sent with the rest of the player fields.

- [ ] **Step 4: Run** `bun run test` → PASS, and `bun run check` → no new errors.

- [ ] **Step 5: Commit**

```bash
git add convex/validators.ts convex/schema.ts convex/players.ts src/lib/server/schemas.ts src/lib/server/schemas.test.ts src/routes/api/me/profile/+server.ts "src/routes/api/players/[id]/+server.ts" "src/routes/(admin)/dashboard/player-editor.svelte"
git commit -m "feat(players): bio and tab order fields with validation"
```

### Task 2: Tab helpers

**Files:**
- Create: `src/lib/profile-tabs.ts`
- Test: `src/lib/profile-tabs.test.ts`

**Interfaces:**
- Produces:
  - `type ProfileTab = "skins" | "about" | "setup"`
  - `const DEFAULT_TABS: readonly ProfileTab[] = ["skins", "about", "setup"]`
  - `resolveTabs(stored?: readonly string[] | null): ProfileTab[]`
  - `type TabContent = Record<ProfileTab, boolean>`
  - `visibleTabs(order: readonly ProfileTab[], content: TabContent, isOwner: boolean): ProfileTab[]`
  - `hasDescription(description?: string | null): boolean` (non-empty after trim)
  - `pickTab(requested: string | null, visible: readonly ProfileTab[]): ProfileTab` (requested if visible, else `visible[0]`)

- [ ] **Step 1: Write failing tests:**

```ts
describe("resolveTabs", () => {
	it("defaults when nothing is stored", () => {
		expect(resolveTabs(undefined)).toEqual(["skins", "about", "setup"]);
	});
	it("keeps the stored order", () => {
		expect(resolveTabs(["setup", "about", "skins"])).toEqual(["setup", "about", "skins"]);
	});
	it("drops duplicates and unknown values, appends missing tabs in default order", () => {
		expect(resolveTabs(["about", "about", "nope"])).toEqual(["about", "skins", "setup"]);
	});
});

describe("visibleTabs", () => {
	const content = { skins: true, about: false, setup: false };
	it("shows only tabs with content to visitors", () => {
		expect(visibleTabs(["about", "skins", "setup"], content, false)).toEqual(["skins"]);
	});
	it("shows every tab to the owner", () => {
		expect(visibleTabs(["about", "skins", "setup"], content, true)).toEqual(["about", "skins", "setup"]);
	});
});

describe("hasDescription", () => {
	it.each([[undefined, false], ["", false], ["  \n ", false], ["hi", true]])("%j → %s", (d, expected) => {
		expect(hasDescription(d)).toBe(expected);
	});
});

describe("pickTab", () => {
	it("uses the requested tab when visible", () => {
		expect(pickTab("about", ["skins", "about"])).toBe("about");
	});
	it("falls back to the first visible tab", () => {
		expect(pickTab("about", ["skins"])).toBe("skins");
		expect(pickTab(null, ["about", "skins"])).toBe("about");
	});
});
```

- [ ] **Step 2: Run** `bun run test -- src/lib/profile-tabs.test.ts` → FAIL (module missing).
- [ ] **Step 3: Implement** the five exports in `src/lib/profile-tabs.ts`.
- [ ] **Step 4: Run** the same command → PASS.
- [ ] **Step 5: Commit** `git add src/lib/profile-tabs.ts src/lib/profile-tabs.test.ts && git commit -m "feat(profile): tab order and visibility helpers"`

### Task 3: Link targets

**Files:**
- Create: `src/lib/links.ts`
- Test: `src/lib/links.test.ts`

**Interfaces:**
- Consumes: the link type union from `Doc<"players">["links"]` (`"twitch" | "twitter" | "youtube" | "github" | "discord" | "custom"`).
- Produces: `type LinkType`; `linkTarget(type: LinkType, value: string): { href: string | null; label: string }`; `LINK_ICONS: Record<LinkType, string>` with the icon names from Global Constraints (`custom` → `"link"`).

- [ ] **Step 1: Write failing tests** (table-driven):

```ts
it.each([
	["twitter", "foo", "https://x.com/foo", "@foo"],
	["twitter", "@foo", "https://x.com/foo", "@foo"],
	["twitter", "https://twitter.com/foo", "https://x.com/foo", "@foo"],
	["twitter", "https://x.com/foo/", "https://x.com/foo", "@foo"],
	["twitch", "https://www.twitch.tv/foo?x=1", "https://twitch.tv/foo", "foo"],
	["youtube", "https://youtube.com/@foo", "https://youtube.com/@foo", "@foo"],
	["youtube", "foo", "https://youtube.com/@foo", "@foo"],
	["github", "https://github.com/foo", "https://github.com/foo", "foo"],
	["discord", "foo", null, "foo"],
	["custom", "https://www.example.com/page", "https://www.example.com/page", "example.com"],
	["custom", "javascript:alert(1)", null, "javascript:alert(1)"],
	["custom", "not a url", null, "not a url"],
	["twitter", "https://evil.com/foo", null, "https://evil.com/foo"]
])("%s %j", (type, value, href, label) => {
	expect(linkTarget(type as LinkType, value)).toEqual({ href, label });
});
```

- [ ] **Step 2: Run** `bun run test -- src/lib/links.test.ts` → FAIL.
- [ ] **Step 3: Implement** with `new URL()` in a try/catch. Platform hosts, `www.` stripped before comparing: twitter → `x.com`, `twitter.com`; twitch → `twitch.tv`; youtube → `youtube.com`; github → `github.com`. Username = first path segment (leading `@` removed, then re-added in the label/URL for twitter and youtube as in the table). A value with no `://` and no spaces is a bare username (leading `@` removed). Custom accepts only `http:`/`https:`.
- [ ] **Step 4: Run** the same command → PASS.
- [ ] **Step 5: Commit** `git add src/lib/links.ts src/lib/links.test.ts && git commit -m "feat(profile): turn stored links into hrefs and labels"`

### Task 4: Page color

**Files:**
- Create: `src/lib/hue.ts`
- Test: `src/lib/hue.test.ts`
- Modify: `convex/auth.ts` (`getUser` also returns the linked player's `hue`)
- Modify: `src/lib/types.ts` (`AuthUser.hue: number | null`)
- Modify: `src/routes/+layout.server.ts` (fill `hue`)
- Modify: `src/routes/(public)/player/[osuId]/+page.server.ts` (return `pageHue: player.hue ?? null`)
- Modify: `src/routes/+layout.svelte` (head style)

**Interfaces:**
- Produces: `clampHue(value: unknown): number | null`; `AuthUser.hue`; page data `pageHue: number | null` on player pages.

- [ ] **Step 1: Write failing tests:**

```ts
it.each([
	[120, 120], [0, 0], [360, 360], [-5, 0], [720, 360], [12.5, 12.5],
	[NaN, null], [Infinity, null], ["120", null], [null, null], [undefined, null]
])("clampHue(%j) → %j", (input, expected) => {
	expect(clampHue(input)).toBe(expected);
});
```

- [ ] **Step 2: Run** `bun run test -- src/lib/hue.test.ts` → FAIL.
- [ ] **Step 3: Implement** `clampHue` (`typeof value === "number" && Number.isFinite(value)` → clamp, else `null`). `getUser` returns `{ ...authUser, hue }` where `hue` is the `players` doc at `authUser.player_id`'s `hue ?? null` (return `null` as today when there is no auth user). Root layout: `const hue = $derived(clampHue(page.data.pageHue ?? data.user?.hue))`, and in `<svelte:head>` render `{#if hue !== null}{@html `<style>:root{--hue:${hue}}</style>`}{/if}` (safe: `hue` is a number by construction).
- [ ] **Step 4: Run** `bun run test` → PASS; `bun run check` → no new errors.
- [ ] **Step 5: Commit**

```bash
git add src/lib/hue.ts src/lib/hue.test.ts convex/auth.ts src/lib/types.ts src/routes/+layout.server.ts src/routes/+layout.svelte "src/routes/(public)/player/[osuId]/+page.server.ts"
git commit -m "feat(theme): profile pages use the player's color, other pages the viewer's"
```

### Task 5: Sidebar and tabs layout

**Files:**
- Create: `src/routes/(public)/player/[osuId]/link-button.svelte`
- Create: `src/routes/(public)/player/[osuId]/profile-sidebar.svelte`
- Create: `src/routes/(public)/player/[osuId]/profile-tabs.svelte`
- Modify: `src/routes/(public)/player/[osuId]/+page.svelte`

**Interfaces:**
- Consumes: `resolveTabs`, `visibleTabs`, `hasDescription`, `pickTab`, `ProfileTab` (Task 2); `linkTarget`, `LINK_ICONS` (Task 3); `PlayerWithSkins` / `AuthUser` from `$lib/types`.
- Produces: `profile-sidebar.svelte` props `{ player: PlayerWithSkins; isOwner: boolean; onEdit: () => void; onReadMore: () => void }`; `profile-tabs.svelte` props `{ player: PlayerWithSkins; isOwner: boolean; onEdit: () => void }`, rendering the bar and the active panel; `link-button.svelte` props `{ type: LinkType; value: string }`.

- [ ] **Step 1: Build `link-button.svelte`.** Renders an `<a href target="_blank" rel="noopener noreferrer">` when `href` is set; Discord renders a `<button>` that calls `navigator.clipboard.writeText(label)` and shows "Copied" for 1.5 s; a value with `href: null` (non-Discord) renders as plain text. Icon from `LINK_ICONS`.
- [ ] **Step 2: Build `profile-sidebar.svelte`.** Avatar and name block moved from the page as is (keeps the previous-usernames popover); bio; "Read more" (`onReadMore`) only when `hasDescription(player.description)`; `LinkButton` for each link; owner-only "Edit profile" button and "Add a short bio" when the bio is empty, both calling `onEdit`.
- [ ] **Step 3: Build `profile-tabs.svelte`.** `order = resolveTabs(player.tab_order)`, `content = { skins: true, about: hasDescription(player.description), setup: false }`, `visible = visibleTabs(order, content, isOwner).filter((t) => t !== "setup")`, `active = pickTab(page.url.searchParams.get("tab"), visible)`. Tab buttons `role="tab"` / `aria-selected`; clicking calls `goto` with `?tab=` per Global Constraints. Skins panel = today's search/sort/hidden-toggle/grid moved from `+page.svelte` unchanged. About panel = description in a `whitespace-pre-wrap` block, or for the owner with no description "Add a description" calling `onEdit`.
- [ ] **Step 4: Rewrite `+page.svelte`** as banner + a `flex flex-wrap` row of sidebar (`basis-72 max-w-80`) and tabs (`flex-[999_1_560px] min-w-0`). Banner fallback: on image error show a block with `bg-accent/30` (follows `--hue`) and the "needs to log in again" text only when `isOwner`. `onReadMore` → the same `goto` with `?tab=about`. `onEdit` is a no-op placeholder until Task 6.
- [ ] **Step 5: Verify** `bun run check` → no new errors, `bun run test` → PASS. Manual (after the user runs `bunx convex dev`): `/player/<id>` opens Skins; `?tab=about` works when there is a description and falls back to Skins when there isn't; links render with icons and correct labels.
- [ ] **Step 6: Commit**

```bash
git add "src/routes/(public)/player/[osuId]"
git commit -m "feat(profile): sidebar with bio and link buttons, tabbed content"
```

### Task 6: Owner editing

**Files:**
- Create: `src/routes/(public)/player/[osuId]/edit-profile-dialog.svelte`
- Modify: `src/routes/(public)/player/[osuId]/profile-tabs.svelte` (drag reorder)
- Modify: `src/routes/(public)/player/[osuId]/+page.svelte` (open the dialog)

**Interfaces:**
- Consumes: `request` from `$lib/api`; `toast` from `svelte-sonner`; `sortable`, `moveItem` from `$lib/sortable`; `PATCH /api/me/profile` (Task 1).
- Produces: `edit-profile-dialog.svelte` props `{ player: PlayerWithSkins; open: boolean (bindable) }`.

- [ ] **Step 1: Build the dialog** with shadcn `Dialog`: bio `Textarea` with `{length}/200` counter (Save disabled over 200), links rows (type `Select`, value `Input`, remove button, "Add link" appends `{ type: "custom", value: "" }`), description `Textarea` (plain, about 10 rows). Save: `await request("/api/me/profile", { method: "PATCH", body: { bio, links, description } })`, then `await invalidate("app:player:" + player.osu_id)`, close, `toast.success("Profile saved")`; on error `toast.error(err.message)` and keep the dialog open.
- [ ] **Step 2: Wire it in `+page.svelte`:** `let editing = $state(false)`; every `onEdit` sets it to `true`; render the dialog only when `isOwner`.
- [ ] **Step 3: Tab reordering** in `profile-tabs.svelte`, owner only: `use:sortable={{ onMove, disabled: !isOwner }}` on the tab list, `data-sortable-item` and a `grip-vertical` icon (shown on hover) on each tab, ghost class `SORTABLE_GHOST_CLASS`. Keep a local `$state` copy of the full `resolveTabs` order; `onMove(from, to)` maps the visible indexes to that full order, applies `moveItem`, then `request("/api/me/profile", { method: "PATCH", body: { tab_order } })`; on error restore the previous order and `toast.error(err.message)`. Reset the local copy when `player.tab_order` changes.
- [ ] **Step 4: Verify** `bun run check` and `bun run test` → PASS. Manual as the owner: edit bio/links/description and save; over-200 bio blocks Save; drag a tab, reload, order kept; with the network blocked, the order reverts with a toast. As a visitor: no edit buttons, no grips, empty About hidden.
- [ ] **Step 5: Commit**

```bash
git add "src/routes/(public)/player/[osuId]"
git commit -m "feat(profile): owner edits bio, links, description and tab order in place"
```
