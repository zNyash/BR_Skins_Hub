import { describe, expect, it } from "vitest";
import { GHOST_CLASS } from "./dnd";

describe("GHOST_CLASS", () => {
	// svelte-dnd-action copies the placeholder's own opacity onto the copy under the pointer,
	// so fading the placeholder element itself makes the dragged item flicker.
	it("never sets opacity on the placeholder element itself", () => {
		const ownClasses = GHOST_CLASS.split(" ").filter((c) => !c.startsWith("[&>*]:"));
		expect(ownClasses.filter((c) => c.startsWith("opacity-"))).toEqual([]);
	});

	// The library hides the placeholder (visibility: hidden); its children must opt back in to be seen.
	it("makes the placeholder's children visible", () => {
		expect(GHOST_CLASS.split(" ")).toContain("[&>*]:visible");
	});
});
