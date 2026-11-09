# Dashboard feedback (2026-11-09)

From the first look at the new dashboard (`feat/admin-dashboard`). To fix after the design system is in place.

1. **Player rows: remove the cover banner.** The faded cover behind each row makes the names hard to read. Rows go back to the plain layer background (hover / selected still by elevation). The faded cover stays **only** in the player editor's header, where it looks good.
2. **Player editor header: remove the stepper.** The ‹ n/N › control in the top right renders as a broken empty pill and isn't wanted. Remove it entirely (and its keyboard/route wiring if nothing else uses it).
3. **Links tab: tighten the spacing.** The rows are spaced too far apart (the gap-per-group change made it 16px); bring the list closer together.
4. **Setup tab: show the real setup, not a model list.** The summary only shows a model per card, so In-game and PC show "–" even when filled. Replace it with a small, read-only preview of the profile's Setup tab: same layout rules and cards, no editing, scaled down to fit the editor and reflowing with its width (container queries). Keep "Edit on profile ↗".
5. **Filter chips don't match the site's style.** The "No skins 1 / No setup 54 / Not synced 35" pills look foreign next to the rest of the UI. Redesign as part of the design system.

General: the UI is inconsistent across pages → build a design system first (tokens + components), then apply it here.
