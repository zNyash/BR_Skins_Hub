export type Box = { top: number; left: number; width: number; height: number };
type Size = { width: number; height: number };

/** Space between the trigger and the popover. */
export const POPOVER_GAP = 8;
/** How close a popover may get to the viewport's edges. */
export const VIEWPORT_MARGIN = 8;

/**
 * Where a popover goes, in viewport pixels: below the trigger and aligned to its left edge, flipped
 * above when it doesn't fit below (and does fit above), and pushed back inside the viewport sideways.
 */
export function placePopover(
	trigger: Box,
	popover: Size,
	viewport: Size
): { top: number; left: number } {
	let top = trigger.top + trigger.height + POPOVER_GAP;
	const above = trigger.top - POPOVER_GAP - popover.height;
	if (top + popover.height > viewport.height - VIEWPORT_MARGIN && above >= VIEWPORT_MARGIN)
		top = above;

	const maxLeft = viewport.width - popover.width - VIEWPORT_MARGIN;
	const left = Math.max(VIEWPORT_MARGIN, Math.min(trigger.left, maxLeft));
	return { top, left };
}
