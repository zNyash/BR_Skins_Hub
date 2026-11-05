import { SHADOW_ITEM_MARKER_PROPERTY_NAME } from "svelte-dnd-action";

/**
 * Shared look and feel for drag-and-drop lists (svelte-dnd-action): the grabbed item lifts out
 * tilted with a shadow and follows the pointer, a ghost marks where it will land, and the rest
 * animate out of the way (use `animate:flip={{ duration: DND_FLIP_MS }}` on each item).
 */

export const DND_FLIP_MS = 150;

/** Classes for the placeholder that shows where the dragged item will be dropped. */
export const GHOST_CLASS = "opacity-40 outline-2 outline-offset-2 outline-dashed outline-primary";

/** True for the placeholder item svelte-dnd-action puts in the list while dragging. */
export function isGhost(item: object): boolean {
	return (
		SHADOW_ITEM_MARKER_PROPERTY_NAME in item && Boolean(item[SHADOW_ITEM_MARKER_PROPERTY_NAME])
	);
}

/** Styles the copy that follows the pointer. */
export function liftDraggedElement(element?: HTMLElement) {
	if (!element) return;
	element.style.transform = "rotate(-2deg) scale(1.03)";
	element.style.boxShadow = "0 12px 28px rgb(0 0 0 / 0.45)";
	element.style.cursor = "grabbing";
}

/** Options for `use:dndzone`; pass the list the zone renders. */
export function dndOptions<T extends { id: string }>(items: T[]) {
	return {
		items,
		flipDurationMs: DND_FLIP_MS,
		transformDraggedElement: liftDraggedElement,
		// The ghost already shows the drop spot, so the zone itself isn't highlighted.
		dropTargetStyle: {},
		// On touch, a short hold starts a drag so swiping still scrolls the page.
		delayTouchStart: true
	};
}
