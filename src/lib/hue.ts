/**
 * A hue that is safe to put in CSS: a finite number clamped to 0–360, or null to keep the site default.
 * Bad stored data (a string, NaN) never reaches the page's style.
 */
export function clampHue(value: unknown): number | null {
	if (typeof value !== "number" || !Number.isFinite(value)) return null;
	return Math.min(360, Math.max(0, value));
}
