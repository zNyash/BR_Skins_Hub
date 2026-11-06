/**
 * A hue that is safe to put in CSS: a finite number clamped to 0–360, or null to keep the site default.
 * Bad stored data (a string, NaN) never reaches the page's style.
 */
export function clampHue(value: unknown): number | null {
	if (typeof value !== "number" || !Number.isFinite(value)) return null;
	return Math.min(360, Math.max(0, value));
}

/**
 * The page's hue: a live preview while the owner picks a color; otherwise the viewed player's
 * color on a profile page; otherwise the viewer's own color when they keep "My color everywhere"
 * on; otherwise null (the site default).
 */
export function pickHue(
	pageHue: unknown,
	userHue: unknown,
	useMyColor: boolean,
	preview: unknown = null
): number | null {
	return clampHue(preview) ?? clampHue(pageHue) ?? (useMyColor ? clampHue(userHue) : null);
}

/** A typed-in hue: blank or non-numeric gives null (ignore it), anything else is rounded and clamped. */
export function parseHue(input: string): number | null {
	const text = input.trim();
	if (text === "") return null;
	const value = Number(text);
	return Number.isFinite(value) ? clampHue(Math.round(value)) : null;
}
