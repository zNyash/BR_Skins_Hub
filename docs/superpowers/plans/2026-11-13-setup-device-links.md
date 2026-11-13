# Setup device links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Link players' keyboard/tablet/mouse/monitor Setup cards to `devices` catalog rows: a search picker in the setup dialog, auto-linking of confident name matches, a dashboard card for the rest, and device name/photo/full area on profiles.

**Architecture:** Two optional fields on each linkable card (`device_id`, `link: "manual"`). All rules live in plain tested modules: `convex/lib/deviceMatch.ts` (name matching), `convex/lib/setupLinks.ts` (save-path link rules, relink, unlink), `src/lib/setup.ts` (display overlay, OTD import rule) and a dashboard helper for grouping. Convex functions and components stay thin and call those.

**Tech Stack:** SvelteKit 5 (runes), Convex, valibot, Fuse.js, shadcn-svelte `command` (bits-ui), vitest. Package manager: bun.

**Spec:** `docs/superpowers/specs/2026-11-13-setup-device-links-design.md`. Mockups: https://claude.ai/artifact/DXLDjC5G2XMbKdwS4ay7m7.

## Global Constraints

- Branch `feat/setup-device-links` in the main checkout. Do not commit `.claude/launch.json` (staged, unrelated). Commit only the files each task names.
- Commit messages: `type(scope): summary`, optional `- bullet` lines. **No `Co-Authored-By` trailer.**
- Linkable cards are exactly `keyboard`, `tablet`, `mouse`, `monitor`; a card's device type equals its card id.
- `device_id` and `link: "manual"` never coexist on a card.
- Device data wins on display: name, image, and (tablets, only when the device has both `full_w` and `full_h`) full area. Card's own `model`, `full_w`, `full_h` stay stored.
- The catalog is fetched by the setup dialog on open (`GET /api/devices?type=…`), never by the profile page load.
- Browser never talks to Convex; API routes follow `requireUser|requireAdmin → parseBody → mutate → 204`.
- UI: design tokens only (`bg-layer-*`, `text-text-muted`, `text-accent-color`…), 4px grid, sentence case, Lucide icons via `Icon`. shadcn primitives restyled in place.
- `bun run lint` is already broken on main (osk.ts whitespace, prettier-plugin-tailwindcss crash) and 5 Popover client tests already fail: don't fix them here, don't let them block. Run `bunx prettier --write <changed files>` instead of `bun run lint`.
- Run `bunx convex dev` alongside so `convex/_generated` stays current while working.

## Review Focus

1. **A picked device was deleted before save** → save answers 400 "That device no longer exists" and nothing is stored (test in Task 2).
2. **A model of only punctuation/spaces** ("-", "  ") normalizes to `""` → never matches, never forms a dashboard group (tests in Tasks 1 and 7).
3. **Saving a linked card after editing other fields** (area, DPI) → `device_id` stays, `model` untouched (test in Task 2).
4. **Two OTD tablets whose vendor-less names collide** (e.g. `Huion/H420` "Huion H420" and `XP-Pen/H420` "XP-Pen H420", typed "h420") → not confident, no auto-link, shown as a guess (test in Task 1).
5. **The catalog fetch fails or is slow** → the picker shows a loading/error row and the field still saves as free text (manual check in Task 5).

---

### Task 1: Name matching

**Files:**
- Create: `convex/lib/deviceMatch.ts`
- Test: `convex/lib/deviceMatch.test.ts`

**Interfaces:**
- Consumes: `DeviceLike` from `convex/lib/devices.ts` (`{ _id: string; name: string; type: DeviceType; otd_path?: string }`).
- Produces:
  - `normalizeModel(text: string): string`
  - `deviceKeys(device: DeviceLike): string[]`
  - `confidentMatch<D extends DeviceLike>(model: string | undefined, type: DeviceType, devices: D[]): D | null`

- [ ] **Step 1: Write the failing tests**

