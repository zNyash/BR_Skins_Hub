import type { Action } from "svelte/action";

/**
 * Drag-to-resize handle for a side panel, with plain pointer events.
 *
 * Usage: put `use:resizable={{ min, max, value, side, onResize, onCommit }}` on the handle element
 * sitting on the panel's edge. `side` is that edge: "left" for a panel anchored to the right (the
 * editor), which grows when the handle moves left; "right" for a panel anchored to the left (the
 * sidebar), which grows when the handle moves right.
 *
 * `onResize(px)` is called on every move with the clamped width (for a live preview); `onCommit(px)`
 * once when the drag or key press ends: the place to save it. Arrow keys resize by 16px (Shift: 64px)
 * and commit, double-click commits `null` (reset to the default width).
 */

export type ResizableOptions = {
	min: number;
	max: number;
	/** Current width, used as the starting point and for `aria-valuenow`. */
	value: number;
	side: "left" | "right";
	onResize: (px: number) => void;
	/** Called when a resize ends. `null` means "back to the default width". */
	onCommit: (px: number | null) => void;
};

const KEY_STEP_PX = 16;
const KEY_STEP_SHIFT_PX = 64;

export function clampWidth(px: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, px));
}

/** New width after the pointer moved from `startX` to `x`, before clamping. */
export function widthFromPointer(
	startWidth: number,
	startX: number,
	x: number,
	side: "left" | "right"
): number {
	const dx = x - startX;
	return side === "left" ? startWidth - dx : startWidth + dx;
}

export const resizable: Action<HTMLElement, ResizableOptions> = (node, initialOptions) => {
	let options = initialOptions;

	// --- State of the current drag ---
	let pointerId = -1;
	let startX = 0;
	let startWidth = 0;
	let last = 0;

	function applyAria() {
		node.setAttribute("aria-valuemin", String(options.min));
		node.setAttribute("aria-valuemax", String(options.max));
		node.setAttribute("aria-valuenow", String(Math.round(options.value)));
	}

	node.setAttribute("role", "separator");
	node.setAttribute("aria-orientation", "vertical");
	node.setAttribute("tabindex", "0");
	applyAria();

	// --- Pointer ---
	function onPointerDown(event: PointerEvent) {
		if (event.button !== 0 || pointerId !== -1) return;
		event.preventDefault();

		pointerId = event.pointerId;
		startX = event.clientX;
		startWidth = last = options.value;
		node.setPointerCapture(pointerId);
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
	}

	function onPointerMove(event: PointerEvent) {
		if (event.pointerId !== pointerId) return;
		last = clampWidth(
			widthFromPointer(startWidth, startX, event.clientX, options.side),
			options.min,
			options.max
		);
		options.onResize(last);
	}

	function endDrag(event: PointerEvent) {
		if (event.pointerId !== pointerId) return;
		pointerId = -1;
		document.body.style.cursor = "";
		document.body.style.userSelect = "";
		options.onCommit(last);
	}

	// --- Keyboard and reset ---
	function onKeyDown(event: KeyboardEvent) {
		if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
		event.preventDefault();

		const amount = event.shiftKey ? KEY_STEP_SHIFT_PX : KEY_STEP_PX;
		// Moving the handle left grows a "left" panel and shrinks a "right" one.
		const grows = (event.key === "ArrowLeft") === (options.side === "left");
		const next = clampWidth(options.value + (grows ? amount : -amount), options.min, options.max);
		options.onResize(next);
		options.onCommit(next);
	}

	function onDoubleClick() {
		options.onCommit(null);
	}

	node.addEventListener("pointerdown", onPointerDown);
	node.addEventListener("pointermove", onPointerMove);
	node.addEventListener("pointerup", endDrag);
	node.addEventListener("pointercancel", endDrag);
	node.addEventListener("keydown", onKeyDown);
	node.addEventListener("dblclick", onDoubleClick);

	return {
		update(newOptions) {
			options = newOptions;
			applyAria();
		},
		destroy() {
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
			node.removeEventListener("pointerdown", onPointerDown);
			node.removeEventListener("pointermove", onPointerMove);
			node.removeEventListener("pointerup", endDrag);
			node.removeEventListener("pointercancel", endDrag);
			node.removeEventListener("keydown", onKeyDown);
			node.removeEventListener("dblclick", onDoubleClick);
		}
	};
};
