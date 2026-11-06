/**
 * A hue that is safe to put in CSS: a finite number clamped to 0–360, or null to keep the site default.
 * Bad stored data (a string, NaN) never reaches the page's style.
 */
export function clampHue(value: unknown): number | null {
	if (typeof value !== "number" || !Number.isFinite(value)) return null;
	return Math.min(360, Math.max(0, value));
}

/**
 * The page's hue: a live preview while the owner picks a color; otherwise, on a profile page, that
 * player's color (or the site default if they have none); elsewhere the viewer's own color when
 * they keep "My color everywhere" on; otherwise null (the site default).
 * `pageHue` is undefined on pages that aren't profiles.
 */
export function pickHue(
	pageHue: unknown,
	userHue: unknown,
	useMyColor: boolean,
	preview: unknown = null
): number | null {
	const previewed = clampHue(preview);
	if (previewed !== null) return previewed;
	// On a profile page (pageHue is set, even to null) only that player's color counts:
	// a player without one gets the site default, never the visitor's color.
	if (pageHue !== undefined) return clampHue(pageHue);
	return useMyColor ? clampHue(userHue) : null;
}

/** A typed-in hue: blank or non-numeric gives null (ignore it), anything else is rounded and clamped. */
export function parseHue(input: string): number | null {
	const text = input.trim();
	if (text === "") return null;
	const value = Number(text);
	return Number.isFinite(value) ? clampHue(Math.round(value)) : null;
}