```ts
const d = (id: string, name: string, type: DeviceType = "tablet", otd_path?: string) =>
	({ _id: id, name, type, otd_path });
const ctl = d("1", "Wacom CTL-472", "tablet", "Wacom/CTL-472");

it("normalizeModel lowercases and keeps only letters and digits", () => {
	expect(normalizeModel("Wacom CTL-472")).toBe("wacomctl472");
	expect(normalizeModel("  ctl 472 ")).toBe("ctl472");
	expect(normalizeModel(" - ")).toBe("");
});
it("OTD devices also match without their vendor", () => {
	expect(deviceKeys(ctl)).toEqual(["wacomctl472", "ctl472"]);
	expect(confidentMatch("ctl472", "tablet", [ctl])).toBe(ctl);
	expect(confidentMatch("WACOM ctl-472", "tablet", [ctl])).toBe(ctl);
});
it("vendor is stripped only when the name starts with it", () => {
	expect(deviceKeys(d("2", "One by Wacom", "tablet", "Wacom/CTL-472"))).toEqual(["onebywacom"]);
});
it("hand-made devices only match their full name", () => {
	expect(deviceKeys(d("3", "Wooting 60HE", "keyboard"))).toEqual(["wooting60he"]);
	expect(confidentMatch("60he", "keyboard", [d("3", "Wooting 60HE", "keyboard")])).toBeNull();
});
it("only devices of the card's type match", () => {
	expect(confidentMatch("ctl472", "mouse", [ctl])).toBeNull();
});
it("a key shared by two devices is not confident", () => {
	const a = d("4", "Huion H420", "tablet", "Huion/H420");
	const b = d("5", "XP-Pen H420", "tablet", "XP-Pen/H420");
	expect(confidentMatch("h420", "tablet", [a, b])).toBeNull();
	expect(confidentMatch("huion h420", "tablet", [a, b])).toBe(a);
});
it("empty or punctuation-only models never match", () => {
	expect(confidentMatch(undefined, "tablet", [ctl])).toBeNull();
	expect(confidentMatch(" - ", "tablet", [d("6", "-", "tablet")])).toBeNull();
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `bunx vitest run convex/lib/deviceMatch.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement the three functions in `convex/lib/deviceMatch.ts`**

`normalizeModel`: `text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")`. Vendor = `otd_path.split("/")[0]`; the vendor-less key is the normalized name minus the normalized vendor prefix, added only when the name's key starts with the vendor's key and the rest is non-empty. `confidentMatch` returns null for an empty normalized model; collects devices of `type` having the key; returns the single one, else null. Doc comment on each.

- [ ] **Step 4: Run to verify it passes**

Run: `bunx vitest run convex/lib/deviceMatch.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add convex/lib/deviceMatch.ts convex/lib/deviceMatch.test.ts
git commit -m "feat(devices): match typed setup models to catalog devices"
```

---

### Task 2: Card link fields and the save path

**Files:**
- Modify: `convex/validators.ts` (the four card validators)
- Create: `convex/lib/setupLinks.ts`
- Test: `convex/lib/setupLinks.test.ts`
- Modify: `convex/players.ts` (`updateSetup`)
- Modify: `src/lib/server/schemas.ts` (`setupPatch`, four cards)
- Modify: `convex/lib/setup.test.ts` (one case)

**Interfaces:**
- Consumes: `confidentMatch` (Task 1); `Setup`, `SetupPatch` from `convex/lib/setup.ts`.
- Produces (in `convex/lib/setupLinks.ts`):
  - `LINKABLE_CARDS = ["keyboard", "tablet", "mouse", "monitor"] as const`, `type LinkableCard`
  - `type LinkDevice = { _id: Id<"devices">; name: string; type: DeviceType; otd_path?: string }`
  - `linkPatch(patch: SetupPatch, current: Setup | undefined, devices: LinkDevice[]): { patch: SetupPatch } | { status: 400; message: string }`
  - `relinkSetup(setup: Setup | undefined, devices: LinkDevice[]): Setup | null` (null = nothing changed)
  - `unlinkDevice(setup: Setup | undefined, deviceId: Id<"devices">): Setup | null` (null = nothing changed)
  - `clearDeviceLinks(db: DatabaseWriter, deviceId: Id<"devices">): Promise<void>` (patches every player whose cards point at it; uses `unlinkDevice`)

- [ ] **Step 1: Add the fields to `keyboardCard`, `tabletCard`, `mouseCard`, `monitorCard`** in `convex/validators.ts`, with the spec's doc comments:

```ts
device_id: v.optional(v.id("devices")),
link: v.optional(v.literal("manual")),
```

- [ ] **Step 2: Write the failing tests** in `convex/lib/setupLinks.test.ts` (ids cast: `"t1" as Id<"devices">`):

