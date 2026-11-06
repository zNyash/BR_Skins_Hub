import type { Action } from "svelte/action";

/**
 * Drag-to-reorder for any list or grid, with plain pointer events.
 *
 * Usage: put `use:sortable={{ onMove }}` on the container, and mark each item (direct children)
 * with `data-sortable-item` and `class={SORTABLE_GHOST_CLASS}`. Key the `{#each}` by a stable id
 * and add `animate:flip` so the other items slide out of the way.
 *
 * While dragging, a full-color copy of the item follows the pointer (tilted, with a shadow) and the
 * item itself stays in the list as the "ghost", faded, always sitting where it will land.
 * `onMove(from, to)` is called every time the ghost should move; the caller reorders its array
 * (e.g. with `moveItem`). Escape cancels and moves it back. `onDrop(from, to)` fires once on release,
 * when the item ended up somewhere new: the place to save the order.
 *
 * Which item is under the pointer is decided against the slot positions measured when the drag
 * starts, not against the items' live positions. During a drag the number of items doesn't change,
 * so the slots (grid cells) stay put, and animations can't make the target flip back and forth.
 * This assumes items of the same size, like grid cells.
 *
 * Presses on buttons, links, inputs or `[data-no-drag]` never start a drag, unless the pressed control
 * is marked `[data-sortable-handle]` (for items that are themselves buttons, like tabs). A drag only
 * starts after the pointer moves a few pixels (mouse) or after a short hold (touch), so clicks stay
 * clicks and swiping still scrolls.
 */

export type Rect = { left: number; top: number; width: number; height: number };

export type SortableOptions = {
	onMove: (from: number, to: number) => void;
	/** Called once when the item is released somewhere other than where it started (not on cancel). */
	onDrop?: (from: number, to: number) => void;
	disabled?: boolean;
};

/** Faded, greyed-out look for the item while it is being dragged. */
export const SORTABLE_GHOST_CLASS = "data-dragging:opacity-40 data-dragging:grayscale";

const ITEM_ATTR = "data-sortable-item";
const DRAGGING_ATTR = "data-dragging";
const IGNORE = "button, a, input, textarea, select, [data-no-drag]";
const HANDLE = "[data-sortable-handle]";

const MOUSE_THRESHOLD_PX = 4;
const TOUCH_HOLD_MS = 200;
const TOUCH_SLOP_PX = 8;
const DROP_MS = 150;
const LIFT_TRANSFORM = "rotate(-2deg) scale(1.03)";
const LIFT_SHADOW = "0 12px 28px rgb(0 0 0 / 0.45)";

/** Returns a copy of `list` with the item at `from` moved to `to`. Out-of-range indexes change nothing. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
	const copy = [...list];
	const inRange = (i: number) => i >= 0 && i < list.length;
	if (!inRange(from) || !inRange(to)) return copy;

	const [item] = copy.splice(from, 1);
	copy.splice(to, 0, item);
	return copy;
}

/** Index of the slot containing the point, or -1 (gaps between slots and outside count as none). */
export function slotAtPoint(slots: readonly Rect[], x: number, y: number): number {
	return slots.findIndex(
		(s) => x >= s.left && x < s.left + s.width && y >= s.top && y < s.top + s.height
	);
}

