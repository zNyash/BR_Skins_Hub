import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Harness from "./list-pane-harness.svelte";

describe("ListPane", () => {
	it("keeps the editor mounted when the layout crosses the phone breakpoint", async () => {
		const { rerender } = render(Harness, { isDesktop: true });
		const input = page.getByLabelText("Draft");
		await input.fill("unsaved");
		const node = input.element();

		await rerender({ isDesktop: false });
		await expect.element(page.getByRole("dialog", { name: "Editor" })).toBeVisible();
		expect(input.element()).toBe(node);
		expect((node as HTMLInputElement).value).toBe("unsaved");

		await rerender({ isDesktop: true });
		expect(input.element()).toBe(node);
		expect((node as HTMLInputElement).value).toBe("unsaved");
	});
});