```ts
const ctl = { _id: "t1", name: "Wacom CTL-472", type: "tablet", otd_path: "Wacom/CTL-472" };
const mx = { _id: "m1", name: "Logitech G Pro", type: "mouse" };

it("auto-links a confident typed model", () =>
	expect(linkPatch({ tablet: { model: "ctl 472" } }, undefined, devices))
		.toEqual({ patch: { tablet: { model: "ctl 472", device_id: "t1" } } }));
it("keeps a picked device and drops a stray manual flag", () =>
	expect(linkPatch({ tablet: { model: "x", device_id: "t1", link: "manual" } }, undefined, devices))
		.toEqual({ patch: { tablet: { model: "x", device_id: "t1" } } }));
it("keeps the link when other fields change", () =>
	expect(linkPatch({ tablet: { model: "my ctl", device_id: "t1", area_w: 90 } },
		{ tablet: { model: "my ctl", device_id: "t1", area_w: 80 } }, devices))
		.toEqual({ patch: { tablet: { model: "my ctl", device_id: "t1", area_w: 90 } } }));
it("400 when the picked device is gone", () =>
	expect(linkPatch({ tablet: { device_id: "gone" } }, undefined, devices))
		.toEqual({ status: 400, message: "That device no longer exists" }));
it("400 when the picked device is another type", () =>
	expect(linkPatch({ tablet: { device_id: "m1" } }, undefined, devices))
		.toEqual({ status: 400, message: "That device isn't a tablet" }));
it("manual flag stays while the model is unchanged", () =>
	expect(linkPatch({ tablet: { model: "ctl472", link: "manual" } },
		{ tablet: { model: "ctl472", link: "manual" } }, devices))
		.toEqual({ patch: { tablet: { model: "ctl472", link: "manual" } } }));
it("manual flag is dropped and matching runs when the model changes", () =>
	expect(linkPatch({ tablet: { model: "wacom ctl-472", link: "manual" } },
		{ tablet: { model: "ctl472", link: "manual" } }, devices))
		.toEqual({ patch: { tablet: { model: "wacom ctl-472", device_id: "t1" } } }));
it("a new manual flag (Not my tablet / keep as typed) is kept", () =>
	expect(linkPatch({ tablet: { model: "ctl472", link: "manual" } },
		{ tablet: { model: "ctl472", device_id: "t1" } }, devices))
		.toEqual({ patch: { tablet: { model: "ctl472", link: "manual" } } }));
it("leaves null cards and non-linkable cards alone", () =>
	expect(linkPatch({ tablet: null, pc: { cpu: "R7" } }, undefined, devices))
		.toEqual({ patch: { tablet: null, pc: { cpu: "R7" } } }));
it("relinkSetup links only unlinked, unflagged cards", () => {
	expect(relinkSetup({ tablet: { model: "ctl472" }, mouse: { model: "g pro", link: "manual" } }, devices))
		.toEqual({ tablet: { model: "ctl472", device_id: "t1" }, mouse: { model: "g pro", link: "manual" } });
	expect(relinkSetup({ tablet: { model: "ctl472", device_id: "t1" } }, devices)).toBeNull();
});
it("unlinkDevice clears only that device and sets no flag", () =>
	expect(unlinkDevice({ tablet: { model: "x", device_id: "t1" }, mouse: { device_id: "m1" } }, "t1"))
		.toEqual({ tablet: { model: "x" }, mouse: { device_id: "m1" } }));
```

Case 8 is how "Not my tablet" and "Not listed? Keep as typed" reach the server: the client sends `link: "manual"`; rule 2 keeps it because the model equals the stored one. (Model unchanged + flag in patch = keep, whether or not the stored card had the flag.)

Add to `convex/lib/setup.test.ts`: `applySetupPatch(undefined, { mouse: { device_id: "m1" } })` keeps the card (a card with only a link is not empty).

- [ ] **Step 3: Run to verify they fail**

Run: `bunx vitest run convex/lib/setupLinks.test.ts convex/lib/setup.test.ts`
Expected: FAIL (module missing).

- [ ] **Step 4: Implement `convex/lib/setupLinks.ts`** per the Interfaces and spec "Save path" rules 1–3. Device lookup by `_id` in the given list. Error copy exactly: `"That device no longer exists"`, `` `That device isn't a ${card}` ``. `clearDeviceLinks` scans `db.query("players").collect()` (few hundred rows).

