import { clampWidth } from "$lib/resizable";

/** The dashboard's layout choices, kept in a cookie so the server can render them without a flash. */
export type DashboardLayout = { pinned: boolean; rail: number; editor: number };

export const LAYOUT_COOKIE = "dashboard_layout";
export const DEFAULT_LAYOUT: DashboardLayout = { pinned: false, rail: 240, editor: 720 };
export const RAIL = { min: 200, max: 320 };
export const EDITOR = { min: 440, max: 960 };

/** Below this viewport width the sidebar is always the rail, whatever the cookie says. */
const PIN_MIN_VIEWPORT = 1200;
const ONE_YEAR_S = 60 * 60 * 24 * 365;

/** Reads the cookie value; anything missing, broken or out of range falls back to the default. */
export function parseLayout(raw: string | undefined): DashboardLayout {
	let data: Record<string, unknown> = {};
	try {
		const parsed: unknown = raw ? JSON.parse(raw) : null;
		if (parsed && typeof parsed === "object") data = parsed as Record<string, unknown>;
	} catch {
		// Not JSON: use the defaults.
	}

	const width = (value: unknown, range: { min: number; max: number }, fallback: number) =>
		typeof value === "number" && Number.isFinite(value)
			? clampWidth(value, range.min, range.max)
			: fallback;

	return {
		pinned: typeof data.pinned === "boolean" ? data.pinned : DEFAULT_LAYOUT.pinned,
		rail: width(data.rail, RAIL, DEFAULT_LAYOUT.rail),
		editor: width(data.editor, EDITOR, DEFAULT_LAYOUT.editor)
	};
}

/** The full `document.cookie` string to save the layout. */
export function serializeLayout(layout: DashboardLayout): string {
	const value = encodeURIComponent(JSON.stringify(layout));
	return `${LAYOUT_COOKIE}=${value}; path=/dashboard; max-age=${ONE_YEAR_S}; SameSite=Lax`;
}

export function showPinned(layout: DashboardLayout, viewportWidth: number): boolean {
	return layout.pinned && viewportWidth >= PIN_MIN_VIEWPORT;
}
