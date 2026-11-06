/**
 * A hue that is safe to put in CSS: a finite number clamped to 0–360, or null to keep the site default.
 * Bad stored data (a string, NaN) never reaches the page's style.
 */
export function clampHue(value: unknown): number | null {
	if (typeof value !== "number" || !Number.isFinite(value)) return null;
	return Math.min(360, Math.max(0, value));
}

/**
 * The page's hue: the viewed player's color on a profile page, otherwise the viewer's own color
 * when they keep "Use my color across the site" on, otherwise null (the site default).
 */
export function pickHue(pageHue: unknown, userHue: unknown, useMyColor: boolean): number | null {
	return clampHue(pageHue) ?? (useMyColor ? clampHue(userHue) : null);
}