- [ ] **Step 5: Run to verify they pass**

Run: `bunx vitest run convex/lib/setupLinks.test.ts convex/lib/setup.test.ts`
Expected: PASS.

- [ ] **Step 6: Wire `players.updateSetup`**: load `ctx.db.query("devices").collect()`, run `linkPatch(patch, player.setup, devices)`; on the error shape `fail(status, message)`; then `applySetupPatch(player.setup, result.patch)` as today.

- [ ] **Step 7: Extend `setupPatch` in `src/lib/server/schemas.ts`**: on the four cards add

```ts
device_id: v.pipe(v.nullish(v.pipe(v.string(), v.trim())), v.transform((id) => id || undefined)),
link: v.pipe(v.nullish(v.literal("manual")), v.transform((l) => l ?? undefined)),
```

(A malformed id fails Convex's `v.id` arg check as a 500; the UI only sends ids it received from the catalog, so that's accepted.)

- [ ] **Step 8: Type check and run the server tests**

Run: `bun run check && bunx vitest run --project server`
Expected: no new type errors; server tests pass.

- [ ] **Step 9: Commit**

```bash
git add convex/validators.ts convex/lib/setupLinks.ts convex/lib/setupLinks.test.ts convex/lib/setup.test.ts convex/players.ts src/lib/server/schemas.ts
git commit -m "feat(setup): link setup cards to catalog devices on save"
```

---

### Task 3: Catalog hooks and API routes

**Files:**
- Create: `convex/setupLinks.ts`
- Modify: `convex/devices.ts` (`upsert`, `remove`, `applyOtdBatch`; new `listByType`)
- Modify: `convex/lib/devices.ts` + `convex/lib/devices.test.ts` (one helper)
- Modify: `src/routes/api/devices/+server.ts` (add `GET`)
- Create: `src/routes/api/setup-links/+server.ts`
- Modify: `src/lib/server/schemas.ts` (`setupLinkBody`)

**Interfaces:**
- Consumes: `relinkSetup`, `clearDeviceLinks`, `LINKABLE_CARDS`, `LinkableCard` (Task 2).
- Produces:
  - `internal.setupLinks.relinkAll` — internalMutation, no args.
  - `api.setupLinks.link` — adminMutation `{ device_id: string, cards: { player_id: string, card: LinkableCard }[] }`.
  - `api.devices.listByType` — query `{ type: DeviceType }` → `{ _id, name, image_url?, full_w?, full_h? }[]`, sorted by name.
  - `relinkNeeded(next: DeviceInput, current: DeviceLike | null): boolean` in `convex/lib/devices.ts` (true on create, name change by `nameKey`, or type change).
  - `GET /api/devices?type=` → JSON array from `listByType`; `POST /api/setup-links` → 204.

- [ ] **Step 1: Write the failing test** for `relinkNeeded` in `convex/lib/devices.test.ts`: true for `current = null`; true when `"Wacom CTL-472"` → `"Wacom CTL-480"`; false for `"Wacom CTL-472"` → `" wacom  ctl-472 "`; true for a type change; false for an image-only edit.

- [ ] **Step 2: Run to verify it fails**: `bunx vitest run convex/lib/devices.test.ts` → FAIL.

- [ ] **Step 3: Implement `relinkNeeded`**, run again → PASS.