export const sortable: Action<HTMLElement, SortableOptions> = (node, initialOptions) => {
	let options = initialOptions;

	// --- State of the current press/drag (reset by `reset`) ---
	let pressed: HTMLElement | null = null;
	let pointerId = -1;
	let startX = 0;
	let startY = 0;
	let lastX = 0;
	let lastY = 0;
	let holdTimer: ReturnType<typeof setTimeout> | undefined;
	let dragging = false;

	let copy: HTMLElement | null = null;
	let offsetX = 0;
	let offsetY = 0;
	/** Slot positions in page coordinates, so scrolling during a drag doesn't shift them. */
	let slots: Rect[] = [];
	let origin = -1;
	let current = -1;

	const items = () =>
		[...node.children].filter(
			(el): el is HTMLElement => el instanceof HTMLElement && el.hasAttribute(ITEM_ATTR)
		);

	// --- Press ---
	function onPointerDown(event: PointerEvent) {
		if (options.disabled || pressed || event.button !== 0) return;

		const target = event.target as Element;
		const ignored = target.closest(IGNORE);
		if (ignored && !ignored.matches(HANDLE)) return;
		const item = target.closest<HTMLElement>(`[${ITEM_ATTR}]`);
		if (!item || item.parentElement !== node) return;

		pressed = item;
		pointerId = event.pointerId;
		startX = lastX = event.clientX;
		startY = lastY = event.clientY;

		if (event.pointerType === "touch") {
			holdTimer = setTimeout(() => startDrag(lastX, lastY), TOUCH_HOLD_MS);
		}

		window.addEventListener("pointermove", onPointerMove);
		window.addEventListener("pointerup", onPointerUp);
		window.addEventListener("pointercancel", onPointerCancel);
		window.addEventListener("keydown", onKeyDown, true);
		// Only a non-passive touchmove can stop the page from scrolling once a touch drag started.
		window.addEventListener("touchmove", onTouchMove, { passive: false });
	}

	function onPointerMove(event: PointerEvent) {
		if (event.pointerId !== pointerId) return;
		lastX = event.clientX;
		lastY = event.clientY;
		const distance = Math.hypot(lastX - startX, lastY - startY);

		if (!dragging) {
			if (event.pointerType === "touch") {
				// Moving before the hold finished means the user is scrolling, not dragging.
				if (distance > TOUCH_SLOP_PX) reset();
				return;
			}
			if (distance < MOUSE_THRESHOLD_PX) return;
			startDrag(startX, startY);
		}
		followPointer(lastX, lastY);
	}

	function onPointerUp(event: PointerEvent) {
		if (event.pointerId !== pointerId) return;
		if (dragging) {
			swallowNextClick();
			const [from, to] = [origin, current];
			drop();
			if (from !== to) options.onDrop?.(from, to);
		} else {
			reset();
		}
	}

	function onPointerCancel(event: PointerEvent) {
		if (event.pointerId === pointerId) cancel();
	}

	function onKeyDown(event: KeyboardEvent) {
		if (event.key !== "Escape" || !dragging) return;
		// Captured on window first, so the Escape doesn't also close the editor or a dialog.
		event.preventDefault();
		event.stopPropagation();
		cancel();
	}

	function onTouchMove(event: TouchEvent) {
		if (dragging) event.preventDefault();
	}

	// --- Drag ---
	function startDrag(x: number, y: number) {
		if (!pressed || dragging) return;
		clearTimeout(holdTimer);

		const list = items();
		origin = current = list.indexOf(pressed);
		if (origin === -1) return reset();

		slots = list.map((el) => {
			const r = el.getBoundingClientRect();
			return { left: r.left + scrollX, top: r.top + scrollY, width: r.width, height: r.height };
		});

		const rect = pressed.getBoundingClientRect();
		offsetX = x - rect.left;
		offsetY = y - rect.top;

		// The floating copy, cloned before the item is marked so it keeps full color.
		copy = pressed.cloneNode(true) as HTMLElement;
		copy.removeAttribute(ITEM_ATTR);
		Object.assign(copy.style, {
			position: "fixed",
			left: `${rect.left}px`,
			top: `${rect.top}px`,
			width: `${rect.width}px`,
			height: `${rect.height}px`,
			margin: "0",
			zIndex: "9999",
			pointerEvents: "none",
			cursor: "grabbing",
			transition: `transform ${DROP_MS}ms ease-out, box-shadow ${DROP_MS}ms ease-out`
		});
		document.body.appendChild(copy);
		// Next frame, so the transition animates it "popping out".
		const lifted = copy;
		requestAnimationFrame(() => {
			lifted.style.transform = LIFT_TRANSFORM;
			lifted.style.boxShadow = LIFT_SHADOW;
		});

		pressed.setAttribute(DRAGGING_ATTR, "");
		document.body.style.userSelect = "none";
		document.body.style.cursor = "grabbing";
		dragging = true;
	}

	function followPointer(x: number, y: number) {
		if (!copy) return;
		copy.style.left = `${x - offsetX}px`;
		copy.style.top = `${y - offsetY}px`;

		const slot = slotAtPoint(slots, x + scrollX, y + scrollY);
		if (slot !== -1 && slot !== current) {
			options.onMove(current, slot);
			current = slot;
		}
	}

	/** Glides the copy into the ghost's slot, then removes it and un-fades the item. */
	function drop() {
		const floating = copy;
		const item = pressed;
		const slot = slots[current];

		if (floating && slot) {
			floating.style.transition = ["left", "top", "transform", "box-shadow"]
				.map((p) => `${p} ${DROP_MS}ms ease-out`)
				.join(", ");
			floating.style.left = `${slot.left - scrollX}px`;
			floating.style.top = `${slot.top - scrollY}px`;
			floating.style.transform = "none";
			floating.style.boxShadow = "none";
		}
		setTimeout(() => {
			floating?.remove();
			item?.removeAttribute(DRAGGING_ATTR);
		}, DROP_MS);

		copy = null; // `reset` must not remove it before the glide ends
		reset();
	}

	function cancel() {
		if (!dragging) return reset();
		if (current !== origin) {
			options.onMove(current, origin);
			current = origin;
		}
		drop();
	}

	/** The click that follows a drag's pointerup would otherwise land on whatever is under the pointer. */
	function swallowNextClick() {
		const swallow = (e: MouseEvent) => {
			e.stopPropagation();
			e.preventDefault();
		};
		window.addEventListener("click", swallow, { capture: true, once: true });
		setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 0);
	}

	function reset() {
		clearTimeout(holdTimer);
		copy?.remove();
		if (pressed && !dragging) pressed.removeAttribute(DRAGGING_ATTR);
		pressed = null;
		copy = null;
		pointerId = -1;
		dragging = false;
		slots = [];
		document.body.style.userSelect = "";
		document.body.style.cursor = "";

		window.removeEventListener("pointermove", onPointerMove);
		window.removeEventListener("pointerup", onPointerUp);
		window.removeEventListener("pointercancel", onPointerCancel);
		window.removeEventListener("keydown", onKeyDown, true);
		window.removeEventListener("touchmove", onTouchMove);
	}

	// A long press on touch would open the context menu (e.g. "save image") instead of dragging.
	function onContextMenu(event: Event) {
		if (pressed) event.preventDefault();
	}

	node.addEventListener("pointerdown", onPointerDown);
	node.addEventListener("contextmenu", onContextMenu);

	return {
		update(newOptions) {
			options = newOptions;
		},
		destroy() {
			if (pressed) pressed.removeAttribute(DRAGGING_ATTR);
			reset();
			node.removeEventListener("pointerdown", onPointerDown);
			node.removeEventListener("contextmenu", onContextMenu);
		}
	};
};
