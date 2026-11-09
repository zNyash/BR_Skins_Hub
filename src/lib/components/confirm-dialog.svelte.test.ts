import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Harness from "./confirm-dialog-harness.svelte";

describe("ConfirmDialog", () => {
	it("stacks above a dialog that was mounted after it", async () => {
		const onAnswer = vi.fn();
		render(Harness, { onAnswer });
		await page.getByRole("button", { name: "Ask" }).click();

		const keep = page.getByRole("button", { name: "Keep editing" });
		await expect.element(keep).toBeVisible();
		const rect = keep.element().getBoundingClientRect();
		const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
		expect(keep.element().contains(hit)).toBe(true);

		await keep.click();
		await vi.waitFor(() => expect(onAnswer).toHaveBeenCalledWith(false));
	});
});
