import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Harness from "./search-toolbar-harness.svelte";

describe("SearchToolbar", () => {
	it("shows how many are shown", async () => {
		render(Harness, { total: 3 });
		await page.getByPlaceholder("Search items").fill("Charlie");
		await expect.element(page.getByText("1 of 3 shown")).toBeVisible();
	});

	it("Escape clears the search", async () => {
		render(Harness, { total: 3 });
		const input = page.getByPlaceholder("Search items");
		await input.fill("Charlie");
		await input.click();
		await userEvent.keyboard("{Escape}");
		await expect.element(input).toHaveValue("");
	});
});
