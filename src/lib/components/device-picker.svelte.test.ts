import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Harness from "./device-picker-harness.svelte";

describe("DevicePicker", () => {
	it("filters rows by the typed text and updates the bound query", async () => {
		render(Harness);
		await page.getByRole("combobox").fill("ctl");
		await expect.element(page.getByText("Wacom CTL-472")).toBeVisible();
		await expect.element(page.getByText("Huion H420X")).not.toBeInTheDocument();
		await expect.element(page.getByTestId("query")).toHaveTextContent("ctl");
		await expect.element(page.getByText("Not listed?")).toBeVisible();
	});

	it("reopens on typing after Escape", async () => {
		render(Harness);
		const input = page.getByRole("combobox");
		await input.click();
		await userEvent.keyboard("{Escape}");
		await expect.element(page.getByText("Huion H420X")).not.toBeInTheDocument();
		await input.fill("hui");
		await expect.element(page.getByText("Huion H420X")).toBeVisible();
	});
});
