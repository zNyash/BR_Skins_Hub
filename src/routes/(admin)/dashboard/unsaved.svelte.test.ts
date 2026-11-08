import { afterEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Harness from "./unsaved-harness.svelte";
import { unsaved } from "./unsaved.svelte";

afterEach(() => vi.useRealTimers());

describe("unsaved", () => {
	it("runs save once when called twice while pending, and keeps saving until it settles", async () => {
		let finish!: () => void;
		const save = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
		render(Harness, { save });
		expect(unsaved.dirty).toBe(true);

		const first = unsaved.save();
		const second = unsaved.save();
		expect(unsaved.saving).toBe(true);
		expect(save).toHaveBeenCalledTimes(1);

		finish();
		await Promise.all([first, second]);
		expect(unsaved.saving).toBe(false);
	});

	it("shakes for 600ms", () => {
		vi.useFakeTimers();
		render(Harness, { save: async () => {} });
		unsaved.shake();
		expect(unsaved.shaking).toBe(true);
		vi.advanceTimersByTime(599);
		expect(unsaved.shaking).toBe(true);
		vi.advanceTimersByTime(1);
		expect(unsaved.shaking).toBe(false);
	});

	it("reset calls the editor's reset", () => {
		const reset = vi.fn();
		render(Harness, { save: async () => {}, reset });
		unsaved.reset();
		expect(reset).toHaveBeenCalledTimes(1);
	});

	it("shows the bar only while dirty, and is not dirty once the editor is gone", async () => {
		const { unmount } = render(Harness, { save: async () => {}, dirty: true });
		await expect.element(page.getByText("Careful — you have unsaved changes!")).toBeVisible();
		unmount();
		expect(unsaved.dirty).toBe(false);
	});
});
