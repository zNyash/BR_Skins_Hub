# Owner Settings Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "Edit profile" dialog and the dropdown color toggle with in-place editors (bio in the sidebar, description on About) and an owner-only Settings tab with Colors, Links, Tab order and Preferences cards.

**Architecture:** Tab logic (the owner's extra `settings` tab, moving a visible tab inside the full stored order) and hue precedence (live preview first) live in tested pure helpers. A shared `huePreview` rune lets the Colors card recolor the page before saving. One small `unsaved-guard` helper protects the three text editors on tab switches and page leaves.

**Tech Stack:** SvelteKit (Svelte 5 runes), Convex, valibot, vitest, Tailwind v4, shadcn-svelte (`textarea`, `select`, `button`, `input`), `svelte-sonner`, `$comp/icon.svelte`.

**Spec:** `docs/superpowers/specs/2026-11-06-owner-settings-tab-design.md`

## Global Constraints

- Settings tab: owner only, always last, pushed right, icon `settings`, tooltip "Only you can see this tab"; never in `tab_order`; `?tab=settings` falls back for non-owners.
- Settings grid: two equal columns, order Colors, Links, Tab order, Preferences; one column below 760px.
- Swatch hues: `0, 25, 60, 95, 140, 190, 230, 265, 300, 330`. Slider and number box 0–360; slider saves on `change` (release), number box on `change`; out-of-range clamped, non-numeric ignored.
- Immediate saves: color, "My color everywhere", tab order. Save buttons: bio, description, links.
- Unsaved-changes prompt text: "Discard your unsaved changes?"
- Copy: Settings intro "Only you can see this tab."; Colors help "Saved as soon as you pick one. Visitors see your page in this color."; Preferences switch "My color everywhere" / "Use your profile color on every page, except other players' profiles."
- Commits: no `Co-Authored-By` trailer. Don't run Convex codegen yourself; the user runs `bunx convex dev`.

## Review Focus

- Moving a tab with ↑/↓ or by dragging while a tab is hidden from the bar (Setup before part 3): the hidden tab must keep its place in the stored order. Covered in Task 1.
- A visitor opening `?tab=settings`: must land on the first visible tab. Covered in Task 1.
- The number box receiving `""`, `"abc"`, `-20` or `999`: ignored, ignored, 0, 360. Covered in Task 2 (`parseHue`).
- A failed immediate save must leave the shown value equal to the saved one, not the attempted one: checked by hand in Task 4 (network blocked).
- Switching tabs with a dirty bio, description or links draft must prompt; Cancel must not. Checked by hand in Task 3.

---

### Task 1: Tab helpers for the Settings tab and list moves

**Files:**

- Modify: `src/lib/profile-tabs.ts`
- Test: `src/lib/profile-tabs.test.ts`

**Interfaces:**

- Produces:
  - `type TabId = ProfileTab | "settings"`
  - `withSettings(visible: readonly ProfileTab[], isOwner: boolean): TabId[]` (appends `"settings"` for the owner)
  - `pickTab(requested: string | null, visible: readonly TabId[]): TabId` (signature widened; behaviour unchanged)
  - `moveVisibleTab(order: readonly ProfileTab[], visible: readonly ProfileTab[], from: number, to: number): ProfileTab[]` (`from`/`to` index `visible`; returns the new full order)

- [ ] **Step 1: Failing tests**

```ts
describe("withSettings", () => {
	it("appends settings for the owner only", () => {
		expect(withSettings(["skins", "about"], true)).toEqual(["skins", "about", "settings"]);
		expect(withSettings(["skins", "about"], false)).toEqual(["skins", "about"]);
	});
	it("lets a visitor's ?tab=settings fall back", () => {
		expect(pickTab("settings", withSettings(["skins"], false))).toBe("skins");
		expect(pickTab("settings", withSettings(["skins"], true))).toBe("settings");
	});
});

describe("moveVisibleTab", () => {
	it("moves within the full order when nothing is hidden", () => {
		expect(moveVisibleTab(["skins", "about", "setup"], ["skins", "about", "setup"], 0, 2)).toEqual([
			"about",
			"setup",
			"skins"
		]);
	});
	it("keeps a hidden tab in place", () => {
		// setup hidden from the bar, sitting between the two visible tabs
		expect(moveVisibleTab(["skins", "setup", "about"], ["skins", "about"], 1, 0)).toEqual([
			"about",
			"setup",
			"skins"
		]);
	});
	it("ignores out-of-range moves", () => {
		expect(moveVisibleTab(["skins", "about", "setup"], ["skins", "about"], 1, 2)).toEqual([
			"skins",
			"about",
			"setup"
		]);
	});
});
```

- [ ] **Step 2: Run** `bun run test -- src/lib/profile-tabs.test.ts` → FAIL (exports missing).
- [ ] **Step 3: Implement.** `moveVisibleTab`: if either index is outside `visible`, return a copy of `order`. Otherwise reorder only the slots the visible tabs occupy, so hidden tabs never move:

```ts
const slots = order.flatMap((tab, i) => (visible.includes(tab) ? [i] : []));
const moved = moveItem(
	order.filter((tab) => visible.includes(tab)),
	from,
	to
);
const next = [...order];
slots.forEach((slot, i) => (next[slot] = moved[i]));
return next;
```

(`moveItem` from `$lib/sortable`.) For the hidden-tab row: slots `[0, 2]`, moved `["about", "skins"]` → `["about", "setup", "skins"]`.

- [ ] **Step 4: Run** the same command → PASS.
- [ ] **Step 5: Commit** `git add src/lib/profile-tabs.ts src/lib/profile-tabs.test.ts && git commit -m "feat(profile): settings tab and list-move helpers"`

### Task 2: Owner color: endpoint, preview and parsing

**Files:**

- Modify: `src/lib/hue.ts`, `src/lib/hue.test.ts`
- Create: `src/lib/hue-preview.svelte.ts`
- Modify: `src/lib/server/schemas.test.ts` (owner `hue` cases on the existing `hue` schema)
- Modify: `src/routes/api/me/profile/+server.ts` (body gains `hue`)
- Modify: `convex/players.ts` (`updateOwnProfile` gains `hue`)
- Modify: `src/routes/+layout.svelte` (preview first)

**Interfaces:**

- Produces:
  - `pickHue(pageHue: unknown, userHue: unknown, useMyColor: boolean, preview?: unknown): number | null` (a valid `preview` wins over everything)
  - `parseHue(input: string): number | null` (trims; `""` or non-numeric → `null`; otherwise rounded and clamped to 0–360)
  - `huePreview: { value: number | null }` exported from `$lib/hue-preview.svelte.ts` (a `$state` object)
  - `PATCH /api/me/profile` accepts `hue: number | null`

- [ ] **Step 1: Failing tests.** In `hue.test.ts`: `pickHue(200, 150, true, 40)` → `40`; `pickHue(200, 150, true, null)` → `200`; `pickHue(null, null, false, NaN)` → `null`. `parseHue`: `""`→`null`, `"abc"`→`null`, `" 120 "`→`120`, `"-20"`→`0`, `"999"`→`360`, `"12.6"`→`13`. In `schemas.test.ts` for `hue`: `0`, `360`, `null` accepted; `361`, `1.5` rejected.
- [ ] **Step 2: Run** `bun run test -- src/lib/hue.test.ts src/lib/server/schemas.test.ts` → FAIL on the new `pickHue`/`parseHue` rows (schema rows may already pass; they pin existing behaviour).
- [ ] **Step 3: Implement** `pickHue`'s `preview` (`clampHue(preview) ?? <current logic>`), `parseHue`, and `huePreview` (`export const huePreview = $state<{ value: number | null }>({ value: null })`). Endpoint: add `hue` (the existing schema) to `ProfileBody`. Convex: `hue: v.optional(v.union(v.number(), v.null()))` in `updateOwnProfile`, patched as `...(hue !== undefined && { hue: hue ?? undefined })` like `update`. Layout: `pickHue(page.data.pageHue, data.user?.hue, data.user?.useMyColor ?? false, huePreview.value)`, and `afterNavigate(() => (huePreview.value = null))` so navigating clears it.
- [ ] **Step 4: Run** `bun run test` → PASS; `bun run check` → 0 errors.
- [ ] **Step 5: Commit** `git commit -m "feat(theme): owners set their own color, with a live preview"` (stage the files above).

### Task 3: In-place editors for bio and description

**Files:**

- Create: `src/routes/(public)/player/[osuId]/unsaved-guard.svelte.ts`
- Create: `src/routes/(public)/player/[osuId]/about-panel.svelte`
- Modify: `src/routes/(public)/player/[osuId]/profile-sidebar.svelte`
- Modify: `src/routes/(public)/player/[osuId]/profile-tabs.svelte` (About panel → `AboutPanel`)
- Modify: `src/routes/(public)/player/[osuId]/+page.svelte` (drop the dialog and `onEdit`)
- Delete: `src/routes/(public)/player/[osuId]/edit-profile-dialog.svelte`

**Interfaces:**

- Produces: `guardUnsaved(isDirty: () => boolean): void` (call during component init; registers `beforeNavigate` that cancels unless `confirm("Discard your unsaved changes?")`, and a `beforeunload` listener while dirty). `about-panel.svelte` props `{ player: PlayerWithSkins; isOwner: boolean }`. `profile-sidebar.svelte` props become `{ player; isOwner; onReadMore }`.

- [ ] **Step 1: `guardUnsaved`.** Uses `beforeNavigate` from `$app/navigation` and `$effect` to add/remove `beforeunload` (set `event.preventDefault()` when dirty).
- [ ] **Step 2: Bio card.** Heading "Bio". Owner: pencil button (`aria-label="Edit bio"`) → textarea with `{trimmed length}/200`, Cancel, Save (spinner while saving; disabled over 200 or while saving). Save → `request("/api/me/profile", { method: "PATCH", body: { bio } })`, `invalidate("app:player:" + player.osu_id)`, close; error → toast, stay open. Owner with no bio sees the card with "Add a short bio" (opens the editor). Visitors never see an empty card. `guardUnsaved(() => editing && draft !== (player.bio ?? ""))`.
- [ ] **Step 3: `about-panel.svelte`.** View: description (`whitespace-pre-wrap`) with an owner "Edit" button top right; owner with no description sees "Add a description" (opens the editor). Edit: textarea (about 14 rows, monospace), Cancel and Save, same save/error pattern with `body: { description }`; guard on `editing && draft !== (player.description ?? "")`.
- [ ] **Step 4: Remove** the dialog file, the sidebar "Edit profile" button, `onEdit` props and the page's `editing` state.
- [ ] **Step 5: Verify** `bun run check` (0 errors), `bunx eslint src` (no errors), `bun run test` (PASS). Manual: edit/cancel/save the bio and description; switch tabs with a dirty draft → prompt; Cancel → no prompt.
- [ ] **Step 6: Commit** `git commit -m "feat(profile): edit the bio and description in place"` (stage the route folder with `git add -A "src/routes/(public)/player/[osuId]"`).

### Task 4: Settings tab and its cards

**Files:**

- Create in `src/routes/(public)/player/[osuId]/`: `settings-tab.svelte`, `colors-card.svelte`, `links-card.svelte`, `tab-order-card.svelte`, `preferences-card.svelte`
- Modify: `profile-tabs.svelte` (settings tab, bar moves via `moveVisibleTab`)
- Modify: `src/lib/components/user-icon.svelte` (remove the color checkbox item and its handler)

**Interfaces:**

- Consumes: `withSettings`, `pickTab`, `moveVisibleTab`, `TabId` (Task 1); `huePreview`, `parseHue` (Task 2); `request`, `toast`, `invalidate`, `invalidateAll`.
- Produces: `settings-tab.svelte` props `{ player: PlayerWithSkins; order: ProfileTab[]; visible: ProfileTab[]; onReorder: (order: ProfileTab[]) => void }`; card props: Colors `{ player }`, Links `{ player }`, Tab order `{ order; visible; onReorder }`, Preferences none (reads `page.data.user`).

- [ ] **Step 1: Tab bar.** Tabs come from `withSettings(visible, isOwner)`. The Settings button: `settings` icon, label "Settings", `title="Only you can see this tab"`, `ml-auto`, not a `data-sortable-item`, rendered after the sortable list. Bar drags use `order = moveVisibleTab(order, visible, from, to)`; `saveOrder` unchanged. Expose a `reorder(next)` that sets `order` and saves, passed to the Settings tab as `onReorder`.
- [ ] **Step 2: `settings-tab.svelte`.** Intro line, then a grid `grid grid-cols-1 gap-4 min-[760px]:grid-cols-2 items-stretch` with the four cards in order.
- [ ] **Step 3: Colors card.** Swatches (`aria-pressed`, ring on the selected), a range input and a number input sharing `value`. `input` events set `huePreview.value`; `change` (and swatch click) save `{ hue }`, then `await invalidate(...)` and clear the preview; on error toast and clear the preview. Number box uses `parseHue`; `null` → restore the box to the current value without saving.
- [ ] **Step 4: Links card.** Moved from the dialog: rows editor, "Add link", Save with spinner; dirty guard via `guardUnsaved`.
- [ ] **Step 5: Tab order card.** One row per `visible` tab with ↑/↓ buttons (`aria-label="Move <Label> up/down"`, disabled at the ends); each click calls `onReorder(moveVisibleTab(order, visible, i, i ± 1))`.
- [ ] **Step 6: Preferences card.** A `role="switch"` button bound to `page.data.user.useMyColor`; on click `request("/api/me/preferences", { method: "PATCH", body: { use_my_color } })` then `invalidateAll()`; on error toast (the reload restores the real value).
- [ ] **Step 7: Dropdown.** Remove the checkbox item, `setUseMyColor`, and now-unused imports from `user-icon.svelte`.
- [ ] **Step 8: Verify** check, lint, tests as in Task 3. Manual: each card saves; failure (network blocked) reverts color and order; grid collapses below 760px; visitors never see Settings; `?tab=settings` as a visitor opens the first tab.
- [ ] **Step 9: Commit** `git commit -m "feat(profile): owner settings tab with colors, links, tab order and preferences"` (stage the route folder and `user-icon.svelte`).