- [ ] **Step 4: `convex/setupLinks.ts`**:
  - `relinkAll`: load devices and players; for each player `relinkSetup(player.setup, devices)`; patch the non-null ones (`setup` only; don't bump `updated_at`).
  - `link`: normalize `device_id` (404 "Device not found"); for each card: normalize `player_id` (404 "Player not found"), `fail(400, …)` when `device.type !== card`, skip players whose card is missing (it was removed meanwhile), set `device_id`, delete `link`. Don't bump `updated_at`.

- [ ] **Step 5: Hook `convex/devices.ts`**:
  - `upsert`: when `current` exists and `current.type !== input.type`, `await clearDeviceLinks(ctx.db, current._id)` before replacing; when `relinkNeeded(input, current)`, `ctx.scheduler.runAfter(0, internal.setupLinks.relinkAll, {})`.
  - `remove`: `await clearDeviceLinks(ctx.db, device._id)` before delete.
  - `applyOtdBatch`: schedule `relinkAll` when `added + updated > 0`.
  - `listByType`: `withIndex("by_type")`, map to the five fields, sort by name.

- [ ] **Step 6: Routes.** `GET` in `src/routes/api/devices/+server.ts`: `requireUser(event)`, read `type` from `event.url.searchParams`, validate with the existing `deviceType` valibot schema (400 "type must be tablet, keyboard, mouse or monitor"), `json(await convex.query(api.devices.listByType, { type }))`. `src/routes/api/setup-links/+server.ts` `POST`: `requireAdmin` → `parseBody(event.request, setupLinkBody)` → `mutate(api.setupLinks.link, { ...body, actor_osu_id: admin.osu_id })` → 204. `setupLinkBody`: `device_id` non-empty string, `cards` array of `{ player_id: non-empty string, card: picklist(LINKABLE_CARDS) }`, 1–500 items.

- [ ] **Step 7: Check**: `bun run check && bunx vitest run --project server` → no new errors, pass.

- [ ] **Step 8: Commit**

```bash
git add convex/setupLinks.ts convex/devices.ts convex/lib/devices.ts convex/lib/devices.test.ts src/routes/api/devices/+server.ts src/routes/api/setup-links/+server.ts src/lib/server/schemas.ts
git commit -m "feat(devices): relink setups after catalog changes and add link routes"
```

---

### Task 4: Profile shows linked devices

**Files:**
- Modify: `convex/players.ts` (`get`)
- Modify: `src/lib/setup.ts` + `src/lib/setup.test.ts`
- Modify: `src/routes/(public)/player/[osuId]/setup-panel.svelte`
- Modify: `src/routes/(admin)/dashboard/players/[id]/setup-preview.svelte`, `setup-tab.svelte`, and the editor page that renders `SetupTab` (pass `data.devices`)

**Interfaces:**
- Consumes: `LinkableCard`, `LINKABLE_CARDS` (Task 2).
- Produces:
  - `players.get` result gains `devices: Partial<Record<LinkableCard, LinkedDevice>>`.
  - In `src/lib/setup.ts`: `type LinkedDevice = { _id: Id<"devices">; name: string; image_url?: string; full_w?: number; full_h?: number }`; `type LinkedDevices = Partial<Record<LinkableCard, LinkedDevice>>`;
    `displaySetup(setup: Setup, devices: LinkedDevices): Setup` (linked cards get `model = device.name`; tablet gets the device's `full_w/full_h` only when it has both);
    `linkedDevices(setup: Setup | undefined, all: LinkedDevice[]): LinkedDevices` (sync lookup for the dashboard, which has the whole list).

- [ ] **Step 1: Failing tests** for `displaySetup` and `linkedDevices`: linked tablet shows the device name and its 152 × 95; a device without sizes keeps the card's 150 × 94; unlinked cards unchanged; a `device_id` missing from `all` is left out of `linkedDevices` (treated as unlinked).
- [ ] **Step 2: Run** `bunx vitest run src/lib` → FAIL.
- [ ] **Step 3: Implement both** in `src/lib/setup.ts`; run → PASS.
- [ ] **Step 4: `players.get`**: for each linkable card with `device_id`, `ctx.db.get` it; include `{ _id, name, image_url, full_w, full_h }` when found. Return `{ ...player, skins, devices }`.
- [ ] **Step 5: `setup-panel.svelte`**: `const setup = $derived(displaySetup(player.setup ?? {}, player.devices))`. The `model` snippet takes an `image?: string`; when present render `<img src={image} alt="" class="size-full object-cover">` inside the 80×56 box instead of the icon; the keyboard's large photo slot does the same with `player.devices.keyboard?.image_url`. Diagram and tiles need no change (they read the overlaid setup).
- [ ] **Step 6: `setup-preview.svelte`** gets a `devices: LinkedDevices` prop and mirrors step 5. `setup-tab.svelte` computes `linkedDevices(player.setup, devices)` from the dashboard layout's `data.devices` and passes it.
- [ ] **Step 7: Check** `bun run check` → no new errors. With `bun run dev` + `bunx convex dev`, link a card by hand in the Convex dashboard (set `setup.tablet.device_id` to an OTD tablet's id) and confirm the profile shows the catalog name, the device's full area in the diagram, and (after giving that device a photo in the Devices tab) the photo.
- [ ] **Step 8: Commit**

```bash
git add convex/players.ts src/lib/setup.ts src/lib/setup.test.ts "src/routes/(public)/player/[osuId]/setup-panel.svelte" "src/routes/(admin)/dashboard/players/[id]/"
git commit -m "feat(profile): show linked device names, photos and full area"
```

---

### Task 5: Device picker component

**Files:**
- Create (generated): `src/lib/components/ui/command/*` via `bunx shadcn-svelte@latest add command`, then restyle class strings to tokens (list/popover `bg-layer-2`, highlighted item `bg-layer-3`, `rounded-md`, `shadow-float` on the floating list).
- Create: `src/lib/device-catalog.ts` + `src/lib/device-catalog.test.ts`
- Create: `src/lib/components/device-picker.svelte`

**Interfaces:**
- Produces:
  - `type PickerDevice = { _id: Id<"devices">; name: string; image_url?: string; full_w?: number; full_h?: number }`
  - `loadDevices(type: DeviceType, fetcher = fetch): Promise<PickerDevice[]>` — caches the promise per type in a module `Map`; a rejected promise is removed from the cache so the next open retries. Uses `request<PickerDevice[]>` from `$lib/api` (GET by default; throws with the backend message), with the fetcher injectable for the test.
  - `device-picker.svelte` props:
    ```ts
    {
      type: DeviceType;
      devices: PickerDevice[] | "loading" | "error";
      query: string;            // $bindable — the typed text
      inline?: boolean;          // true: list floats under the input and opens on focus (setup dialog); false: list always shown (dashboard dialog)
      pinned?: Id<"devices">;    // shown first (dashboard "Closest")
      onPick: (device: PickerDevice) => void;
      onKeepTyped?: () => void;  // shows the "Not listed? Keep "<query>" as typed" row when set and query is non-empty
      onFocus?: () => void;      // the dialog triggers loadDevices here
      inputId?: string;
    }
    ```

- [ ] **Step 1: Failing test** `src/lib/device-catalog.test.ts`: two calls for `"tablet"` call the fetcher once; a call for `"mouse"` calls it again; after a rejected fetch the next call fetches again. Fetcher asserted with the URL `/api/devices?type=tablet`.
- [ ] **Step 2: Run** `bunx vitest run src/lib/device-catalog.test.ts` → FAIL; implement; run → PASS.
- [ ] **Step 3: Add and restyle `command`.**
- [ ] **Step 4: Build `device-picker.svelte`** on `Command.Root` / `Command.Input` / `Command.List` / `Command.Item` (filtering on `name`; ↑/↓/Enter come from Command). Rows per mockup "Setup dialog · choosing a device": 48×32 thumbnail (image `object-cover`, else the type icon from `DEVICE_ICONS` in `dashboard/derive.ts` — move that map to `src/lib/devices.ts` if importing a route file from `$comp` is awkward), `text-body-strong` name, `text-caption` "152 × 95 mm" for tablets with sizes. Count caption on top ("5 tablets", "1 tablet"). `"loading"` → one muted "Loading devices…" row; `"error"` → "Couldn't load the list. You can still type the model." Footer hint `↑ ↓ move · Enter choose · Esc close`. In `inline` mode Esc closes the list without clearing the query and must not close the surrounding dialog (stop propagation).
- [ ] **Step 5: Check** `bun run check` → no new errors.
- [ ] **Step 6: Commit**

```bash
git add src/lib/components/ui/command src/lib/device-catalog.ts src/lib/device-catalog.test.ts src/lib/components/device-picker.svelte
git commit -m "feat(devices): add device picker on shadcn command"
```

(If the `DEVICE_ICONS` move happens, add `src/lib/devices.ts` and the updated `dashboard/derive.ts` + its importers to this commit.)

---

### Task 6: Setup dialog uses the picker

**Files:**
- Modify: `src/routes/(public)/player/[osuId]/setup-dialog.svelte`
- Modify: `src/lib/setup.ts` + its test (OTD import rule)

**Interfaces:**
- Consumes: `device-picker.svelte`, `loadDevices`, `PickerDevice` (Task 5); `player.devices` / `LinkedDevice` (Task 4); server rules (Task 2).
- Produces: `importedTablet(card: { model?: string | null; device_id?: string | null; link?: string | null }, linkedName: string | undefined, tablet: string): { model: string; device_id?: undefined; link?: undefined } | null` in `src/lib/setup.ts` — null when `normalizeModel(linkedName ?? card.model ?? "") === normalizeModel(tablet)` (same tablet: change nothing), else the replacement (model = `tablet`, link fields cleared).

- [ ] **Step 1: Failing tests** for `importedTablet`: empty card → `{ model: "Wacom CTL-472" }`; card linked to "Wacom CTL-472" importing "Wacom CTL-472" → null; card linked to "Wacom CTL-472" importing "Huion H420" → `{ model: "Huion H420", device_id: undefined, link: undefined }`; typed "ctl472" + `link: "manual"` importing "Wacom CTL-472" → `{ model: "Wacom CTL-472", device_id: undefined, link: undefined }` ("ctl472" and "wacomctl472" normalize differently, so the import wins and the flag is cleared).
- [ ] **Step 2: Run** → FAIL; implement; run → PASS.
- [ ] **Step 3: Dialog wiring** (keyboard, tablet, mouse, monitor only):
  - `draft` gains `device_id` and `link` (they come from the saved card already).
  - `linked = $state<LinkedDevice | PickerDevice | null>` set on open from `player.devices[card]`.
  - The Model field renders `DevicePicker` (`inline`, `bind:query={draft.model}`, `onFocus` → `loadDevices(card)` into a `catalog` state of `PickerDevice[] | "loading" | "error"`) when `!draft.device_id`, else the linked block.
  - `onPick(device)`: `draft.device_id = device._id; draft.model = device.name; draft.link = null; linked = device`.
  - `onKeepTyped()`: close the list, `draft.link = "manual"`.
  - Typing in the field after a keep-typed (query changes) sets `draft.link = null` (the server would drop it anyway; this keeps the draft honest).
  - Linked block per mockup "Setup dialog · linked card": 64×40 photo or type icon, name, caption "From the catalog" (+ " · full area 152 × 95 mm" for tablets with sizes), ghost button `Not my ${title.toLowerCase()}` → `draft.device_id = null; draft.link = "manual"; linked = null`.
  - Tablet with `linked` having both sizes: hide the Full area width/height inputs, show one dashed `border-layer-5` read-only field "Full area" with a lock icon and "152 × 95 mm", plus the caption "The full area comes from the device, so the position diagram matches the real tablet."
  - `applyProfile`: replace `model: draft.model || profile.tablet` with `importedTablet(draft, linked?.name, profile.tablet)` spread into the draft when non-null (and `linked = null` then).
- [ ] **Step 4: Check** `bun run check` → no new errors.
- [ ] **Step 5: Browser check** (dev server + `bunx convex dev`, signed in as the owner of a test player): focus Model on the tablet card → list loads and filters on "ctl 4"; arrows + Enter link it; Save → profile shows the device; reopen → linked block; "Not my tablet" + Save → card keeps "Wacom CTL-472" as text and stays unlinked after another Save; type "ctl472" in a fresh mouse… (no mice in catalog) → list says 0 and the text saves; import an OTD settings.json with a different tablet → model replaced and, after Save, linked to it. Also check the dialog at 375px width.
- [ ] **Step 6: Commit**

```bash
git add "src/routes/(public)/player/[osuId]/setup-dialog.svelte" src/lib/setup.ts src/lib/setup.test.ts
git commit -m "feat(setup): pick catalog devices in the setup dialog"
```

---

### Task 7: Dashboard "Setups to link"

**Files:**
- Create: `src/routes/(admin)/dashboard/setup-link-groups.ts` + `.test.ts`
- Create: `src/routes/(admin)/dashboard/dialogs/link-device-dialog.svelte`
- Modify: `src/routes/(admin)/dashboard/dialogs/device-creator-dialog.svelte` (prefill)
- Modify: `src/routes/(admin)/dashboard/+page.svelte`

**Interfaces:**
- Consumes: `normalizeModel`, `confidentMatch` (Task 1); `LINKABLE_CARDS`, `LinkableCard` (Task 2); `POST /api/setup-links` (Task 3); `device-picker.svelte` (Task 5).
- Produces:
  ```ts
  type LinkGroup = {
    type: LinkableCard;
    key: string;                 // normalized model
    label: string;               // most common typed variant, upper-cased
    variants: string[];          // distinct typed variants, most common first
    cards: { player_id: Id<"players">; card: LinkableCard }[];
    allKept: boolean;            // every card has link: "manual"
    closest: Device | null;      // Fuse best match among the type's devices
  };
  linkGroups(players: Doc<"players">[], devices: Device[]): LinkGroup[]  // sorted by cards.length desc, then label
  ```
  `device-creator-dialog.svelte` gains `initial?: { name: string; type: DeviceType }` applied on open instead of the blank defaults.

- [ ] **Step 1: Failing tests** for `linkGroups`: "ctl 4100" and "CTL4100" on two players form one group labelled "CTL 4100" with both variants; a linked card is excluded; an unflagged card whose model confidently matches is excluded; a flagged card that confidently matches is included with `allKept: true`; a model of " - " is excluded; groups are per type (the same text on a mouse and a keyboard → two groups); `closest` is the Fuse best match ("ctl 4100" → "Wacom CTL-4100WL" when that is in `devices`) and null for an empty type.
- [ ] **Step 2: Run** `bunx vitest run "src/routes/(admin)/dashboard/setup-link-groups.test.ts"` → FAIL; implement (Fuse threshold 0.4, keys `["name"]`, like `list-query.svelte.ts`); run → PASS.
- [ ] **Step 3: `link-device-dialog.svelte`**: props `{ group: LinkGroup | null; devices: Device[]; onClose: () => void }`. Title "Link CTL 4100", description "3 setups · tablet". Body: `DevicePicker` with `inline={false}`, `pinned={group.closest?._id}`, devices filtered to `group.type`. `onPick` → `request("/api/setup-links", { method: "POST", body: { device_id, cards: group.cards } })`, `invalidate("app:players")`, toast "Linked 3 setups to Wacom CTL-4100WL", close; errors toast the backend message.
- [ ] **Step 4: Home card** in `+page.svelte`, above Needs attention, shown only when `linkGroups(data.players, data.devices)` is non-empty, per mockup "Dashboard Home · unlinked setups": `Card` title "Setups to link", icon `link`, trailing caption "3 groups · 8 setups". Row (`bg-layer-2 rounded-md p-3`): type icon tile, label (`text-body-strong`), caption: `${n} setup(s)` + (`allKept` → " · the player removed the link, kept as typed"; no `closest` → " · not in the catalog"; else " · typed as “ctl 4100”, “CTL4100”"). "Closest:" line with thumbnail + name when `closest`. Buttons: "Create device" (ghost, plus icon, only when `!closest`) opens `DeviceCreatorDialog` with `initial = { name: variants[0], type }`; "Choose…" (secondary) opens the link dialog. Below 900px the buttons wrap under the text.
- [ ] **Step 5: Check** `bun run check` → no new errors. Browser: type an unmatched tablet name on a test player's card → Home lists it; Choose… → pick → row disappears and the profile shows the device; a keyboard name → Create device → creator opens prefilled.
- [ ] **Step 6: Commit**

```bash
git add "src/routes/(admin)/dashboard/setup-link-groups.ts" "src/routes/(admin)/dashboard/setup-link-groups.test.ts" "src/routes/(admin)/dashboard/dialogs/link-device-dialog.svelte" "src/routes/(admin)/dashboard/dialogs/device-creator-dialog.svelte" "src/routes/(admin)/dashboard/+page.svelte"
git commit -m "feat(dashboard): list setups to link on Home"
```

---

### Task 8: First relink and whole-branch check

- [ ] **Step 1: Link existing setups once** on the dev deployment: `bunx convex run setupLinks:relinkAll`. Expected: exits cleanly; players whose typed models are exact catalog names (e.g. OTD imports) now have `device_id` in the Convex dashboard. Note in the PR body that the same command runs once on production after deploy.
- [ ] **Step 2: Full test run** `bun run test`. Expected: everything passes except the 5 Popover client tests already failing on main (name them in the report if they're the only failures).
- [ ] **Step 3: `bun run check`** → 0 errors.
- [ ] **Step 4: Prettier on changed files** `git diff --name-only main... | grep -E '\.(ts|svelte|md)$' | xargs bunx prettier --check` → clean (fix with `--write` and commit as `style: format`).
- [ ] **Step 5: Report** to the user what was verified in the browser and what wasn't; ask before opening a PR (short, human description, no Claude line).
