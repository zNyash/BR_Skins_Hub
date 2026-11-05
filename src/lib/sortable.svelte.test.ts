import { afterEach, describe, expect, it, vi } from "vitest";
import { sortable } from "./sortable";

// Three 100x50 items in a row, 10px apart, at the top-left of the page.
function setup() {
	const node = document.createElement("div");
	node.style.cssText = "position:absolute;left:0;top:0;display:flex;gap:10px";
	for (const label of ["a", "b", "c"]) {
		const item = document.createElement("div");
		item.setAttribute("data-sortable-item", "");
		item.style.cssText = "width:100px;height:50px";
		item.textContent = label;
		if (label === "b") item.innerHTML = `b<button>x</button>`;
		node.appendChild(item);
	}
	document.body.appendChild(node);

	const onMove = vi.fn();
	const action = sortable(node, { onMove })!;
	return { node, items: [...node.children] as HTMLElement[], onMove, action };
}

const pointer = (type: string, target: EventTarget, x: number, y: number) =>
	target.dispatchEvent(
		new PointerEvent(type, {
			bubbles: true,
			button: 0,
			pointerId: 1,
			pointerType: "mouse",
			clientX: x,
			clientY: y
		})
	);

const floatingCopies = () =>
	[...document.body.children].filter((el) => (el as HTMLElement).style.position === "fixed");

afterEach(() => {
	document.body.innerHTML = "";
});

describe("sortable", () => {
	it("doesn't start a drag for a click", () => {
		const { items, onMove } = setup();
		pointer("pointerdown", items[0], 10, 10);
		pointer("pointermove", window, 12, 11);
		pointer("pointerup", window, 12, 11);
		expect(onMove).not.toHaveBeenCalled();
		expect(items[0].hasAttribute("data-dragging")).toBe(false);
		expect(floatingCopies()).toHaveLength(0);
	});

	it("lifts a full-color copy and fades the item while dragging", () => {
		const { items } = setup();
		pointer("pointerdown", items[0], 10, 10);
		pointer("pointermove", window, 30, 10);
		expect(items[0].hasAttribute("data-dragging")).toBe(true);
		const copies = floatingCopies();
		expect(copies).toHaveLength(1);
		expect(copies[0].hasAttribute("data-dragging")).toBe(false);
	});

	it("reports moves by slot, and ignores the gaps", () => {
		const { items, onMove } = setup();
		pointer("pointerdown", items[0], 10, 10);
		pointer("pointermove", window, 105, 10); // gap between slot 0 and 1
		expect(onMove).not.toHaveBeenCalled();
		pointer("pointermove", window, 150, 10); // slot 1
		pointer("pointermove", window, 155, 12); // still slot 1
		pointer("pointermove", window, 250, 10); // slot 2
		expect(onMove.mock.calls).toEqual([
			[0, 1],
			[1, 2]
		]);
	});

	it("moves it back on Escape", () => {
		const { items, onMove } = setup();
		pointer("pointerdown", items[0], 10, 10);
		pointer("pointermove", window, 250, 10);
		const escape = new KeyboardEvent("keydown", { key: "Escape", bubbles: true });
		window.dispatchEvent(escape);
		expect(onMove.mock.calls).toEqual([
			[0, 2],
			[2, 0]
		]);
		expect(escape.defaultPrevented).toBe(true);
	});

	it("never starts a drag from a button inside an item", () => {
		const { items, onMove } = setup();
		pointer("pointerdown", items[1].querySelector("button")!, 120, 10);
		pointer("pointermove", window, 250, 10);
		expect(onMove).not.toHaveBeenCalled();
		expect(floatingCopies()).toHaveLength(0);
	});

	it("removes the copy and the ghost look after the drop", async () => {
		const { items } = setup();
		pointer("pointerdown", items[0], 10, 10);
		pointer("pointermove", window, 150, 10);
		pointer("pointerup", window, 150, 10);
		await new Promise((r) => setTimeout(r, 200));
		expect(floatingCopies()).toHaveLength(0);
		expect(items[0].hasAttribute("data-dragging")).toBe(false);
	});
});
